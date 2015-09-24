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

  // test case for checking if server is up

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

  // test case for validating ical url api

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

  // test case for fetching events from ical url

  describe('/events POST API Test Suite', function () {
    it('should respond with 404 status code and null events', function (done) {
      request(app)
        .post("/events")
        .send({'url': ''})
        .end(function (err, res) {
          assert.equal(404, JSON.parse(res.text).statusCode);
          assert.isNull(JSON.parse(res.text).events, "Events list should be an array");
          done();
        });
    });

    it('res.statusCode should be 200 and array of events', function (done) {
      request(app)
        .post("/events")
        .send({'url': 'http://www.google.com/calendar/ical/49jqotgq8bcgt06tj7040hk2mk%40group.calendar.google.com/public/basic.ics'})
        .end(function (err, res) {
          assert.equal(200, JSON.parse(res.text).statusCode);
          assert.isArray(JSON.parse(res.text).events, "Events list should be an array");
          assert.isNumber(JSON.parse(res.text).totalEvents, "Total number of events should be a number");
          done();
        });
    });

    it('res.statusCode should be 500 and null events', function (done) {
      request(app)
        .post("/events")
        .send({'url': 'http://www.google.com/calendar/abc'})// some random url apart from valid .ics url
        .end(function (err, res) {
          assert.equal(500, JSON.parse(res.text).statusCode);
          assert.isNull(JSON.parse(res.text).events, "Events list should be an array");
          done();
        });
    });
  });

  // test case for fetching single event with given index from ical url

  describe('/event POST API Test Suite', function () {
    it('should respond with 404 status code and null event', function (done) {
      request(app)
        .post("/event")
        .send({'url': '','index': 1})
        .end(function (err, res) {
          assert.equal(404, JSON.parse(res.text).statusCode);
          assert.isNull(JSON.parse(res.text).event, "Event should be an object");
          done();
        });
    });

    it('res.statusCode should be 200 and a single object of event', function (done) {
      request(app)
        .post("/event")
        .send({
          'url': 'http://www.google.com/calendar/ical/49jqotgq8bcgt06tj7040hk2mk%40group.calendar.google.com/public/basic.ics',
          'index': 1
        })
        .end(function (err, res) {
          assert.equal(200, JSON.parse(res.text).statusCode);
          assert.isObject(JSON.parse(res.text).event, "Event should be an object");
          done();
        });
    });

    it('res.statusCode should be 500 and null event', function (done) {
      request(app)
        .post("/event")
        .send({'url': 'http://www.google.com/calendar/abc','index': 1})// some random url apart from valid .ics url
        .end(function (err, res) {
          assert.equal(500, JSON.parse(res.text).statusCode);
          assert.isNull(JSON.parse(res.text).event, "Event should be an object");
          done();
        });
    });
  });
});