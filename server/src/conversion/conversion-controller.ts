
import express = require('express');
import mongosome = require('../mongosome');
import Sample = require('./conversion');


export function conversionFunc(req: express.Request, res: express.Response): void {
	res.sendStatus(200);
}
