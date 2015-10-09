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
    beforeEach(inject(function (_DataStore_, _STATUS_CODE_, _STATUS_MESSAGES_) {
      DataStore = _DataStore_;
      STATUS_CODE = _STATUS_CODE_;
      STATUS_MESSAGES = _STATUS_MESSAGES_;
      Buildfire = {
        datastore: {}
      };
      Buildfire.datastore = jasmine.createSpyObj('Buildfire.datastore', ['get','insert','update', 'save', 'delete']);
    }));

    it('DataStore should exist and be an object', function () {
      expect(typeof DataStore).toEqual('object');
    });
    it('DataStore.get should exist and be a function', function () {
      expect(typeof DataStore.get).toEqual('function');
    });
    it('DataStore.save should exist and be a function', function () {
      expect(typeof DataStore.save).toEqual('function');
    });
    it('Buildfire.datastore.get have been called', function () {
      expect(DataStore.get).toHaveBeenCalled();
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
  });
  describe('factory: DataStore', function() {
    var factory = null;
    beforeEach(inject(function(_DataStore_) {
      DataStore = _DataStore_;
    }));
    it('Should define methods', function() {
      expect(DataStore.get).toBeDefined();
      expect(DataStore.save).toEqual(jasmine.any(Function))
    });
  });
});

