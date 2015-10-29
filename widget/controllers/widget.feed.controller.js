'use strict';

(function (angular) {
  angular.module('eventsFeedPluginWidget')
    .controller('WidgetFeedCtrl', ['$scope', 'DataStore', 'TAG_NAMES', 'STATUS_CODE', 'Location', 'LAYOUTS', 'CalenderFeedApi', 'PAGINATION', 'Buildfire', '$rootScope', 'EventCache',
      function ($scope, DataStore, TAG_NAMES, STATUS_CODE, Location, LAYOUTS, CalenderFeedApi, PAGINATION, Buildfire, $rootScope, EventCache) {
        /*variable declaration*/
        var WidgetFeed = this;
        var currentFeedUrl = "";
        var currentDate = new Date();
        var currentLayout="";
        var formattedDate = currentDate.getFullYear() + "-" + moment(currentDate).format("MM") + "-" + ("0" + currentDate.getDate()).slice(-2) + "T00:00:00";
        var timeStampInMiliSec = +new Date(formattedDate);
        var configureDate,eventFromDate;
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
        WidgetFeed.eventsAll = null;
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
        var getFeedEvents = function (url, date, refreshData) {
          Buildfire.spinner.show();
          var success = function (result) {
              Buildfire.spinner.hide();
              console.log("??????????????????????", result);
              WidgetFeed.events = WidgetFeed.events.length ? WidgetFeed.events.concat(result.events) : result.events;
              WidgetFeed.offset = WidgetFeed.offset + PAGINATION.eventsCount;
              if (WidgetFeed.events.length < result.totalEvents) {
                WidgetFeed.busy = false;
              }
                currentLayout = WidgetFeed.data.design.itemDetailsLayout;
            }
            , error = function (err) {
              Buildfire.spinner.hide();
              WidgetFeed.eventsAll = [];
              WidgetFeed.events = [];
              console.error('Error In Fetching events', err);
            };
          var successAll = function (resultAll) {
                WidgetFeed.eventsAll=null;
                WidgetFeed.eventsAll = resultAll.events;
                  console.log("#################", WidgetFeed.eventsAll);
              }
              , errorAll = function (errAll) {
                console.error('Error In Fetching events', errAll);
              };


          CalenderFeedApi.getFeedEvents(url,eventFromDate).then(successAll, errorAll);

          CalenderFeedApi.getFeedEvents(url, date, WidgetFeed.offset, refreshData).then(success, error);
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
              WidgetFeed.eventsAll=[];
              WidgetFeed.busy = false;
            } else if (currentFeedUrl != WidgetFeed.data.content.feedUrl) {
              currentFeedUrl = WidgetFeed.data.content.feedUrl;
              WidgetFeed.events = [];
              WidgetFeed.eventsAll=null;
              WidgetFeed.offset = 0;
              WidgetFeed.busy = false;
              WidgetFeed.loadMore(false);
            }
            console.log("WidgetFeed.events",WidgetFeed.events)
            if (currentLayout && currentLayout != WidgetFeed.data.design.itemDetailsLayout){
             if (WidgetFeed.events && WidgetFeed.events.length) {
                Location.goTo("#/event/"+0);
             }
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
          if (buildfire.device && buildfire.device.calendar) {
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
                  alert("******************" + err);
                else
                  alert('worked ' + JSON.stringify(result));
              }
            );
          }
          console.log(">>>>>>>>", event);
        };

        /*This method is used to get the event from the date where we clicked on calendar*/
        WidgetFeed.getEventDate = function (date) {
          WidgetFeed.events = [];
          WidgetFeed.offset = 0;
          WidgetFeed.busy = false;
          formattedDate = date.getFullYear() + "-" + moment(date).format("MM") + "-" + ("0" + date.getDate()).slice(-2) + "T00:00:00";
          timeStampInMiliSec = +new Date(formattedDate);
          $rootScope.selectedDate = timeStampInMiliSec;
          if($rootScope.chnagedMonth==undefined){
            configureDate = new Date();
            eventFromDate = +new Date(configureDate.getFullYear(),configureDate.getMonth(),'01');
          }else{
            configureDate = new Date($rootScope.chnagedMonth);
            eventFromDate = +new Date(configureDate.getFullYear(),configureDate.getMonth(),'01');
           }
          WidgetFeed.loadMore(false);
        };

        /*This method is used to load the from Datastore*/
        WidgetFeed.loadMore = function (refreshData) {
          if (WidgetFeed.busy) return;
          WidgetFeed.busy = true;
          if (WidgetFeed.data.content.feedUrl)
            getFeedEvents(WidgetFeed.data.content.feedUrl, timeStampInMiliSec, refreshData);
        };

        /*This method is used to navigate to particular event details page*/
        WidgetFeed.openDetailsPage = function (event, index) {
          EventCache.setCache(event);
          Location.goTo('#/event/' + index);
        };

        /*
         * Enable pull down to refresh and fetch fresh data
         */

        Buildfire.datastore.onRefresh(function () {
          WidgetFeed.events = [];
          WidgetFeed.offset = 0;
          WidgetFeed.busy = false;
          WidgetFeed.loadMore(true);
        });

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
