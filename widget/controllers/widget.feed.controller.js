'use strict';

(function (angular, buildfire) {
  angular.module('eventsFeedPluginWidget')
    .controller('WidgetFeedCtrl', ['$scope', 'DataStore', 'TAG_NAMES', 'STATUS_CODE', 'Location', 'LAYOUTS', 'CalenderFeedApi', 'PAGINATION', 'Buildfire', '$rootScope', 'EventCache',
      function ($scope, DataStore, TAG_NAMES, STATUS_CODE, Location, LAYOUTS, CalenderFeedApi, PAGINATION, Buildfire, $rootScope, EventCache) {
        /*variable declaration*/
        var WidgetFeed = this;
        var currentFeedUrl = "";
        var currentDate = new Date();
        var currentLayout="";
        var formattedDate = currentDate.getFullYear() + "-" + moment(currentDate).format("MM") + "-" + ("0" + currentDate.getDate()).slice(-2) + "T00:00:00";
        var timeStampInMiliSec = +new Date(formattedDate);
        var configureDate,eventFromDate;
        $rootScope.deviceHeight = window.innerHeight;
        $rootScope.deviceWidth = window.innerWidth;
        $rootScope.showFeed = true;
        $rootScope.selectedDate = timeStampInMiliSec;
        WidgetFeed.eventClassToggle = true;
        WidgetFeed.NoDataFound = false;
        WidgetFeed.clickEvent =  false;
        WidgetFeed.calledDate = null;
        WidgetFeed.getLastDateOfMonth = function (date) {
          return moment(date).endOf('month').format('DD');
        };
        WidgetFeed.getFirstDateOfMonth = function (date) {
          return moment(date).startOf('month').format('DD');
        };
        var configureDate = new Date();
        //var eventEndDate = moment(configureDate.getFullYear()+"-"+moment(configureDate).format("MM")+"-"+'01').unix()*1000;
        var eventRecEndDate = configureDate.getFullYear() + "-" + moment(configureDate).format("MM") + "-" + WidgetFeed.getLastDateOfMonth(configureDate) + "T23:59:59" + moment(new Date()).format("Z");
        var eventStartDate = configureDate.getFullYear() + "-" + moment(configureDate).format("MM") + "-" + WidgetFeed.getFirstDateOfMonth(configureDate) + "T00:00:00" + moment(new Date()).format("Z");
        var recurringEndDate = configureDate.getFullYear() + "-" + moment(configureDate).format("MM") + "-" + WidgetFeed.getLastDateOfMonth(configureDate) + "T00:00:00" + moment(new Date()).format("Z");
        var eventRecEndDateCheck = null;

        configureDate = new Date();
        eventFromDate = moment(configureDate.getFullYear()-1+"-"+moment(configureDate).format("MM")+'-'+moment(configureDate).format("DD")).unix()*1000;
        ///*Variable declaration to store the base or initial data*/
        $scope.toggles = [{state: true}, {state: false}, {state: true}];
        $scope.events = [];
        WidgetFeed.googleCalEvent = {
          'summary': '',
          'location': '',
          'description': '',
          'start': {
            'dateTime': '',
            'timeZone': ''
          },
          'end': {
            'dateTime': '',
            'timeZone': ''
          },
          'recurrence': [
            'RRULE:FREQ=DAILY;COUNT=2'
          ],
          'attendees': [
            {'email': 'lpage@example.com'}
          ],
          'reminders': {
            'useDefault': false,
            'overrides': [
              {'method': 'email', 'minutes': 24 * 60}
            ]
          }
        };
        WidgetFeed.eventsAll = null;
        WidgetFeed.swiped = [];
        WidgetFeed.data = null;
        WidgetFeed.events = [];
        WidgetFeed.busy = false;
        WidgetFeed.offset = 0;
        /*This object is storing the base data for iCal calendar*/
        WidgetFeed.iCalEvent = {
          VERSION: 2.0,
          PRODID: "",
          "BEGIN": "VEVENT",
          DTSTAMP: "20151012T130000Z",
          "ORGANIZER;CN=Organizer": "MAILTO:Organizer e-mail",
          STATUS: "CONFIRMED",
          UID: "ATE1443440406",
          DTSTART: "20151012T130000Z",
          DTEND: "20151012T150000Z",
          SUMMARY: "Summary of the event",
          DESCRIPTION: "Description of the event",
          "X-ALT-DESC;FMTTYPE=text/html": "Description of the event",
          LOCATION: "Location of the event",
          END: "VEVENT"
        };

        /*
         * Fetch user's data from datastore
         */
        var init = function () {
          var success = function (result) {
                if (result.data && result.id) {
                  WidgetFeed.data = result.data;
                  if (!WidgetFeed.data.content)
                    WidgetFeed.data.content = {};
                  if (!WidgetFeed.data.design)
                    WidgetFeed.data.design = {};
                  if (!WidgetFeed.data.design.itemDetailsLayout) {
                    WidgetFeed.data.design.itemDetailsLayout = LAYOUTS.itemDetailsLayout[0].name;
                  }
                  if (WidgetFeed.data.content.feedUrl)
                    currentFeedUrl = WidgetFeed.data.content.feedUrl;
                  WidgetFeed.getAllEvents();

                } else
                {
                  WidgetFeed.data = {
                    content: {},
                    design:{}
                  };
                  var dummyData = {url: "http://ical.mac.com/ical/US32Holidays.ics"};
                  WidgetFeed.data.content.feedUrl  = dummyData.url;
                  WidgetFeed.data.design.itemDetailsLayout= LAYOUTS.itemDetailsLayout[0].name;
                  WidgetFeed.getAllEvents();
                }
              }
            , error = function (err) {
              if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                console.error('Error while getting data', err);
              }
            };
          DataStore.get(TAG_NAMES.EVENTS_FEED_INFO).then(success, error);
        };

        //translates the repeatType for recurring.js
        var getRepeatUnit = function (repeatType) {
          var repeat_unit;
          switch (repeatType) {
            case "WEEKLY":
              repeat_unit = "w";
              break;
            case "DAILY":
              repeat_unit = "d";
              break;
            case "MONTHLY":
              repeat_unit = "m";
              break;
            case "YEARLY":
              repeat_unit = "y";
              break;
          }
          return repeat_unit;
        };

        //translates days from the result object to the number for recurring.js and places in array
        var getRepeatDays = function (days) {
          console.log("++++++++++++++++AAAAAA",days)
          var repeat_days = [];
          if (days.sunday) {
            repeat_days.push(0);
          }
          if (days.saturday) {
            repeat_days.push(6);
          }
          if (days.friday) {
            repeat_days.push(5);
          }
          if (days.thursday) {
            repeat_days.push(4);
          }
          if (days.wednesday) {
            repeat_days.push(3);
          }
          if (days.tuesday) {
            repeat_days.push(2);
          }
          if (days.monday) {
            repeat_days.push(1);
          }
          return repeat_days;
        };

        //returns the last day of the month based on current date
        var getLastDayMonth = function () {
          var month = currentDate.getMonth();
          var year = currentDate.getFullYear();
          var last_day = new Date(year, month + 1, 0);
          last_day = last_day.toISOString();
          return last_day;
        };

        var getFormatRepeatRule = function(rule){
          //console.log("++++++++++++++++AAAAAA111", rule)
          var formattedRule = {}, splitRule = [], days={}, bydayArraySplit = [];
          if (rule) {
            splitRule = rule.split(';');
            for (var i = 0; i < splitRule.length; i++) {
              console.log("++++++++++++++++AAAAAA111", rule, splitRule[i].split('='))
              switch (splitRule[i].split('=')[0]) {
                case 'FREQ':
                  formattedRule.freq = splitRule[i].split('=')[1];
                  break;
                case 'UNTIL':
                  formattedRule.until = splitRule[i].split('=')[1];
                  break;
                case 'BYDAY':
                  formattedRule.bydayArray = splitRule[i].split('=')[1];
                  bydayArraySplit = formattedRule.bydayArray.split(',');
                  for(var j=0; j<bydayArraySplit.length; j++) {
                    switch (bydayArraySplit[j]) {
                      case 'MO':days.monday = true;
                        break;
                      case 'TU':days.tuesday = true;
                        break;
                      case 'WE':days.wednesday = true;
                        break;
                      case 'TH':days.thursday = true;
                        break;
                      case 'FR':days.friday = true;
                        break;
                      case 'SA':days.saturday = true;
                        break;
                      case 'SU':days.sunday = true;
                        break;
                    }
                    console.log("AAAAAAAAAAAAAA111",bydayArraySplit[j], formattedRule.bydayArray);

                  }
                  formattedRule.byday = days;
                  console.log("AAAAAAAAAAAAAA", formattedRule.byday, days, formattedRule.bydayArray[j]);
                  break;
                case 'COUNT':
                  formattedRule.count = splitRule[i].split('=')[1];
                  break;
                case 'INTERVAL':
                  formattedRule.interval = splitRule[i].split('=')[1];
                  break;
              }
              if (splitRule[i].split('=')[0] && splitRule[i].split('=')[0] !== 'UNTIL' && splitRule[i].split('=')[0] !== 'COUNT')
                formattedRule.end = 'NEVER';
            }
          }
          return formattedRule;
        }
        //this function will add repeating events to the result array to the repeat_until date passed in
        var expandRepeatingEvents = function (result, repeat_until, AllEvent) {
          console.log("+++++++++++++++++REPEAT-1", result.events)

          var repeat_results = [];
          for (var i = 0; i < result.events.length; i++) {

            result.events[i].formattedRule =  getFormatRepeatRule(result.events[i].RRULE)

            if (result.events[i].RRULE) {

              var repeat_unit = getRepeatUnit(result.events[i].RRULE.split(';')[0].split('=')[1]);

              if (repeat_unit === "w") {    //daily repeats do not specify day
                if (!result.events[i].formattedRule.byday) {
                  result.events[i].days = {}
                }

                if (result.events[i].formattedRule.byday && !result.events[i].formattedRule.byday) {
                  switch (new Date(result.events.startDate).getDay()) {
                    case 0:
                      result.events[i].days.sunday = true;
                      break;
                    case 1:
                      result.events[i].days.monday = true;
                      break;
                    case 2:
                      result.events[i].days.tuesday = true;
                      break;
                    case 3:
                      result.events[i].days.wednesday = true;
                      break;
                    case 4:
                      result.events[i].days.thursday = true;
                      break;
                    case 5:
                      result.events[i].days.friday = true;
                      break;
                    case 6:
                      result.events[i].days.saturday = true;
                      break;
                  }

                  var repeat_days = getRepeatDays(result.events[i].days);
                } else {
                  var repeat_days = getRepeatDays(result.events[i].formattedRule.byday);
                }
              }

              if (( result.events[i].startDate && result.events[i].formattedRule.until == undefined) && new Date(result.events[i].startDate).getMonth() >= new Date(eventRecEndDate).getMonth()) {
                recurringEndDate = configureDate.getFullYear() + "-" + moment(configureDate).format("MM") + "-" + WidgetFeed.getLastDateOfMonth(configureDate) + "T00:00:00" + moment(new Date()).format("Z");
              }
              var tempDate2 = new Date(result.events[i].startDate);
              var tempDate = tempDate2.getFullYear() + "-" + moment(tempDate2).format("MM") + "-" + tempDate2.getDate() + "T00:00:00" + moment(new Date()).format("Z");
              var testdateUntil = (result.events[i].formattedRule.until)
              if(testdateUntil)
              testdateUntil = testdateUntil.slice(0,4) + "-" + testdateUntil.slice(4,6) + "-" + testdateUntil.slice(6,8) + "T23:59:59" + moment(new Date()).format("Z");
              var pattern = {
                // start: AllEvent?result[i].data.repeat.startDate:+new Date(result[i].data.repeat.startDate) < timeStampInMiliSec && +new Date(result[i].data.startDate) < timeStampInMiliSec? timeStampInMiliSec : result[i].data.repeat.startDate,
                start: tempDate,
                every: result.events[i].formattedRule.interval ? result.events[i].formattedRule.interval : 1,
                unit: repeat_unit,
                end_condition: 'until',
                //until: result[i].data.repeat.isRepeating && result[i].data.repeat.endOn ? result[i].data.repeat.endOn : repeat_until,
                //until: +new Date(eventEndDate) < +new Date(result[i].data.repeat.endOn) || new Date(result[i].data.repeat.endOn)=='Invalid Date'?recurringEndDate:result[i].data.repeat.endOn,
                until: +new Date(eventRecEndDate) < +new Date(testdateUntil) ? eventRecEndDate : testdateUntil,
                days: repeat_days
              };
              //var a = Number(result.events[i].formattedRule.until)
              console.log("++++++++++++++++AAAAAAwwwww", pattern)

              if (result.events[i].formattedRule.until == undefined && result.events[i].formattedRule.end !== 'NEVER') {
                var recurringEndDate = moment(result.events[i].startDate).format('YYYY') + "-" + moment(result.events[i].startDate).format("MM") + "-" + WidgetFeed.getLastDateOfMonth(result.events[i].startDate) + "T00:00:00" + moment(new Date()).format("Z");
                pattern.until = recurringEndDate;
              }

              if (result.events[i].formattedRule.freq && result.events[i].formattedRule.until == undefined && result.events[i].formattedRule.end == 'NEVER') {
                pattern.until = eventRecEndDate;
              }

              if (result.events[i].formattedRule.end == 'AFTER') {
                pattern.end_condition = 'for';
                pattern.rfor = result.events[i].formattedRule.endAfter;

              }



              //use recurring.js from https://www.npmjs.com/package/recurring-date
              var r = new RecurringDate(pattern);

              var dates = r.generate();

              //add repeating events to the result
              for (var j = 0; j < dates.length; j++) {
                var temp_result = JSON.parse(JSON.stringify(result.events[i]));
                temp_result.startDate = Date.parse(dates[j]);
                temp_result.startTime = result.events[i].startTime;
                if (temp_result.startDate >= +new Date(eventStartDate) && temp_result.startDate <= +new Date(eventRecEndDate))
                  if (AllEvent)
                    repeat_results.push(temp_result);
                  else if (temp_result.startDate >= timeStampInMiliSec) {
                    repeat_results.push(temp_result);
                  }
              }
            } else {
              //save the result even if it is not repeating.

              if (result.events[i].startDate >= +new Date(eventStartDate) && result.events[i].startDate <= +new Date(eventRecEndDate))
                if (AllEvent)
                  repeat_results.push(result[i]);
                else if (result.events[i].startDate >= timeStampInMiliSec) {
                  repeat_results.push(result[i]);
                }
            }
          }
          //sort the list by start date
          repeat_results.sort(function (a, b) {
            if (a.startDate > b.startDate) {
              return 1;
            }
            if (a.startDate < b.startDate) {
              return -1;
            }
            // a must be equal to b
            return 0;
          });
          return repeat_results;
        };
        /*Get all the events for calander dates*/
        WidgetFeed.getAllEvents = function() {
          var successAll = function (resultAll) {
              console.log("#################", resultAll);
                WidgetFeed.eventsAll = [];
              var repeat_until = getLastDayMonth();
              resultAll = expandRepeatingEvents(resultAll, repeat_until, true);

              WidgetFeed.eventsAll = resultAll;
                console.log("#################2222222", WidgetFeed.eventsAll);
              }
              , errorAll = function (errAll) {
                WidgetFeed.eventsAll = [];
                console.error('Error In Fetching events', errAll);
              };
          console.log("##############", eventFromDate)
          CalenderFeedApi.getFeedEvents(WidgetFeed.data.content.feedUrl, eventFromDate, 0, true, 'ALL').then(successAll, errorAll);
        }
        /*This is used to fetch the data from the Calendar API*/
        var getFeedEvents = function (url, date, refreshData) {
          WidgetFeed.NoDataFound = false;
          Buildfire.spinner.show();
          var success = function (result) {
              Buildfire.spinner.hide();
                if(!WidgetFeed.events){
                  WidgetFeed.events = [];
                }
              var repeat_until = getLastDayMonth();
              var resultRepeating = expandRepeatingEvents(result, repeat_until, false);

              WidgetFeed.events = WidgetFeed.events.length ? WidgetFeed.events.concat(resultRepeating) : resultRepeating;
              WidgetFeed.offset = WidgetFeed.offset + PAGINATION.eventsCount;
              console.log("??????????????????????",result, resultRepeating);

              //if (WidgetFeed.events.length < result.totalEvents) {
              //  WidgetFeed.busy = false;
              //}
                currentLayout = WidgetFeed.data.design.itemDetailsLayout;
                if(resultRepeating.length) {
                  WidgetFeed.NoDataFound = false;
                  WidgetFeed.clickEvent =  false;
                }
                else {
                  WidgetFeed.NoDataFound = true;
                  WidgetFeed.clickEvent =  true;
                }
            }

            , error = function (err) {
              Buildfire.spinner.hide();
             // WidgetFeed.eventsAll = [];
              WidgetFeed.events = [];
              WidgetFeed.NoDataFound = true;
              WidgetFeed.clickEvent =  false;
              console.error('Error In Fetching events', err);
            };
          WidgetFeed.getAllEvents();
          CalenderFeedApi.getFeedEvents(url, eventFromDate, 0, true, 'ALL').then(success, error);
        };
        /*This method will give the current date*/
        $scope.today = function () {
          $scope.dt = new Date();
        };
        /**
         * DataStore.onUpdate() is bound to listen any changes in datastore
         */
        var onUpdateCallback = function (event) {
          if (event && event.tag === TAG_NAMES.EVENTS_FEED_INFO) {
            WidgetFeed.data = event.data;
            if (!WidgetFeed.data.design)
              WidgetFeed.data.design = {};
            if (!WidgetFeed.data.content)
              WidgetFeed.data.content = {};
            if (!WidgetFeed.data.design.itemDetailsLayout) {
              WidgetFeed.data.design.itemDetailsLayout = LAYOUTS.itemDetailsLayout[0].name;
            }

            if (!WidgetFeed.data.content.feedUrl) {
              currentFeedUrl="";
              WidgetFeed.events = [];
              WidgetFeed.eventsAll=null;
              WidgetFeed.offset = 0;
              WidgetFeed.busy = false;
              WidgetFeed.eventClassToggle=false;
              WidgetFeed.loadMore(false);
            } else if (currentFeedUrl != WidgetFeed.data.content.feedUrl) {
              currentFeedUrl = WidgetFeed.data.content.feedUrl;
              WidgetFeed.events = [];
              WidgetFeed.eventsAll=null;
              WidgetFeed.getAllEvents();
              WidgetFeed.offset = 0;
              WidgetFeed.busy = false;
              WidgetFeed.eventClassToggle = true;
              WidgetFeed.loadMore(false);
            }
            console.log("WidgetFeed.events",WidgetFeed.events)
            if (currentLayout && currentLayout != WidgetFeed.data.design.itemDetailsLayout){
             if (WidgetFeed.events && WidgetFeed.events.length) {
                Location.goTo("#/event/"+0);
             }
            }
          }
        };
        DataStore.onUpdate().then(null, null, onUpdateCallback);

        ///*This method is to use to plot the event on to calendar*/
        //$scope.getDayClass = function (date, mode) {
        //  if (mode === 'day') {
        //    var dayToCheck = new Date(date).setHours(0, 0, 0, 0);
        //
        //    for (var i = 0; i < $scope.events.length; i++) {
        //      var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);
        //
        //      if (dayToCheck === currentDay) {
        //        return $scope.events[i].status;
        //      }
        //    }
        //  }
        //
        //  return '';
        //};

        /*This method is use to swipe left and right the event*/
        WidgetFeed.addEvents = function (e, i, toggle) {
          toggle ? WidgetFeed.swiped[i] = true : WidgetFeed.swiped[i] = false;
        };

        WidgetFeed.setAddedEventToLocalStorage= function(eventId){
          var addedEvents = [];
          addedEvents = JSON.parse(localStorage.getItem('localAddedEventsFeed'));
          if(!addedEvents){
            addedEvents=[];
          }
          addedEvents.push(eventId);
          localStorage.setItem('localAddedEventsFeed', JSON.stringify(addedEvents));
        }

        WidgetFeed.getAddedEventToLocalStorage = function(eventId){
          var localStorageSavedEvents = [];
          localStorageSavedEvents = JSON.parse(localStorage.getItem('localAddedEventsFeed'));
          if(!localStorageSavedEvents){
            localStorageSavedEvents=[];
          }
          return localStorageSavedEvents.indexOf(eventId);
        }

        /*This method is called when we click to add an event to native calendar*/
        WidgetFeed.addEventsToCalendar = function (event, i) {
          WidgetFeed.Keys = Object.keys(event);
          WidgetFeed.startTimeZone = WidgetFeed.Keys[0].split('=');
          WidgetFeed.endTimeZone = WidgetFeed.Keys[1].split('=');

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

          if(WidgetFeed.getAddedEventToLocalStorage(event.UID)!=-1){
            alert("Event already added in calendar");
          }
          console.log("inCal3eventFeed:", eventEndDate, event);
          if (buildfire.device && buildfire.device.calendar && WidgetFeed.getAddedEventToLocalStorage(event.UID)==-1) {
            WidgetFeed.setAddedEventToLocalStorage(event.UID);
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
                , recurrence: event.repeatType
                , recurrenceEndDate: new Date(2025, 6, 1, 0, 0, 0, 0, 0)
               }
              }
              ,
              function (err, result) {
                if (err)
                  console.log("******************" + err);
                else {
                  WidgetFeed.swiped[i] = false;
                  console.log('worked ' + JSON.stringify(result));
                  WidgetFeed.setAddedEventToLocalStorage(event.UID);
                  alert("Event added to calendar");
                  $scope.$digest();
                }
              }
            );
          }
          console.log(">>>>>>>>", event);
        };

        /*This method is used to get the event from the date where we clicked on calendar*/
        WidgetFeed.getEventDate = function (date) {
          formattedDate = date.getFullYear() + "-" + moment(date).format("MM") + "-" + ("0" + date.getDate()).slice(-2) + "T00:00:00";
          timeStampInMiliSec =moment(formattedDate).unix()*1000;
          $rootScope.selectedDate = timeStampInMiliSec;
          //if($rootScope.chnagedMonth==undefined){
          //  configureDate = new Date();
          //  eventFromDate = moment(configureDate.getFullYear()+"-"+moment(configureDate).format("MM")+"-"+'01').unix()*1000;
          //}else{
          //  configureDate = new Date($rootScope.chnagedMonth);
          //  eventFromDate = moment(configureDate.getFullYear()+"-"+moment(configureDate).format("MM")+"-"+'01').unix()*1000;
          // }
          if(WidgetFeed.calledDate !== timeStampInMiliSec){

            WidgetFeed.events = null;
            WidgetFeed.clickEvent =  true;
            WidgetFeed.offset = 0;
            WidgetFeed.busy = false;
            WidgetFeed.calledDate = timeStampInMiliSec;
            WidgetFeed.loadMore(false);
          }
        };

        /*This method is used to load the from Datastore*/
        WidgetFeed.loadMore = function (refreshData) {
          if (WidgetFeed.busy) return;
          WidgetFeed.busy = true;
          if (WidgetFeed.data.content.feedUrl) {
            getFeedEvents(WidgetFeed.data.content.feedUrl, timeStampInMiliSec, refreshData);
          }
          else{
            WidgetFeed.eventsAll=[];
          }
        };

        /*This method is used to navigate to particular event details page*/
        WidgetFeed.openDetailsPage = function (event, index) {
          EventCache.setCache(event);
          Location.goTo('#/event/' + index);
        };

        /*
         * Enable pull down to refresh and fetch fresh data
         */

        Buildfire.datastore.onRefresh(function () {
          WidgetFeed.events = [];
          WidgetFeed.eventsAll=null;
          WidgetFeed.offset = 0;
          WidgetFeed.busy = false;
          formattedDate = currentDate.getFullYear() + "-" + moment(currentDate).format("MM") + "-" + ("0" + currentDate.getDate()).slice(-2) + "T00:00:00";
          timeStampInMiliSec = +new Date(formattedDate);
          WidgetFeed.getAllEvents();
          WidgetFeed.loadMore(true);
        });

        /**
         * init() function invocation to fetch previously saved user's data from datastore.
         */

        init();

        $scope.today();

        $scope.getDayClass = function (date, mode) {

          var dayToCheck = new Date(date).setHours(0, 0, 0, 0);
          var currentDay;

          for (var i = 0; i < WidgetFeed.eventsAll.length; i++) {
            if(WidgetFeed.eventsAll[i])
            currentDay = new Date(WidgetFeed.eventsAll[i].startDate).setHours(0, 0, 0, 0);
            console.log("AAAAAAAAA33333", currentDay)
            if (dayToCheck === currentDay) {
              return 'eventDate';
            }
          }
        };

        $scope.$on("$destroy", function () {
          DataStore.clearListener();
        });

        $rootScope.$on("ROUTE_CHANGED", function (e) {
          Buildfire.datastore.onRefresh(function () {
            WidgetFeed.events = null;
            WidgetFeed.eventsAll=null;
            WidgetFeed.offset = 0;
            WidgetFeed.busy = false;
            formattedDate = currentDate.getFullYear() + "-" + moment(currentDate).format("MM") + "-" + ("0" + currentDate.getDate()).slice(-2) + "T00:00:00";
            timeStampInMiliSec = +new Date(formattedDate);
            WidgetFeed.getAllEvents();
            WidgetFeed.loadMore(true);
          });
          DataStore.onUpdate().then(null, null, onUpdateCallback);
        });

      }]);
})(window.angular, window.buildfire);
