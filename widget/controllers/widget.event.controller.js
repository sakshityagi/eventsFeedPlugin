'use strict';

(function (angular) {
  angular.module('eventsFeedPluginWidget')
    .controller('WidgetEventCtrl', ['$scope', 'DataStore', 'TAG_NAMES', 'Location', '$routeParams', 'CalenderFeedApi', 'LAYOUTS',
      function ($scope, DataStore, TAG_NAMES, Location, $routeParams, CalenderFeedApi, LAYOUTS) {

        var WidgetEvent = this;
        WidgetEvent.data = null;
        WidgetEvent.event = null;

        var getEventDetails = function (url) {
          var success = function (result) {
              console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", result);
              WidgetEvent.event = result;
            }
            , error = function (err) {
              console.error('Error In Fetching events', err);
            };
          if ($routeParams.eventIndex)
            CalenderFeedApi.getSingleEventDetails(url, $routeParams.eventIndex).then(success, error);
        };

        /*
         * Fetch user's data from datastore
         */

        var init = function () {
          var success = function (result) {
              WidgetEvent.data = result.data;
              if (!WidgetEvent.data.design)
                WidgetEvent.data.design = {};
              if (!WidgetEvent.data.content)
                WidgetEvent.data.content = {};
              if (!WidgetEvent.data.design.itemDetailsLayout) {
                WidgetEvent.data.design.itemDetailsLayout = LAYOUTS.itemDetailsLayout[0].name;
              }
              getEventDetails(WidgetEvent.data.content.feedUrl);
            }
            , error = function (err) {
              console.error('Error while getting data', err);
            };
          DataStore.get(TAG_NAMES.EVENTS_FEED_INFO).then(success, error);
        };

        console.log('-------------', $routeParams, window.location.href);
        init();

      }])
})(window.angular);
