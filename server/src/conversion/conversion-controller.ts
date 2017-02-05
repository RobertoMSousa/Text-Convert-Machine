
import express = require('express');
import mongosome = require('../mongosome');
import apiError = require('../api-helper/api-error');
import Conversion = require('./conversion');


// function responsible to create and store the document that will be converted
export function conversionFunc(req: express.Request, res: express.Response): void {
	// build the document and store on the DB
	var document: Conversion.IConversionSetDocument = {
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
		res.sendStatus(200);
	});
}
