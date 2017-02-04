
import express = require('express');
import SampleController = require('./sample-controller');


export module Routes {
	export function sample(): express.Router {
		var router = express.Router();

		router.route('/')
			.get(SampleController.sampleFunc);

		return router;
	}
}
