
import express = require('express');
import http = require('http');
import config = require('../config');
const redisAdapter = require('socket.io-redis');
import mongosome = require('../mongosome');
import redis = require('redis');
import SocketIO = require('socket.io');
import SocketIOClient = require('socket.io-client');
import Conversion = require('./namespaces/conversion/conversion-controller');

export function main(callback) {
	const app = express();                                      // Get express
	const server = http.createServer(app);                      // Create server
	const io: SocketIO.Server = require('socket.io')(server, {
		transports: ['websocket']
	});


	/// We need additional Redis endpoints for Pub/Sub:
	const redisUrl = config.get('Redis:endpoint');
	const redisOpt = {
		return_buffers: true
	};
	const adapter = redisAdapter({
		pubClient: redis.createClient(redisUrl, redisOpt),
		subClient: redis.createClient(redisUrl, redisOpt)
	});
	adapter.pubClient.on('error', err => {
		console.log('!! pubClient error');
		console.error(err);
	});
	adapter.subClient.on('error', err => {
		console.log('!! subClient error');
		console.error(err);
	});
	io.adapter(adapter);


	// Declare controllers responsible to handle each namespace
	Conversion.handleNamespace(io.of('conversion'));


	var port = (process.env.PORT) ? process.env.PORT : 3000;
	console.log("Start realtime-server on port " + port);
	server.listen(port);
};
