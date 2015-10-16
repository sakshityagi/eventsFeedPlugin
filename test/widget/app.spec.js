describe('Unit: eventsFeedPluginWidget widget app', function () {
  describe('Unit: app routes', function () {
    beforeEach(module('eventsFeedPluginWidget'));
    var location, route, rootScope;
    beforeEach(inject(function (_$location_, _$route_, _$rootScope_) {
      location = _$location_;
      route = _$route_;
      rootScope = _$rootScope_;
    }));

    describe('Home route', function () {
      beforeEach(inject(
        function ($httpBackend) {
          $httpBackend.expectGET('templates/home.html')
            .respond(200);
          $httpBackend.expectGET('/')
            .respond(200);
        }));

      it('should load the home page on successful load of location path /', function () {
        location.path('/');
        rootScope.$digest();
        expect(route.current.controller).toBe('WidgetFeedCtrl')
      });
    });
  });

  describe('Unit: getDateFromTimestamp filter', function () {
    beforeEach(module('eventsFeedPluginWidget'));
    var filter;
    beforeEach(inject(function (_$filter_) {
      filter = _$filter_;
    }));

    it('it should pass if "getDateFromTimestamp" filter returns date from given timestamp', function () {
      var result;
      result = filter('getDateFromTimestamp')(1444289669939);
      expect(result).toEqual(8);
    });
  });

  describe('Unit: getMonthFromTimestamp filter', function () {
    beforeEach(module('eventsFeedPluginWidget'));
    var filter;
    beforeEach(inject(function (_$filter_) {
      filter = _$filter_;
    }));

    it('it should pass if "getMonthFromTimestamp" filter returns month from given timestamp', function () {
      expect(typeof filter('getMonthFromTimestamp')).toEqual('function');
    });
  });

  describe('Unit: getTimeZone filter', function () {
    beforeEach(module('eventsFeedPluginWidget'));
    var filter;
    beforeEach(inject(function (_$filter_) {
      filter = _$filter_;
    }));

    it('it should pass if "getTimeZone" filter returns timezone from given timestamp', function () {
      it('it should pass if "getTimeZone" filter returns timezone from given timestamp', function () {
        expect(typeof filter('getTimeZone')).toEqual('function');
      });
    });
  });
});