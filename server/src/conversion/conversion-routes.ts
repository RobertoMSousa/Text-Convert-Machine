
import express = require('express');
import ConversionController = require('./conversion-controller');


export module Routes {
	export function conversion(): express.Router {
		var router = express.Router();

		router.route('/')
			.put(ConversionController.conversionFunc)
			.get(ConversionController.getFiles);

		router.route('/:type/:id/download')
			.get(ConversionController.downloadFile);

		return router;
	}
}
