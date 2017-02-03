

function configure(callback) {
	const config = require('./config');
	callback();
}

function main(callback) {
	const async = require('async');
	const app = require('./application');
	const http = require('http');
	const os = require('os');
	const fs = require('fs');
	const path = require('path');
	const config = require('./config');

	var myIP = config.get('server:ip');

	if (myIP) {
		console.log('Running on: ' + myIP);
	}

	console.log("Will run set-up scripts...");
	/* Done with all, launch actual server */
	var server = http.createServer(app.app);
	/// Start normally
	server.listen(8000, myIP);
};

/// -----------
configure(err => {
	/// in any case, continue
	console.log('~~~~ launching main server.... ~~~~');
	main(err => {
		console.error(err);
	});
});
