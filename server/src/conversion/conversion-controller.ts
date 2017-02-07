
import express = require('express');
import mongosome = require('../mongosome');
import apiError = require('../api-helper/api-error');
import Conversion = require('./conversion');
import path = require('path');
import fs = require('fs');
import kue = require('kue');

const render = require('render-quill');
const pdf = require('html-pdf');
const queue = kue.createQueue();

queue.process('html', 1000, function(job, done) {
	setTimeout(function() {
		convertToHTML(job.data);
		done();
	}, 100);
});

queue.process('pdf', undefined, function(job, done) {
	setTimeout(function() {
		convertToPDF(job.data);
		done();
	}, 100000);
});

//function that convert the rich text to a html file
function convertToHTML(doc: any): void {
	//convert the quill delta to html
	render(doc.delta, (err, output) => {
		// create and store the html file on the public folder

		//set the upload dir as /public/uploads
		const uploadDir = path.join(__dirname, '../../../', './uploads');
		//if the folder still don't exist create it
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir);
		}
		//set the name of the file
		const targetPath = path.join(uploadDir, doc._id.toString() + '.html');

		//create teh writing stream
		const stream = fs.createWriteStream(targetPath, {
			flags: 'wx'
		});

		//once stream open write the content on the file
		stream.once('open', () => {
			stream.write(output);

			//update file status on the db and write down the file url
			const query: Object = { _id: mongosome.objectIDfromHexString(doc._id) };
			const update: Object = {
				'$set': {
					'status': 'complete', 'url': '../uploads/' + doc._id.toString() + '.html'
				}
			};
			Conversion.collection.findOneAndUpdate(query, update, {}, (err: Error, result: any) => { });
		});
		return;
	});
}


//function that convert the rich text to a pdf file
function convertToPDF(doc: any): void {
	//convert the quill delta to html
	render(doc.delta, (err, output) => {
		// create and store the html file on the public folder

		//set the upload dir as /public/uploads
		const uploadDir = path.join(__dirname, '../../../', './uploads');
		const targetPath = path.join(uploadDir, doc._id.toString() + '.pdf');
		//if the folder still don't exist create it
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir);
		}
		pdf.create(output, { format: 'Letter' }).toFile(targetPath, function(err, res) {
			if (err) {
				return console.log(err);
			}
			//update the file status on the DB
			const query: Object = { _id: mongosome.objectIDfromHexString(doc._id) };
			const update: Object = {
				'$set': { 'status': 'complete', 'url': targetPath }
			};
			Conversion.collection.findOneAndUpdate(query, update, {}, (err: Error, result: any) => { });
		});
		return;
	});
}


// function responsible to create and store the document that will be converted
export function conversionFunc(req: express.Request, res: express.Response): void {
	// build the document and store on the DB
	const document: Conversion.IConversionSetDocument = {
		documentId: new mongosome.ObjectID(),
		type: req.body.type,
		title: req.body.title,
		delta: req.body.delta,
		created: new Date(Date.now()),
		status: 'progress',
		version: 1 // since is the creation is the version one
	};

	Conversion.collection.insert(document, (error, result: mongosome.IInsertResult<Conversion.IConversionSetDocument>) => {
		if (error) {
			return apiError.DatabaseError.sendError(res, error);
		}
		// add the file to the store convertion queue
		if (document.type === 'HTML') {
			queue.create('html', document).priority('high').save();
		}
		else {
			if (document.type === 'PDF') {
				queue.create('pdf', document).priority('normal').save();
			}
		}
		res.sendStatus(200);
	});
}


// get the list of files that are stored omn the DB
export function getFiles(req: express.Request, res: express.Response): void {
	Conversion.collection.find({}).toArray((err: Error, files: Array<Conversion.IConversionSetDocument>) => {
		if (err) {
			return apiError.DatabaseError.sendError(res, err);
		}
		res.json({ files: files }); //create object on the fly if does not exists
		return;
	});
}


//download the file based on the id
export function downloadFile(req: express.Request, res: express.Response): void {
	console.log('req.parms-->', req.params);//roberto
	// const filePath = path.join(__dirname, '../../../public/', './uploads/');
	const fileName = req.params.id + '.' + req.params.type.toLowerCase();
	console.log('filename-->', fileName);//roberto
	res.download('./uploads/' + fileName, 'sample.html', function(err) {
		if (err) {
			console.log('err:', err);//roberto
		} else {
			console.log('it will download');//roberto
		}
	});
	return;
}
