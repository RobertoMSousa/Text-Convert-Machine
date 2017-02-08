
import chai = require('chai');
import app = require('../application');
import db = require('../main-db');
import mongosome = require('../mongosome');
import Conversion = require('./conversion');
var expect = chai.expect;

describe('conversion API', function() {

	//before start clean up the DB
	beforeEach(function(done) {
		db.mongosome.dropDatabase(function(err) {
			return done(err);
		});
	});

	it('should do some test', function(done) {
		return done();
	});

	it('should do another test', function(done) {
		return done();
	});

});
