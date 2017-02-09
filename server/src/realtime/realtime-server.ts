
import cache = require('../redis_cache');

/// export forces it into module namespace

export function configureRealtime(callback) {
	const config = require('../config');

	cache.configure(err => {
		callback(err);
	});

}

export function mainRealtime(callback) {
	const handler = require('./realtime-server-handlers');
	handler.main(callback);
};

configureRealtime(err => {
	console.log('~~~ launching realtime server... ~~~');
	mainRealtime(err => {
		console.error(err);
	});
});
