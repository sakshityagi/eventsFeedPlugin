'use strict';

(function (angular) {
  angular.module('eventsFeedPluginWidget')
    .controller('WidgetFeedCtrl', ['$scope', 'DataStore', 'TAG_NAMES', 'STATUS_CODE', 'Location', 'LAYOUTS', 'CalenderFeedApi', 'PAGINATION',
      function ($scope, DataStore, TAG_NAMES, STATUS_CODE, Location, LAYOUTS, CalenderFeedApi, PAGINATION) {
        var WidgetFeed = this;

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
      }])
})(window.angular);
