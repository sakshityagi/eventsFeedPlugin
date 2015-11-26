'use strict';

(function (angular, buildfire) {
  angular.module('eventsFeedPluginWidget', ['ngRoute', 'ngTouch', 'infinite-scroll', 'ui.bootstrap', 'ngAnimate'])
    .config(['$routeProvider', '$compileProvider', function ($routeProvider, $compileProvider) {

      /**
       * To make href urls safe on mobile
       */
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|cdvfile|file):/);

      $routeProvider
        .when('/', {
          template: '<div></div>'
        })
        .when('/event/:eventIndex', {
          templateUrl: 'templates/eventDetails.html',
          controller: 'WidgetEventCtrl',
          controllerAs: 'WidgetEvent'
        })
        .otherwise('/');
    }])
    .filter('getDateFromTimestamp', function () {
      return function (input) {
        return new Date(input).getDate();
      };
    }).filter('getImageUrl', ['Buildfire', function (Buildfire) {
      return function (url, width, height, type) {
        if (type == 'resize')
          return Buildfire.imageLib.resizeImage(url, {
            width: width,
            height: height
          });
        else
          return Buildfire.imageLib.cropImage(url, {
            width: width,
            height: height
          });
      }
    }])
    .filter('getMonthFromTimestamp', function () {
      var monthsObj = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      return function (input) {
        return monthsObj[new Date(input).getMonth()];
      };
    })
    .filter('getTimeZone', function () {

      return function (input) {
        input = new Date(input);
        var result = input.toString().match(/\((.+)\)/i);
        if (result && result.length)
          return result[1];
        else return "";
      };
    })
    .run(['Location', '$location', '$rootScope', function (Location, $location, $rootScope) {
      buildfire.navigation.onBackButtonClick = function () {
        var reg = /^\/event/;
        if (reg.test($location.path())) {
          $rootScope.showFeed = true;
          Location.goTo('#/');
        }
        else {
          buildfire.navigation.navigateHome();
        }
      };
    }]).config(function ($provide) {    //This directive is used to add watch in the calendar widget
      $provide.decorator('datepickerDirective', ['$delegate', '$rootScope', function ($delegate, $rootScope) {
        var directive = $delegate[0];
        var link = directive.link;
        directive.compile = function () {
          return function (scope, element, attrs, ctrls) {
            link.apply(this, arguments);

            scope.$watch(function () {
              return ctrls[0].activeDate;
            }, function (oldValue, newValue) {
              if (oldValue.getMonth() !== newValue.getMonth()) {
                $rootScope.chnagedMonth = oldValue;
              }
            }, true);

          }
        };
        return $delegate;
      }]);

    });
})(window.angular, window.buildfire);
