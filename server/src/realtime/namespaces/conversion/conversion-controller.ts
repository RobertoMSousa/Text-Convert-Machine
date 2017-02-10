

const roomName: string =  'mySampleRoom';

function conversionDone(eventInfo: any) {
	const socket: SocketIO.Socket = this;
	console.log('sample');//roberto
	socket.to(roomName).emit('conversion:done', eventInfo);
}


export function handleNamespace(namespace: SocketIO.Namespace) {
	namespace
	.on('connection', (socket) => {
		console.log("new socket connection!"); //roberto

		// Join a room
		socket.join(roomName);

		// Register listeners
		socket.on('conversion:done', conversionDone);


		//disconnect from socket
		socket.on('disconnect', () => {
			//leave the room
			socket.leave(roomName);
		});
	});
}
