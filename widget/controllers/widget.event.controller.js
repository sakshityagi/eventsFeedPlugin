'use strict';

(function (angular) {
  angular.module('eventsFeedPluginWidget')
    .controller('WidgetEventCtrl', ['$scope', 'DataStore', 'TAG_NAMES', 'Location', '$routeParams',
      function ($scope, DataStore, TAG_NAMES, $routeParams) {

        var WidgetEvent = this;
        WidgetEvent.data = null;
        WidgetEvent.event = null;

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
            }
            , error = function (err) {
              console.error('Error while getting data', err);
            };
          DataStore.get(TAG_NAMES.EVENTS_FEED_INFO).then(success, error);
        };
        init();

      }])
})(window.angular);
