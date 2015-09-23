'use strict';

(function (angular, buildfire) {
  angular.module('eventsFeedPluginWidget', ['ngRoute', 'infinite-scroll'])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider
        .when('/feed', {
          templateUrl: 'templates/home.html',
          controllerAs: 'WidgetFeed',
          controller: 'WidgetFeedCtrl'
        })
        .when('/event/:eventIndex', {
          templateUrl: 'templates/eventDetails.html',
          controller: 'WidgetEventCtrl',
          controllerAs: 'WidgetEvent'
        })
        .otherwise('/feed');
    }])
})(window.angular, window.buildfire);
