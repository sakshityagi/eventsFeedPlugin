"use strict";

//Declare a global data object for caching events
var EVENTS_DATA = {};

//Declare a global variable to save the time when events were cached last time. Refresh events after one day.
var Last_EVENT_SYNC_TIME = +new Date();

var express = require('express');
var app = express(),
  bodyParser = require('body-parser'),
  request = require('request'),
  ical2json = require("ical2json"),
  dateParser = require("./Utils"),
  async = require("async");

/* To Allow cross-domain Access-Control*/
var allowCrossDomain = function (req, res, next) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
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
  var currentTime = +new Date();
  var limit = req.body.limit || 10;
  var offset = req.body.offset || 0;
  var isSyncThresholdCrossed = ((currentTime - Last_EVENT_SYNC_TIME) >= (1000 * 60 * 60 * 24));
  var paginatedListOfEvents = [];

  if(isSyncThresholdCrossed) {
    Last_EVENT_SYNC_TIME = currentTime;
  }

  if (req.body.url) {
    if (EVENTS_DATA[req.body.url] && !isSyncThresholdCrossed) {
      returnEventIndexFromCurrentDate(EVENTS_DATA[req.body.url], req.body.date, function (index) {
        if (index != -1) {
          paginatedListOfEvents = EVENTS_DATA[req.body.url].slice(offset + index, (offset + index + limit));
          res.send({
            'statusCode': 200,
            'events': paginatedListOfEvents,
            'totalEvents': EVENTS_DATA[req.body.url].length - index
          });
        } else {
          res.send({
            'statusCode': 404,
            'events': null,
            'totalEvents': 0
          });
        }
      });
    }
    else {
      request(req.body.url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var data = ical2json.convert(body);
          if (data && data.VEVENT && data.VEVENT.length) {
            var mergedEvents = data.VCALENDAR[0].VEVENT.concat(data.VEVENT);
            processData(mergedEvents, function (events) {
              mergedEvents = events;
              mergedEvents = mergedEvents.sort(function (a, b) {
                return a.startDate - b.startDate;
              });
              EVENTS_DATA[req.body.url] = mergedEvents;
              returnEventIndexFromCurrentDate(mergedEvents, req.body.date, function (index) {
                if (index != -1) {
                  paginatedListOfEvents = mergedEvents.slice(offset + index, (offset + index + limit));
                  res.send({
                    'statusCode': 200,
                    'events': paginatedListOfEvents,
                    'totalEvents': mergedEvents.length - index
                  });
                } else {
                  res.send({
                    'statusCode': 404,
                    'events': null,
                    'totalEvents': 0
                  });
                }
              });
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
  var currentTime = +new Date();
  var index = req.body.index || 0;
  var isSyncThresholdCrossed = ((currentTime - Last_EVENT_SYNC_TIME) >= (1000 * 60 * 60 * 24));

  if(isSyncThresholdCrossed) {
    Last_EVENT_SYNC_TIME = currentTime;
  }

  if (req.body.url) {
    if (EVENTS_DATA[req.body.url] && EVENTS_DATA[req.body.url].length && !isSyncThresholdCrossed) {
      returnEventIndexFromCurrentDate(EVENTS_DATA[req.body.url], req.body.date, function (indexOfCurrentDateEvent) {
        if (index != -1) {
          var event = EVENTS_DATA[req.body.url][Number(index) + indexOfCurrentDateEvent];
          res.send({'statusCode': 200, 'event': event});
        } else {
          res.send({'statusCode': 404, 'event': null});
        }
      });
    }
    else {
      request(req.body.url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var data = ical2json.convert(body);
          if (data && data.VEVENT && data.VEVENT.length) {
            var mergedEvents = data.VCALENDAR[0].VEVENT.concat(data.VEVENT);
            processData(mergedEvents, function (events) {
              mergedEvents = events;
              mergedEvents = mergedEvents.sort(function (a, b) {
                return a.startDate - b.startDate;
              });
              EVENTS_DATA[req.body.url] = mergedEvents;
              returnEventIndexFromCurrentDate(mergedEvents, req.body.date, function (indexOfCurrentDateEvent) {
                if (index != -1) {
                  var event = mergedEvents[Number(index) + indexOfCurrentDateEvent];
                  res.send({'statusCode': 200, 'event': event});
                } else {
                  res.send({'statusCode': 404, 'event': null});
                }
              });
            });
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

function processData(events, callback) {
  async.each(events, function (event, cb) {
    event = dateParser(event);
    cb();
  }, function () {
    callback(events);
  });
}

// Method to get index from which the events from current date onwards start

function returnEventIndexFromCurrentDate(events, date, callback) {
  var currentDate = date || +new Date(),
    eventIndex = -1;
  async.forEachOf(events, function (event, index, cb) {
    if (event.startDate >= currentDate) {
      eventIndex = index;
      cb("error");
    } else cb();
  }, function () {
    callback(eventIndex);
  });
}


module.exports = function () {
  return server;
};