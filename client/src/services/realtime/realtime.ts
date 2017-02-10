

/**
 * A wrapper around SocketIOClient.Socket that adds additional usefull methods like 'emitLimit'
 * Also handles the case when the socket is undefined (eg. error loading socket.io library) bypassing all events.
 */
class AppSocket {
	private lastEmit: {[eventName: string] : number} = {};

	/* _socket is the real io socket instance which should not be used directly.
	 * However I had to make it public cause AppSocketFactory has to be able to call disconnect() on it
	 * Would be nice to have friend classes in Typescript
	*/
	constructor(public _socket: SocketIOClient.Socket) {

	}

	/**
	 * Adds a listener for a particular event. Calling multiple times will add
	 * multiple listeners
	 * @param event The event that we're listening for
	 * @param fn The function to call when we get the event. Parameters depend on the
	 * event in question
	 * @return This Emitter
	 */
	public on(eventName: string, callback?: Function) : AppSocket {
		if (this._socket) {
			this._socket.on(eventName, callback);
		}
		return this;
	}

	/**
	 * An override of the base emit. If we're connected, the
	 * event is sent. Otherwise, it's buffered.
	 *
	 * If the last argument is a function, then it will be called
	 * as an 'ack' when the response is received. The parameter(s) of the
	 * ack will be whatever data is returned from the event
	 * @param event The event that we're emitting
	 * @param data Optional data to be sent with event
	 * @param callback function
	 * @return This Socket
	 */
	public emit(eventName: string, data?: any, callback?: Function) : AppSocket {
		if (this._socket) {
			// console.log('Emit: ' + eventName);
			this._socket.emit(eventName, data, callback);
		}
		return this;
	}


	/**
	 * Like emit but with frequency limit to event emission.
	 * Useful when emit is attached to a very fast event generator (eg. mousemove).
	 *
	 * @param event The event that we're emitting
	 * @param data Optional data to be sent with event
	 * @param frequency maximum frequency of emission for this event
	 * @param callback function
	 * @return This Socket
	 */
	public emitLimit(eventName: string, data?: any, frequency?: number, callback?: Function) : AppSocket {
		var f = frequency || 50;
		var lastEmit = this.lastEmit[eventName] || 0;

		if (Date.now() - lastEmit >= f) {
			this.lastEmit[eventName] = Date.now();
			if (this._socket) {
				this.emit(eventName, data, callback);
			}
		}
		return this;
	}

	/**
	 * Disconnect socket.
	 */
	public disconnect() {
		if (this._socket) {
			this._socket.disconnect();
		}
	}

	/**
	 * Returns whether the socket is connected
	 */
	public connected() : boolean {
		return this._socket ? this._socket.connected : false;
	}

	/**
	 * Returns the namespace the socket is connected to
	 */
	public nsp() : string {
		return this._socket ? this._socket.nsp : undefined;
	}
}

class AppSocketFactory {
	private sockets: {[nsp: string] : AppSocket} = {};
	private lastEmit: {[eventName: string] : number} = {};

	constructor(
		private $rootScope: IAppRootScope,
		private $location: ng.ILocationService,
		private $timeout: ng.ITimeoutService) {
	}

	/**
	 * Connect to a namespace, optionally with additional query parameters.
	 * We reuse the existing instance based on the same scheme/port/host if possible.
	 * Once connected, this method will always return a reference to the previous socket created.
	 *
	 * @param namespace The namespace we want to get the socket for.
	 * @param query Object containing key-value pairs with query parameters to send for connection
	 * @param callback Function called when the connection is established
	 * @return AppSocket
	 */
	public connect(namespace: string, query: any, callback?: (err: Error) => void) : AppSocket {
		// Check if socket.io library has been loaded, otherwise return a mock
		if (!window['io']) {
			if (callback) {
				callback (new Error('Socket.io was not correctly loaded. Check realtime server...'));
			}
			console.log('WARN: requested socket connection but socket.io is not available!');
			this.sockets[namespace] = new AppSocket(null);
			return this.sockets[namespace];
		}
		// Establish connection for the namespace
		// On test environment, socket.io connection point is hardcoded to 'localhost:12345'
		var nsp = namespace || '';
		let options = {
			transports: ['websocket']
		};
		if (query) {
			options['query'] = query;
		}
		var socketWrapper = new AppSocket(io.connect(this.$location.host() + ':3000/'  + nsp, options));
		console.log('Establish new connection: ' + this.$location.host() + ':3000/' + nsp + ' - ' + JSON.stringify(options));
		this.sockets[namespace] = socketWrapper;

		// Callback on connect
		socketWrapper.on('connect',  () => {
			console.log('Connected to socket for ' + socketWrapper.nsp());
			return callback ? callback(null) : true;
		});

		// Callback on error
		socketWrapper.on('error',  (err) => {
			console.error('Unable to connect Socket.IO', err);
			return callback ? callback(err) : false;
		});
		return socketWrapper;
	}

	/**
	 * Get reference to socket connected to a specific namespace.
	 * This can be used to retrieve the socket connection anywhere in the application, once it has been connected.
	 * Important: make sure .connect() has been called before using this! Use .connect() in case there might be race conditions.
	 * @param namespace The namespace we want to get the socket for.
	 * @return AppSocket
	 */
	public of(namespace: string) : AppSocket {
		if (this.sockets[namespace]) {
			return this.sockets[namespace];
		}
		else {
			throw new Error('Should establish a connection for this namespace (socket.connect("' + namespace + '")) before using "of()"');
		}
	}
}

angular.module('AppPlatform.services.realtimeSocket', [])
	.factory('socket', ['$rootScope', '$location', '$timeout', ($rootScope, $location, $timeout) => {
		return new AppSocketFactory($rootScope, $location, $timeout);
	}]);
