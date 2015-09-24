'use strict';

(function (angular) {
  angular.module('eventsFeedPluginWidget')
    .controller('WidgetFeedCtrl', ['$scope', 'DataStore', 'TAG_NAMES', 'STATUS_CODE', 'Location', 'LAYOUTS', 'CalenderFeedApi', 'PAGINATION','Buildfire',
      function ($scope, DataStore, TAG_NAMES, STATUS_CODE, Location, LAYOUTS, CalenderFeedApi, PAGINATION,Buildfire) {
        var WidgetFeed = this;
        var currentFeedUrl = "";
        $scope.toggles = [{ state: true }, { state: false }, { state: true }];
        WidgetFeed.swiped=[];
        WidgetFeed.data = null;
        WidgetFeed.events = [];
        WidgetFeed.busy = false;
        WidgetFeed.offset = 0;
        $scope.today = function () {
          $scope.dt = new Date();
        };
        $scope.today();
        $scope.toggleMin = function () {
          $scope.minDate = $scope.minDate ? null : new Date();
        };
        $scope.toggleMin();
          $scope.events =
              [
                  //{
                  //    date: '25-Sep-2015',
                  //    status: 'event-class'
                  //},
                  //{
                  //    date: '28-Sep-2015',
                  //    status: 'event-class'
                  //}
              ];
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
          WidgetFeed.addEvents = function(e, i,toggle)
          {
              toggle?WidgetFeed.swiped[i] =  true:WidgetFeed.swiped[i] =  false;
          }
          WidgetFeed.addEventsToCalendar = function(event) {
              //console.log(Buildfire.context.device.platform);
              WidgetFeed.Keys = Object.keys(event);
              WidgetFeed.startTimeZone = WidgetFeed.Keys[0].split('=')
              WidgetFeed.endTimeZone = WidgetFeed.Keys[1].split('=')
              if(Buildfire.context.device.platform=='web'){
                  WidgetFeed.googleCalEvent.summary = event.SUMMARY
                  WidgetFeed.googleCalEvent.description = event.DESCRIPTION
                  WidgetFeed.googleCalEvent.start.dateTime = event[WidgetFeed.Keys[0]]
                  WidgetFeed.googleCalEvent.start.timeZone =WidgetFeed.startTimeZone[1]=='DATE'?"":WidgetFeed.startTimeZone[1]
                  WidgetFeed.googleCalEvent.end.dateTime = event[WidgetFeed.Keys[1]]
                  WidgetFeed.googleCalEvent.end.timeZone =WidgetFeed.endTimeZone[1]=='DATE'?"":WidgetFeed.endTimeZone[1]
              }
              console.log(WidgetFeed.googleCalEvent);
           }
          $scope.getDayClass = function(date, mode) {
              if (mode === 'day') {
                  var dayToCheck = new Date(date).setHours(0,0,0,0);

                  for (var i=0;i<$scope.events.length;i++){
                      var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

                      if (dayToCheck === currentDay) {
                          return $scope.events[i].status;
                      }
                  }
              }

              return '';
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
        init();

        var getFeedEvents = function (url) {
          var success = function (result) {
              console.log("??????????????????????", result);
              WidgetFeed.events = WidgetFeed.events.length ? WidgetFeed.events.concat(result.events) : result.events;
              WidgetFeed.offset = WidgetFeed.offset + PAGINATION.eventsCount;
              if (WidgetFeed.events.length < result.totalEvents) {
                WidgetFeed.busy = false;
              }
            }
            , error = function (err) {
              console.error('Error In Fetching events', err);
            };
          CalenderFeedApi.getFeedEvents(url, WidgetFeed.offset).then(success, error);
        };

        WidgetFeed.loadMore = function () {
          if (WidgetFeed.busy) return;
          WidgetFeed.busy = true;
          if (WidgetFeed.data.content.feedUrl)
            getFeedEvents(WidgetFeed.data.content.feedUrl);
        };
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
              getFeedEvents(WidgetFeed.data.content.feedUrl);
            }
          }
        };
        DataStore.onUpdate().then(null, null, onUpdateCallback);

        $scope.$on("$destroy", function () {
          DataStore.clearListener();
        });
      }]);
})(window.angular);
