"use strict";

//Declare a glocal data object for caching data
var EVENTS_DATA = {};

var express = require('express');
var app = express(),
  bodyParser = require('body-parser'),
  request = require('request'),
  ical2json = require("ical2json"),
  dateParser = require("./Utils");

/* To Allow cross-domain Access-Control*/
var allowCrossDomain = function (req, res, next) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
};

app.use(allowCrossDomain);
// Parsing json and urlencoded requests
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));

app.get('/', function (req, res) {
  res.send("Server running...");
});


// API to validate ical url
app.post('/validate', function (req, res) {
  if (req.body.url) {
    request(req.body.url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var data = ical2json.convert(body);
        if (data && data.VEVENT && data.VEVENT.length)
          res.send({'statusCode': 200});
        else
          res.send({'statusCode': 404});
      } else
        res.send({'statusCode': 500});
    });
  } else
    res.send({'statusCode': 404});
});


// API to fetch events from an ical url
app.post('/events', function (req, res) {
  var limit = req.body.limit || 20;
  var offset = req.body.offset || 0;
  var paginatedListOfEvents = [];
  if (req.body.url) {
    if (EVENTS_DATA[req.body.url]) {
      paginatedListOfEvents = EVENTS_DATA[req.body.url].slice(offset, (offset + limit));
      res.send({
        'statusCode': 200,
        'events': paginatedListOfEvents,
        'totalEvents': EVENTS_DATA[req.body.url].length
      });
    }
    else {
      request(req.body.url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var data = ical2json.convert(body);
          if (data && data.VEVENT && data.VEVENT.length) {
            data.VEVENT = processData(data.VEVENT);
            EVENTS_DATA[req.body.url] = data.VEVENT;
            paginatedListOfEvents = data.VEVENT.slice(offset, (offset + limit));
            res.send({
              'statusCode': 200,
              'events': paginatedListOfEvents,
              'totalEvents': data.VEVENT.length
            });
          }
          else
            res.send({'statusCode': 404, 'events': null});
        } else
          res.send({'statusCode': 500, 'events': null});
      });
    }
  } else
    res.send({'statusCode': 404, 'events': null});
});


// API to fetch single event with given index from an ical url
app.post('/event', function (req, res) {
  var index = req.body.index || 0;
  if (req.body.url) {
    if (EVENTS_DATA[req.body.url] && EVENTS_DATA[req.body.url].length) {
      var event = EVENTS_DATA[req.body.url][index];
      res.send({'statusCode': 200, 'event': event});
    }
    else {
      request(req.body.url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var data = ical2json.convert(body);
          if (data && data.VEVENT && data.VEVENT.length) {
            var event = data.VEVENT[index];
            res.send({'statusCode': 200, 'event': event});
          }
          else
            res.send({'statusCode': 404, 'event': null});
        } else
          res.send({'statusCode': 500, 'event': null});
      });
    }
  } else
    res.send({'statusCode': 404, 'event': null});
});

var server = app.listen(3020, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Server app listening at http://%s:%s', host, port);
});

function processData(events) {
  events.forEach(function (event, index) {
    event = dateParser(event);
  });
  return events;
}
module.exports = function () {
  return server;
};