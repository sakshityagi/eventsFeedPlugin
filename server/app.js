"use strict";

var express = require('express');
var app = express(),
  bodyParser = require('body-parser'),
  request = require('request'),
  ical2json = require("ical2json");

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
  request(req.body.url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = ical2json.convert(body);
      if (data && data.VEVENT && data.VEVENT.length)
        res.send({'statusCode': 200});
      else
        res.send({'statusCode': 404});
    } else
      res.send({'statusCode': 500});
  })
});


// API to fetch events from an ical url
app.post('/events', function (req, res) {
  request(req.body.url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = ical2json.convert(body);
      if (data && data.VEVENT && data.VEVENT.length)
        res.send({'statusCode': 200, 'events': data.VEVENT});
      else
        res.send({'statusCode': 404, 'events': null});
    } else
      res.send({'statusCode': 500, 'events': null});
  })
});


var server = app.listen(3020, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Server app listening at http://%s:%s', host, port);
});