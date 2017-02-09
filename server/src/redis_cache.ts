import config = require('./config');
import redis = require('redis');

export const Redis = {
	client: undefined
};

export function configure(callback) {
	const url = config.get('Redis:endpoint');
	const options = {
	};
	if (Redis.client) {
		return callback();
	}
	Redis.client = redis.createClient(url, options);
	Redis.client.on('error', err => {
		console.error(err);
	});
	Redis.client.on('ready', () => {
		console.log('connected to redis');
		callback();
	});
}
