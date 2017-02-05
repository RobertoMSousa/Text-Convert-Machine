
import express = require('express');
import mongosome = require('../mongosome');
import apiError = require('../api-helper/api-error');
import Conversion = require('./conversion');
import render = require('render-quill');
import path = require('path');
import fs = require('fs');
import pdf = require('html-pdf');



//function that convert the rich text to a html file
function convertToHTML(doc: Conversion.IConversionSetDocument): void {
	//convert the quill delta to html
	render(doc.delta, (err, output) => {
		// create and store the html file on the public folder

		//set the upload dir as /public/uploads
		const uploadDir = path.join(__dirname, '../../../public', './uploads');
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
		});
		return;
	});
}


//function that convert the rich text to a pdf file
function convertToPDF(doc: Conversion.IConversionSetDocument): void {
	//convert the quill delta to html
	render(doc.delta, (err, output) => {
		// create and store the html file on the public folder

		//set the upload dir as /public/uploads
		const uploadDir = path.join(__dirname, '../../../public', './uploads');
		const targetPath = path.join(uploadDir, doc._id.toString() + '.pdf');
		//if the folder still don't exist create it
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir);
		}
		pdf.create(output, { format: 'Letter' }).toFile(targetPath, function(err, res) {
			if (err) {
				return console.log(err);
			}
			console.log(res); // file name
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
		version: 1 // since is the creation is the version one
	};

	Conversion.collection.insert(document, (error, result: mongosome.IInsertResult<Conversion.IConversionSetDocument>) => {
		if (error) {
			return apiError.DatabaseError.sendError(res, error);
		}
		// add the file to the store convertion queue
		if (document.type === 'HTML') {
			setTimeout(function() {
				convertToHTML(document);
			}, 1000);
		}
		else {
			if (document.type === 'PDF') {
				setTimeout(function() {
					convertToPDF(document);
				}, 10000);
			}
		}
		res.sendStatus(200);
	});
}
