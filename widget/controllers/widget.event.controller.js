'use strict';

(function (angular) {
  angular.module('eventsFeedPluginWidget')
    .controller('WidgetEventCtrl', ['$scope', 'DataStore', 'TAG_NAMES', 'Location', '$routeParams', 'CalenderFeedApi', 'LAYOUTS', 'Buildfire', '$rootScope',
      function ($scope, DataStore, TAG_NAMES, Location, $routeParams, CalenderFeedApi, LAYOUTS, Buildfire, $rootScope) {

        var WidgetEvent = this;
        WidgetEvent.data = null;
        WidgetEvent.event = null;
        var currentListLayout = null;
        var getEventDetails = function (url) {
          var success = function (result) {
              console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", result);
              WidgetEvent.event = result;
            }
            , error = function (err) {
              console.error('Error In Fetching events', err);
            };
          if ($routeParams.eventIndex)
            CalenderFeedApi.getSingleEventDetails(url, $routeParams.eventIndex, $rootScope.selectedDate).then(success, error);
        };

        /*declare the device width heights*/
        WidgetEvent.deviceHeight = window.innerHeight;
        WidgetEvent.deviceWidth = window.innerWidth;

        /*crop image on the basis of width heights*/
        WidgetEvent.cropImage = function (url, settings) {
          var options = {};
          if (!url) {
            return "";
          }
          else {
            if (settings.height) {
              options.height = settings.height;
            }
            if (settings.width) {
              options.width = settings.width;
            }
            return Buildfire.imageLib.cropImage(url, options);
          }
        };

        /*initialize the device width heights*/
        var initDeviceSize = function (callback) {
          WidgetEvent.deviceHeight = window.innerHeight;
          WidgetEvent.deviceWidth = window.innerWidth;
          if (callback) {
            if (WidgetEvent.deviceWidth == 0 || WidgetEvent.deviceHeight == 0) {
              setTimeout(function () {
                initDeviceSize(callback);
              }, 500);
            } else {
              callback();
              if (!$scope.$$phase && !$scope.$root.$$phase) {
                $scope.$apply();
              }
            }
          }
        };

        /*update data on change event*/
        var onUpdateCallback = function (event) {
          setTimeout(function () {
            $scope.imagesUpdated = false;
            $scope.$digest();
            if (event && event.tag === TAG_NAMES.EVENTS_FEED_INFO) {
              WidgetEvent.data = event.data;
              if (!WidgetEvent.data.design)
                WidgetEvent.data.design = {};
              if (!WidgetEvent.data.content)
                WidgetEvent.data.content = {};
            }
            if (!WidgetEvent.data.design.itemDetailsLayout) {
              WidgetEvent.data.design.itemDetailsLayout = LAYOUTS.itemDetailsLayout[0].name;
            }

            currentListLayout = WidgetEvent.data.design.itemDetailsLayout;
            $scope.imagesUpdated = !!event.data.content;
            $scope.$digest();
          }, 0);
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

        init();

        DataStore.onUpdate().then(null, null, onUpdateCallback);

      }])
})(window.angular);
