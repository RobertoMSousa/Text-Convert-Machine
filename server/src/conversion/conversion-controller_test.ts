
import chai = require('chai');
import mocha = require('mocha');
import app = require('../application');
import db = require('../main-db');
import mongosome = require('../mongosome');
import Conversion = require('./conversion');
import request = require('supertest');
var expect = chai.expect;

describe.only('conversion API', function() {

	//before start clean up the DB
	beforeEach(function(done) {
		db.mongosome.dropDatabase(function(err) {
			return done(err);
		});
	});

	it('create html file conversion', function(done) {
		const file = {
			type: 'HTML',
			title: 'sample',
			delta: 'sampleDelta'
		};
		request(app.app)
		.put('/api/conversion')
		.set('Content-type', 'application/json')
		.send(JSON.stringify(file))
		.expect(200)
		.end(done);
	});

	it('create pdf file conversion', function(done) {
		const file = {
			type: 'PDF',
			title: 'sample',
			delta: 'sampleDelta'
		};
		request(app.app)
		.put('/api/conversion')
		.set('Content-type', 'application/json')
		.send(JSON.stringify(file))
		.expect(200)
		.end(done);
	});

	it('create a conversion of a non valid file', function(done) {
		const file = {
			type: 'FILE',
			title: 'sample',
			delta: 'sampleDelta'
		};
		request(app.app)
		.put('/api/conversion')
		.set('Content-type', 'application/json')
		.send(JSON.stringify(file))
		.expect(403)
		.end(done);
	});

	it('create a coversion without sending params', function(done) {
		const file = {};
		request(app.app)
		.put('/api/conversion')
		.set('Content-type', 'application/json')
		.send(JSON.stringify(file))
		.expect(400)
		.end(done);
	});

	it.skip('create a conversion to pdf and get it back', function(done) {
		const file = {
			type: 'PDF',
			title: 'sample',
			delta: 'sampleDelta'
		};
		request(app.app)
		.put('/api/conversion')
		.set('Content-type', 'application/json')
		.send(JSON.stringify(file))
		.end(function(err, res) {
			if (err) {
				return done(err);
			}
			setTimeout(function() {
				request(app.app)
				.get('/api/conversion')
				.end(function(err, res) {
					if (err) {
						done(err);
						return;
					}
					chai.expect(res.body.files.length).to.be.equal(1);
					chai.expect(res.body.files[0].type).to.be.equal('PDF');
					chai.expect(res.body.files[0].type).to.be.equal('sample');
					done();
					return;
				});
			}, 100); // 100 seconds
		});
	});

	it.skip('create a conversion to html and get it back', function(done) {
		const file = {
			type: 'HTML',
			title: 'sample',
			delta: 'sampleDelta'
		};
		request(app.app)
		.put('/api/conversion')
		.set('Content-type', 'application/json')
		.send(JSON.stringify(file))
		.end(function(err, res) {
			if (err) {
				return done(err);
			}
			setTimeout(function() {
				request(app.app)
				.get('/api/conversion')
				.end(function(err, res) {
					if (err) {
						done(err);
						return;
					}
					chai.expect(res.body.files.length).to.be.equal(1);
					chai.expect(res.body.files[0].type).to.be.equal('HTML');
					chai.expect(res.body.files[0].type).to.be.equal('sample');
					done();
					return;
				});
			}, 100); //10 seconds
		});
	});


});
