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
    })/*.filter('getImageUrl', ['Buildfire', function (Buildfire) {
      filter.$stateful = true;
      function filter(url, width, height, type) {
        var _imgUrl;
        if (!_imgUrl) {
          if (type == 'resize') {
            Buildfire.imageLib.local.resizeImage(url, {
              width: width,
              height: height
            }, function (err, imgUrl) {
              _imgUrl = imgUrl;
              return _imgUrl;
            });
          } else {
            Buildfire.imageLib.local.cropImage(url, {
              width: width,
              height: height
            }, function (err, imgUrl) {
              _imgUrl = imgUrl;
              return _imgUrl;
            });
          }
        }
      }
      return filter;
    }])*/
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
          buildfire.navigation._goBackOne();
        }
      };
    }])
    .directive("loadImage", ['Buildfire', function (Buildfire) {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          element.attr("src", "../../../styles/media/holder-" + attrs.loadImage + ".gif");

          attrs.$observe('finalSrc', function() {
            var _img = attrs.finalSrc;

            if (attrs.cropType == 'resize') {
              Buildfire.imageLib.local.resizeImage(_img, {
                width: attrs.cropWidth,
                height: attrs.cropHeight
              }, function (err, imgUrl) {
                _img = imgUrl;
                replaceImg(_img);
              });
            } else {
              Buildfire.imageLib.local.cropImage(_img, {
                width: attrs.cropWidth,
                height: attrs.cropHeight
              }, function (err, imgUrl) {
                _img = imgUrl;
                replaceImg(_img);
              });
            }
          });

          function replaceImg(finalSrc) {
            var elem = $("<img>");
            elem[0].onload = function () {
              element.attr("src", finalSrc);
              elem.remove();
            };
            elem.attr("src", finalSrc);
          }
        }
      };
    }])
    .directive('backImg', ["$rootScope", function ($rootScope) {
      return function (scope, element, attrs) {
        attrs.$observe('backImg', function (value) {
          var img = '';
          if (value) {
            buildfire.imageLib.local.cropImage(value, {
              width: $rootScope.deviceWidth,
              height: $rootScope.deviceHeight
            }, function (err, imgUrl) {
              if (imgUrl) {
                img = imgUrl;
                element.attr("style", 'background:url(' + img + ') !important ; background-size: cover !important;');
              } else {
                img = '';
                element.attr("style", 'background-color:white');
              }
              element.css({
                'background-size': 'cover'
              });
            });
            // img = $filter("cropImage")(value, $rootScope.deviceWidth, $rootScope.deviceHeight, true);
          }
          else {
            img = "";
            element.attr("style", 'background-color:white');
            element.css({
              'background-size': 'cover'
            });
          }
        });
      };
    }])
    .config(function ($provide) {    //This directive is used to add watch in the calendar widget
      $provide.decorator('datepickerDirective', ['$delegate', '$rootScope', function ($delegate, $rootScope) {
        var directive = $delegate[0];
        var link = directive.link;
        directive.compile = function () {
          return function (scope, element, attrs, ctrls) {
            link.apply(this, arguments);
            var datepickerCtrl = ctrls[0]
              , ngModelCtrl = ctrls[1]; //New Change for refreshing views
            scope.$watch(function () {
              return ctrls[0].activeDate;

            }, function (oldValue, newValue) {
              if (oldValue.getMonth() !== newValue.getMonth()) {
                $rootScope.chnagedMonth = oldValue;
              }
            }, true);
            if (ngModelCtrl) { //New Change for refreshing views
              // Listen for 'refreshDatepickers' event...//New Change for refreshing views
              scope.$on('refreshDatepickers', function refreshView() {//New Change for refreshing views
                datepickerCtrl.refreshView();//New Change for refreshing views
              });//New Change for refreshing views
            }//New Change for refreshing views
          }
        };
        return $delegate;
      }]);
    });
})(window.angular, window.buildfire);
