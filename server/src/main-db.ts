
import config = require('./config');
import m = require('./mongosome');

export var mongosome = new m.Mongosome(
	process.env.TESTING ? config.get('db:testhost') : config.get('db:host')
);
