'use strict';

(function (angular, buildfire) {
  angular.module('eventsFeedPluginWidget')
    .provider('Buildfire', [function () {
      var Buildfire = this;
      Buildfire.$get = function () {
        return buildfire
      };
      return Buildfire;
    }])
    .factory("DataStore", ['Buildfire', '$q', 'STATUS_CODE', 'STATUS_MESSAGES', function (Buildfire, $q, STATUS_CODE, STATUS_MESSAGES) {
      var onUpdateListeners = [];
      return {
        get: function (_tagName) {
          var deferred = $q.defer();
          Buildfire.datastore.get(_tagName, function (err, result) {
            if (err) {
              return deferred.reject(err);
            } else if (result) {
              return deferred.resolve(result);
            }
          });
          return deferred.promise;
        },
        onUpdate: function () {
          var deferred = $q.defer();
          var onUpdateFn = Buildfire.datastore.onUpdate(function (event) {
            if (!event) {
              return deferred.notify(new Error({
                code: STATUS_CODE.UNDEFINED_EVENT,
                message: STATUS_MESSAGES.UNDEFINED_EVENT
              }), true);
            } else {
              return deferred.notify(event);
            }
          });
          onUpdateListeners.push(onUpdateFn);
          return deferred.promise;
        },
        clearListener: function () {
          onUpdateListeners.forEach(function (listner) {
            listner.clear();
          });
          onUpdateListeners = [];
        }
      }
    }])
    .factory('CalenderFeedApi', ['$q', '$http', 'STATUS_CODE', 'STATUS_MESSAGES', 'PAGINATION', 'PROXY_SERVER',
      function ($q, $http, STATUS_CODE, STATUS_MESSAGES, PAGINATION, PROXY_SERVER) {
        var getSingleEventDetails = function (url, eventIndex, date) {
          var deferred = $q.defer();
          if (!url) {
            deferred.reject(new Error('Undefined feed url'));
          }
          $http.post(PROXY_SERVER.serverUrl + '/event', {
            url: url,
            index: eventIndex,
            date: date
          })
            .success(function (response) {
              if (response.statusCode == 200)
                deferred.resolve(response.event);
              else
                deferred.resolve(null);
            })
            .error(function (error) {
              deferred.reject(error);
            });
          return deferred.promise;
        };
        var getFeedEvents = function (url, date, offset, refreshData, requestType) {
          var deferred = $q.defer();
          if (!url) {
            deferred.reject(new Error('Undefined feed url'));
          }
          $http.post(PROXY_SERVER.serverUrl + '/events', {
            url: url,
            limit: requestType=='SELECTED'?PAGINATION.eventsCount:PAGINATION.eventsCountAll,
            offset: offset,
            date: date,
            refreshData: refreshData
          })
            .success(function (response) {
              if (response.statusCode == 200)
                deferred.resolve(response);
              else
                deferred.reject(null);
            })
            .error(function (error) {
              deferred.reject(error);
            });
          return deferred.promise;
        };
        return {
          getSingleEventDetails: getSingleEventDetails,
          getFeedEvents: getFeedEvents
        };
      }])
    .factory('Location', [function () {
      var _location = window.location;
      return {
        goTo: function (path) {
          _location.href = path;
        }
      };
    }])
    .factory('EventCache', [function () {
      var event = null;
      return {
        setCache: function (data) {
          event = data;
        },
        getCache: function () {
          return event;
        }
      };
    }])
})(window.angular, window.buildfire);