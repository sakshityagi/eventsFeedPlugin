describe('Unit : eventsFeedPlugin content services', function () {
  describe('Unit: Buildfire Provider', function () {
    var Buildfire;
    beforeEach(module('eventsFeedPluginContent'));

    beforeEach(inject(function (_Buildfire_) {
      Buildfire = _Buildfire_;
    }));

    it('Buildfire should exist and be an object', function () {
      expect(typeof Buildfire).toEqual('object');
    });
  });
  describe('Unit : DataStore Factory', function () {
    var DataStore, Buildfire, STATUS_MESSAGES, STATUS_CODE, q;
    beforeEach(module('eventsFeedPluginContent'));
    beforeEach(inject(function ($controller, _$rootScope_, _DataStore_, _STATUS_CODE_,_$q_, _STATUS_MESSAGES_,_CalendarFeed_) {
      DataStore = _DataStore_;
      STATUS_CODE = _STATUS_CODE_;
      STATUS_MESSAGES = _STATUS_MESSAGES_;
      CalendarFeed = _CalendarFeed_;
      $q=_$q_;
      scope = _$rootScope_.$new();
      Buildfire = {
        DataStore: {}
      };
      deferred = _$q_.defer();
      Buildfire.DataStore = jasmine.createSpyObj('Buildfire.datastore', ['get', 'save']);
      Buildfire.calendarfeed = jasmine.createSpyObj('Buildfire.calendarfeed', ['validate','getEvents']);
      spyOn(CalendarFeed, 'validate').and.returnValue(deferred.promise);


      var scope;
      var CalendarFeed;
      var controller;
      var q;
      var deferred;
           CalendarFeed = {
              url : "http:abc.com/aa.ics",
          validate:function(url) {
        deferred = q.defer();
        return deferred.promise;
      }
    };
      $controller('ContentHomeCtrl', {
        $scope: scope,
        CalendarFeed: CalendarFeed
      });
     }));

    it('DataStore should exist and be an object', function () {
      expect(typeof DataStore).toEqual('object');
    });
    it('DataStore.get should exist and be a function', function () {
      expect(typeof DataStore.get).toEqual('function');
    });
    it('DataStore.save should exist and be a function', function () {
      expect(typeof DataStore.save).toEqual('function');
      expect(DataStore.get).toBeDefined();
      expect(DataStore.get).toEqual(jasmine.any(Function))

    });
    it('DataStore.save should exist and be a function', function () {
      spyOn(DataStore, 'get').and.callFake(function () {
        return {
          then: function (callback) {
            return callback(url);
          }
        };
      });
    });


  });
  describe('Unit : CalendarFeed Factory', function () {
    var CalendarFeed;
    beforeEach(module('eventsFeedPluginContent'));

    beforeEach(inject(function (_CalendarFeed_) {
      CalendarFeed = _CalendarFeed_;
    }));
    it('CalendarFeed should exist and be an object', function () {
      expect(typeof CalendarFeed).toEqual('object');
    });
    it('Validate the URL from the validate method', function(){
      expect(typeof CalendarFeed.validate).toEqual('function');
    })
    it('Validate the URL from the validate method', function(){
      expect(typeof CalendarFeed.getEvents).toEqual('function');
    })
    it('DataStore.save should exist and be a function', function () {
      url : "http:abc.com/aa.ics";
      spyOn(CalendarFeed, 'validate').and.callFake(function () {
        return {
          then: function (callback) {
            return callback(url);
          }
        };
      });
    });
  });

});

