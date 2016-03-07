'use strict';

(function (angular, buildfire) {
  angular.module('eventsFeedPluginWidget')
    .controller('WidgetEventCtrl', ['$scope', 'DataStore', 'TAG_NAMES', 'Location', '$routeParams', 'CalenderFeedApi', 'LAYOUTS', 'Buildfire', '$rootScope', 'EventCache',
      function ($scope, DataStore, TAG_NAMES, Location, $routeParams, CalenderFeedApi, LAYOUTS, Buildfire, $rootScope, EventCache) {
        var WidgetEvent = this;
        WidgetEvent.data = null;
        WidgetEvent.event = null;
        var currentListLayout = null;
        var getEventDetails = function (url) {
          var success = function (result) {
              console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", result);
              $rootScope.showFeed = false;
              WidgetEvent.event = result;
            }
            , error = function (err) {
              $rootScope.showFeed = false;
              console.error('Error In Fetching events', err);
            };

        };
        if ($routeParams.eventIndex) {
          if (EventCache.getCache()) {
            $rootScope.showFeed = false;
            WidgetEvent.event = EventCache.getCache();
          }
          else {
            CalenderFeedApi.getSingleEventDetails(url, $routeParams.eventIndex, $rootScope.selectedDate).then(success, error);
          }
        };
        /*declare  the device width heights*/
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


        WidgetEvent.setAddedEventToLocalStorage= function(eventId){
          var addedEvents = [];
          addedEvents = JSON.parse(localStorage.getItem('localAddedEventsFeed'));
          if(!addedEvents){
            addedEvents=[];
          }
          addedEvents.push(eventId);
          localStorage.setItem('localAddedEventsFeed', JSON.stringify(addedEvents));
        }

        WidgetEvent.getAddedEventToLocalStorage = function(eventId){
          var localStorageSavedEvents = [];
          localStorageSavedEvents = JSON.parse(localStorage.getItem('localAddedEventsFeed'));
          if(!localStorageSavedEvents){
            localStorageSavedEvents=[];
          }
          return localStorageSavedEvents.indexOf(eventId);
        }

        WidgetEvent.addEventsToCalendar = function (event) {
          /*Add to calendar event will add here*/
          WidgetEvent.Keys = Object.keys(event);
          WidgetEvent.startTimeZone = WidgetEvent.Keys[0].split('=');
          WidgetEvent.endTimeZone = WidgetEvent.Keys[1].split('=');

          var eventStartDate = new Date(event.startDate);
          var eventEndDate;
          if(!event.endDate){
            eventEndDate = new Date(event.startDate)
          }
          else {
            eventEndDate = new Date(event.endDate);
          }
          console.log("---------------------",eventStartDate, eventEndDate, event)
          /*Add to calendar event will add here*/

          if(WidgetEvent.getAddedEventToLocalStorage(event.UID)!=-1){
            alert("Event already added in calendar");
          }
          console.log("inCal3eventFeeddetails:", eventEndDate, event);
          if (buildfire.device && buildfire.device.calendar) {
            buildfire.device.calendar.addEvent(
              {
                title: event.SUMMARY
                , location: event.LOCATION
                , notes: event.DESCRIPTION
                , startDate: new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate(), eventStartDate.getHours(), eventStartDate.getMinutes(), eventStartDate.getSeconds())
                , endDate: new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate(), eventEndDate.getHours(), eventEndDate.getMinutes(), eventEndDate.getSeconds())
                , options: {
                firstReminderMinutes: 120
                , secondReminderMinutes: 5
                , recurrence: 'Yearly'
                , recurrenceEndDate: new Date(2025, 6, 1, 0, 0, 0, 0, 0)
              }
              }
              ,
              function (err, result) {
                 if (err)
                  console.log("******************" + err);
                else {
                   WidgetEvent.swiped[i] = false;
                   alert("Event added to calendar");
                   WidgetEvent.setAddedEventToLocalStorage(event.UID);
                   console.log('worked ' + JSON.stringify(result));
                  $scope.$digest();
                }
              }
            );
          }
          console.log(">>>>>>>>", event);
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

        buildfire.datastore.onRefresh(function () {

        });

        $scope.$on("$destroy", function () {
          DataStore.clearListener();
          $rootScope.$broadcast('ROUTE_CHANGED');
        });

      }])
})(window.angular, window.buildfire);
