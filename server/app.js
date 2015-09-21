"use strict";

var express = require('express');
var app = express(),
  bodyParser = require('body-parser');
var ical = require('ical');

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
  ical.fromURL(req.body.url, {}, function (err, data) {
    console.log("*********************", data);
    if (err)
      res.send({'statusCode': 500});
    else
      res.send({'statusCode': 200});
  });
});


// API to fetch events from an ical url
app.post('/events', function (req, res) {
  ical.fromURL(req.body.url, {}, function (err, data) {
    if (err)
      res.send({'statusCode': 500});
    else {
      res.send({'statusCode': 200});
    }
  });
});


var server = app.listen(3020, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Server app listening at http://%s:%s', host, port);
});