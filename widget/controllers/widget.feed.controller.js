'use strict';

(function (angular) {
  angular.module('eventsFeedPluginWidget')
    .controller('WidgetFeedCtrl', ['$scope', 'DataStore', 'TAG_NAMES', 'STATUS_CODE', 'Location', 'LAYOUTS', 'CalenderFeedApi', 'PAGINATION', 'Buildfire', '$rootScope',
      function ($scope, DataStore, TAG_NAMES, STATUS_CODE, Location, LAYOUTS, CalenderFeedApi, PAGINATION, Buildfire, $rootScope) {
        /*variable declaration*/
        var WidgetFeed = this;
        var currentFeedUrl = "";
        var currentDate = new Date();
        var formattedDate = currentDate.getFullYear() + "-" + moment(currentDate).format("MM") + "-" + ("0" + currentDate.getDate()).slice(-2) + "T00:00:00";
        var timeStampInMiliSec = +new Date(formattedDate);
        $rootScope.selectedDate = timeStampInMiliSec;

        /*Variable declaration to store the base or initial data*/
        $scope.toggles = [{state: true}, {state: false}, {state: true}];
        $scope.events = [];
        WidgetFeed.googleCalEvent = {
          'summary': '',
          'location': '',
          'description': '',
          'start': {
            'dateTime': '',
            'timeZone': ''
          },
          'end': {
            'dateTime': '',
            'timeZone': ''
          },
          'recurrence': [
            'RRULE:FREQ=DAILY;COUNT=2'
          ],
          'attendees': [
            {'email': 'lpage@example.com'}
          ],
          'reminders': {
            'useDefault': false,
            'overrides': [
              {'method': 'email', 'minutes': 24 * 60}
            ]
          }
        };
        WidgetFeed.eventsAll= [];
        WidgetFeed.swiped = [];
        WidgetFeed.data = null;
        WidgetFeed.events = [];
        WidgetFeed.busy = false;
        WidgetFeed.offset = 0;
        /*This object is storing the base data for iCal calendar*/
        WidgetFeed.iCalEvent = {
          VERSION: 2.0,
          PRODID: "",
          "BEGIN": "VEVENT",
          DTSTAMP: "20151012T130000Z",
          "ORGANIZER;CN=Organizer": "MAILTO:Organizer e-mail",
          STATUS: "CONFIRMED",
          UID: "ATE1443440406",
          DTSTART: "20151012T130000Z",
          DTEND: "20151012T150000Z",
          SUMMARY: "Summary of the event",
          DESCRIPTION: "Description of the event",
          "X-ALT-DESC;FMTTYPE=text/html": "Description of the event",
          LOCATION: "Location of the event",
          END: "VEVENT"
        };

        /*
         * Fetch user's data from datastore
         */
        var init = function () {
          var success = function (result) {
              WidgetFeed.data = result.data;
              if (!WidgetFeed.data.content)
                WidgetFeed.data.content = {};
              if (!WidgetFeed.data.design)
                WidgetFeed.data.design = {};
              if (!WidgetFeed.data.design.itemDetailsLayout) {
                WidgetFeed.data.design.itemDetailsLayout = LAYOUTS.itemDetailsLayout[0].name;
              }
              if (WidgetFeed.data.content.feedUrl)
                currentFeedUrl = WidgetFeed.data.content.feedUrl;
            }
            , error = function (err) {
              if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                console.error('Error while getting data', err);
              }
            };
          DataStore.get(TAG_NAMES.EVENTS_FEED_INFO).then(success, error);
        };

        /*This is used to fetch the data from the Calendar API*/
        var getFeedEvents = function (url, date) {
          Buildfire.spinner.show();
          var success = function (result) {
              Buildfire.spinner.hide();
              console.log("??????????????????????", result);
              WidgetFeed.events = WidgetFeed.events.length ? WidgetFeed.events.concat(result.events) : result.events;
              WidgetFeed.offset = WidgetFeed.offset + PAGINATION.eventsCount;
              if (WidgetFeed.events.length < result.totalEvents) {
                WidgetFeed.busy = false;
              }
            }
            , error = function (err) {
              Buildfire.spinner.hide();
              console.error('Error In Fetching events', err);
            };
          CalenderFeedApi.getFeedEvents(url, date, WidgetFeed.offset).then(success, error);
        };
        /*This method will give the current date*/
        $scope.today = function () {
          $scope.dt = new Date();
        };
        /**
         * DataStore.onUpdate() is bound to listen any changes in datastore
         */
        var onUpdateCallback = function (event) {
          if (event && event.tag === TAG_NAMES.EVENTS_FEED_INFO) {
            WidgetFeed.data = event.data;
            if (!WidgetFeed.data.design)
              WidgetFeed.data.design = {};
            if (!WidgetFeed.data.content)
              WidgetFeed.data.content = {};
            if (!WidgetFeed.data.design.itemDetailsLayout) {
              WidgetFeed.data.design.itemDetailsLayout = LAYOUTS.itemDetailsLayout[0].name;
            }

            if (!WidgetFeed.data.content.feedUrl) {
              WidgetFeed.events = [];
              WidgetFeed.busy = false;
            } else if (currentFeedUrl != WidgetFeed.data.content.feedUrl) {
              getFeedEvents(WidgetFeed.data.content.feedUrl, timeStampInMiliSec);
            }
          }
        };
        DataStore.onUpdate().then(null, null, onUpdateCallback);

        /*This method is to use to plot the event on to calendar*/
        $scope.getDayClass = function (date, mode) {
          if (mode === 'day') {
            var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

            for (var i = 0; i < $scope.events.length; i++) {
              var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

              if (dayToCheck === currentDay) {
                return $scope.events[i].status;
              }
            }
          }

          return '';
        };

        /*This method is use to swipe left and right the event*/
        WidgetFeed.addEvents = function (e, i, toggle) {
          toggle ? WidgetFeed.swiped[i] = true : WidgetFeed.swiped[i] = false;
        };

        /*This method is called when we click to add an event to native calendar*/
        WidgetFeed.addEventsToCalendar = function (event) {
          WidgetFeed.Keys = Object.keys(event);
          WidgetFeed.startTimeZone = WidgetFeed.Keys[0].split('=');
          WidgetFeed.endTimeZone = WidgetFeed.Keys[1].split('=');
          /*Add to calendar event will add here*/
            if(buildfire.device && buildfire.device.calendar) {
            buildfire.device.calendar.addEvent(
                {
                  title: event.DESCRIPTION
                  , location: event.LOCATION
                  , notes: event.SUMMARY
                  , startDate: new Date(event[WidgetFeed.Keys[0]])
                  , endDate: new Date(event[WidgetFeed.Keys[1]])
                  , options: {
                  firstReminderMinutes: 120
                  , secondReminderMinutes: 5
                  , recurrence: 'Yearly'
                  , recurrenceEndDate: new Date(2025, 6, 1, 0, 0, 0, 0, 0)
                }
                }
                ,
                function (err, result) {
                  alert("Done");
                  if (err)
                    alert("******************"+err);
                  else
                    alert('worked ' + JSON.stringify(result));
                }
            );
          }
          console.log(">>>>>>>>",event);
        };

        /*This method is used to get the event from the date where we clicked on calendar*/
        WidgetFeed.getEventDate = function (date) {
          WidgetFeed.events = [];
          WidgetFeed.offset = 0;
          WidgetFeed.busy = false;
          formattedDate = date.getFullYear() + "-" + moment(date).format("MM") + "-" + ("0" + date.getDate()).slice(-2) + "T00:00:00";
          timeStampInMiliSec = +new Date(formattedDate);
          $rootScope.selectedDate = timeStampInMiliSec;
          WidgetFeed.loadMore();
        };

        /*This method is used to load the from Datastore*/
        WidgetFeed.loadMore = function () {
          if (WidgetFeed.busy) return;
          WidgetFeed.busy = true;
          if (WidgetFeed.data.content.feedUrl)
            getFeedEvents(WidgetFeed.data.content.feedUrl, timeStampInMiliSec);
          var successAll = function (resultAll) {
                console.log("#################", resultAll);
                WidgetFeed.eventsAll = resultAll.events;
              }
              , errorAll = function (errAll) {
                console.error('Error In Fetching events', errAll);
              };
          CalenderFeedApi.getFeedEvents(WidgetFeed.data.content.feedUrl).then(successAll, errorAll);
     };

        /**
         * init() function invocation to fetch previously saved user's data from datastore.
         */

        init();

        $scope.today();

        $scope.getDayClass = function (date, mode) {

          var dayToCheck = new Date(date).setHours(0, 0, 0, 0);
          var currentDay;
          for (var i = 0; i < WidgetFeed.eventsAll.length; i++) {
            currentDay = new Date(WidgetFeed.eventsAll[i].startDate).setHours(0, 0, 0, 0);
            if (dayToCheck === currentDay) {
              return 'eventDate';
            }
          }
        };

        $scope.$on("$destroy", function () {
          DataStore.clearListener();
        });
      }]);
})(window.angular);
