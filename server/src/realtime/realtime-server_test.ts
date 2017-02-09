import chai = require('chai');
import request = require('supertest');
import mocha = require('mocha');
import db = require('../main-db');
const expect = chai.expect;

describe('Realtime server', function() {

	//before start clean up the DB
	beforeEach(function(done) {
		db.mongosome.dropDatabase(function(err) {
			return done(err);
		});
	});

	it('runs the tests', function(done) {
		done();
	});
});
