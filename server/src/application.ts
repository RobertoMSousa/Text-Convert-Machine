require('source-map-support').install();

import express = require('express');
import path = require('path');
import bodyParser = require('body-parser');
import converionRoutes = require('./conversion/conversion-routes');

var publicDir = path.join(__dirname, '/../../public/');

export var app = <express.Express>express();

/* Static serving of client artifacts */
app.use('/js/',
	express.static(path.join(publicDir, 'js')));
app.use('/css/',
	express.static(path.join(publicDir, 'css')));
app.use('/components/',
	express.static(path.join(publicDir, 'components')));
app.use('/views/',
	express.static(path.join(publicDir, 'views')));
app.use('/services/',
	express.static(path.join(publicDir, 'services')));
app.use('/img/',
	express.static(path.join(publicDir, 'img')));
app.use('/widgets/',
	express.static(path.join(publicDir, 'widgets')));
app.use('/doc/',
	express.static(path.join(publicDir, 'doc')));

app.get('/', function(req, res) {
	res.sendFile(path.join(publicDir, 'base.html'));
});

app.use('/api/conversion', converionRoutes.Routes.conversion());
