var assert = require("chai").assert;
var request = require("supertest");
var server = require("../app");
var app;

describe('Server API Test Suite', function () {
  before(function (done) {
    this.timeout(15000);
    app = server();
    done();
  });

  describe('Server Root API Test', function () {
    it('should return Server running...', function (done) {
      request(app)
        .get("/")
        .end(function (err, res) {
          assert.isTrue(res.text === 'Server running...');
          done();
        });
    });
  });
  describe('/validate POST API Test Suite', function () {
    it('should respond with 404 status code', function (done) {
      request(app)
        .post("/validate")
        .send({'url': ''})
        .end(function (err, res) {
          assert.equal(404, JSON.parse(res.text).statusCode);
          done();
        });
    });

    it('res.statusCode should be 200', function (done) {
      request(app)
        .post("/validate")
        .send({'url': 'http://www.google.com/calendar/ical/49jqotgq8bcgt06tj7040hk2mk%40group.calendar.google.com/public/basic.ics'})
        .end(function (err, res) {
          assert.equal(200, JSON.parse(res.text).statusCode);
          done();
        });
    });

    it('res.statusCode should be 500', function (done) {
      request(app)
        .post("/validate")
        .send({'url': 'http://www.google.com/calendar/abc'})// some random url apart from valid .ics url
        .end(function (err, res) {
          assert.equal(500, JSON.parse(res.text).statusCode);
          done();
        });
    });
  });
});