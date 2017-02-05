
import express = require('express');
import mongosome = require('../mongosome');
import apiError = require('../api-helper/api-error');
import Conversion = require('./conversion');
import render = require('render-quill');
import path = require('path');
import fs = require('fs');



//function that convert the rich text to a html file
function convertToHTML(doc: Conversion.IConversionSetDocument, callback: (err: Error) => void): void {
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

		callback(null);
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
			convertToHTML(document, (err) => {
				if (err) {
					return;
				}
			});
		}
		else {
			if (document.type === 'PDF') {
			}
		}
		res.sendStatus(200);
	});
}
