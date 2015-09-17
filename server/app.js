"use strict";

var express = require('express');
var app = express();
var request = require('request');
var ical = require('ical');

app.get('/validate', function (req, res) {
  ical.fromURL('http://www.google.com/calendar/ical/49jqotgq8bcgt06tj7040hk2mk%40group.calendar.google.com/public/basic.ics', {}, function (err, data) {
    if (err)
      res.send({'statusCode': 500});
    else
      res.send({'statusCode': 200});
  });
});

var server = app.listen(3020, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Converter app listening at http://%s:%s', host, port);
});