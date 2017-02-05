
import express = require('express');
import mongosome = require('../mongosome');
import apiError = require('../api-helper/api-error');
import Conversion = require('./conversion');


export function conversionFunc(req: express.Request, res: express.Response): void {
	console.log('body-->', req.body);//roberto

	var document: Conversion.IConversionSetDocument = {
		documentId: new mongosome.ObjectID(),
		delta: req.body
	};

	Conversion.collection.insert(document, (error, result: mongosome.IInsertResult<Conversion.IConversionSetDocument>) => {
		if (error) {
			return apiError.DatabaseError.sendError(res, error);
		}
		res.sendStatus(200);
	});
}
