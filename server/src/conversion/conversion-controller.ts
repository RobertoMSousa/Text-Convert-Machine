
import express = require('express');
import mongosome = require('../mongosome');
import Sample = require('./conversion');


export function conversionFunc(req: express.Request, res: express.Response): void {
	console.log('req.body-->', req.body);//roberto
	res.sendStatus(200);
}
