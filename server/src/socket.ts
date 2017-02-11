import http = require('http');
import SocketIO = require('socket.io');
const config = require('./config');
const app = require('./application');


export var socket: SocketIO.Socket;

const roomName: string = 'mySampleRoom';
const redisAdapter = require('socket.io-redis');
import redis = require('redis');
const server = http.createServer(app.app);                      // Create server
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

io.of('/conversion')
	.on('connection', (skt) => {
		console.log("new socket connection sample!"); //roberto
		// console.log('skt-->', skt);//roberto
		socket = skt;
		// console.log('socket-->', socket);//roberto
		// Join a room
		socket.join(roomName);

		//disconnect from socket
		socket.on('disconnect', () => {
			//leave the room
			socket.leave(roomName);
		});
	});

var port = (process.env.PORT) ? process.env.PORT : 3000;

console.log("Start realtime-server on port " + port);
server.listen(port);
