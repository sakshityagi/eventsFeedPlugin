'use strict';

(function (angular) {
  angular
    .module('eventsFeedPluginContent')
    .controller('ContentHomeCtrl', ['$scope', 'Buildfire', 'DataStore', 'TAG_NAMES', 'STATUS_CODE', 'LAYOUTS', 'CalendarFeed', '$timeout',
      function ($scope, Buildfire, DataStore, TAG_NAMES, STATUS_CODE, LAYOUTS, CalendarFeed, $timeout) {

        /*
         * Private variables
         */
        var _data = {
          "content": {
            "feedUrl": ""
          },
          "design": {
            "itemDetailsLayout": LAYOUTS.itemDetailsLayout[0].name,
            "itemDetailsBgImage": ""
          }
        };

        var ContentHome = this;
        ContentHome.masterData = null;
        //ContentHome.data = angular.copy(_data);
        ContentHome.validLinkSuccess = false;
        ContentHome.validLinkFailure = false;
        ContentHome.validLinkNoEvents = false;
        var tmrDelay = null;

        var updateMasterItem = function (data) {
          ContentHome.masterData = angular.copy(data);
        };

        var isUnchanged = function (data) {
          return angular.equals(data, ContentHome.masterData);
        };

        var init = function () {
          var success = function (result) {
                console.info('Init success result:', result);
                if (result.data && result.id) {
                  ContentHome.data = result.data;
                  if (!ContentHome.data) {
                    ContentHome.data = angular.copy(_data);
                  } else {
                    if (!ContentHome.data.content)
                      ContentHome.data.content = {};
                    if (ContentHome.data.content.feedUrl)
                      ContentHome.calUrl = ContentHome.data.content.feedUrl;
                  }
                  updateMasterItem(ContentHome.data);
                  if (tmrDelay)clearTimeout(tmrDelay);
                }
                else {
                  var dummyData = {url: "http://ical.mac.com/ical/US32Holidays.ics"};
                  ContentHome.data = angular.copy(_data);
                  ContentHome.calUrl  = dummyData.url;
                  updateMasterItem(ContentHome.data);
                }
              }
            , error = function (err) {
              if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                console.error('Error while getting data', err);
                if (tmrDelay)clearTimeout(tmrDelay);
              }
              else if (err && err.code === STATUS_CODE.NOT_FOUND) {
                saveData(JSON.parse(angular.toJson(ContentHome.data)), TAG_NAMES.EVENTS_FEED_INFO);
              }
            };
          DataStore.get(TAG_NAMES.EVENTS_FEED_INFO).then(success, error);
        };

        /*
         * Call the datastore to save the data object
         */
        var saveData = function (newObj, tag) {
          if (typeof newObj === 'undefined') {
            return;
          }
          var success = function (result) {
              console.info('Saved data result: ', result);
              updateMasterItem(newObj);
            }
            , error = function (err) {
              console.error('Error while saving data : ', err);
            };
          DataStore.save(newObj, tag).then(success, error);
        };

        /*
         * create an artificial delay so api isnt called on every character entered
         * */
        var saveDataWithDelay = function (newObj) {
          if (newObj) {
            if (isUnchanged(newObj)) {
              return;
            }
            if (tmrDelay) {
              clearTimeout(tmrDelay);
            }
            tmrDelay = setTimeout(function () {
              saveData(JSON.parse(angular.toJson(newObj)), TAG_NAMES.EVENTS_FEED_INFO);
            }, 500);
          }
        };

        /*
         * Check if give ical url is valid or not and show message accordingly
         */

        ContentHome.validateCalUrl = function () {
          function successCallback(resp) {
            Buildfire.spinner.hide();
            if (resp && resp.events) {
              ContentHome.validLinkSuccess = true;
              $timeout(function () {
                ContentHome.validLinkSuccess = false;
              }, 5000);

            } else {
              ContentHome.validLinkNoEvents = true;
              $timeout(function () {
                ContentHome.validLinkNoEvents = false;
              }, 5000);
            }
            ContentHome.validLinkFailure = false;
            ContentHome.data.content.feedUrl = ContentHome.calUrl;
          }

          function errorCallback(err) {
            Buildfire.spinner.hide();
            ContentHome.validLinkFailure = true;
            $timeout(function () {
              ContentHome.validLinkFailure = false;
            }, 5000);
            ContentHome.validLinkSuccess = false;
          }

          if (ContentHome.calUrl) {
            Buildfire.spinner.show();
            CalendarFeed.validate(ContentHome.calUrl).then(successCallback, errorCallback);
          }
        };

        /*
         * Method to clear calendar feed url
         * */
        ContentHome.clearData = function () {
          if (!ContentHome.calUrl) {
            ContentHome.data.content.feedUrl = null;
          }
        };

        updateMasterItem(_data);

        /*
         * Go pull any previously saved data
         * */
        init();

        /*
         * watch for changes in data and trigger the saveDataWithDelay function on change
         * */
        $scope.$watch(function () {
          return ContentHome.data;
        }, saveDataWithDelay, true);
      }
    ]);
})(window.angular);
