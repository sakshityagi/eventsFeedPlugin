describe('Unit: eventsFeedPluginContent content app', function () {
  describe('Unit: app routes', function () {
    beforeEach(module('eventsFeedPluginContent'));
    var location, route, rootScope;
    beforeEach(inject(function (_$location_, _$route_, _$rootScope_,_$compile_) {
      location = _$location_;
      route = _$route_;
      rootScope = _$rootScope_;
      $compile = _$compile_;

    }));

    describe('Home route', function () {
      beforeEach(inject(
        function ($httpBackend) {
          $httpBackend.expectGET('templates/home.html')
            .respond(200);
          $httpBackend.expectGET('/')
            .respond(200);
        }));
    });
  }); });