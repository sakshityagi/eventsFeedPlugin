describe('Unit: eventsFeedPluginWidget: Services', function () {
  beforeEach(module('eventsFeedPluginWidget'));


  describe('Unit : Buildfire service', function () {
    var Buildfire;
    beforeEach(inject(
      function (_Buildfire_) {
        Buildfire = _Buildfire_;
      }));
    it('Buildfire should exists', function () {
      expect(Buildfire).toBeDefined();
    });
  });

  describe('Unit : DataStore Factory', function () {
    var DataStore, Buildfire, STATUS_MESSAGES, STATUS_CODE, q;
    beforeEach(module('eventsFeedPluginWidget'));
    beforeEach(inject(function (_DataStore_, _STATUS_CODE_, _STATUS_MESSAGES_) {
      DataStore = _DataStore_;
      STATUS_CODE = _STATUS_CODE_;
      STATUS_MESSAGES = _STATUS_MESSAGES_;
      Buildfire = {
        datastore: {}
      };


    }));
    it('DataStore should exist and be an object', function () {
      expect(typeof DataStore).toEqual('object');
    });
    it('DataStore.get should exist and be a function', function () {
      expect(typeof DataStore.get).toEqual('function');
    });
    it('DataStore.getById should exist and be a function', function () {
      expect(typeof DataStore.getById).toEqual('function');
    });
    it('DataStore.insert should exist and be a function', function () {
      expect(typeof DataStore.insert).toEqual('function');
    });
    it('DataStore.update should exist and be a function', function () {
      expect(typeof DataStore.update).toEqual('function');
    });
    it('DataStore.save should exist and be a function', function () {
      expect(typeof DataStore.save).toEqual('function');
    });
  });

  describe('Unit : CalenderFeedApi Factory', function () {
    var STATUS_MESSAGES, STATUS_CODE,CalenderFeedApi;
    beforeEach(module('eventsFeedPluginWidget'));
    beforeEach(inject(function (_STATUS_CODE_, _STATUS_MESSAGES_,_CalenderFeedApi_) {
      STATUS_CODE = _STATUS_CODE_;
      STATUS_MESSAGES = _STATUS_MESSAGES_;
      CalenderFeedApi = _CalenderFeedApi_;

    }));
    it('CalenderFeedApi should exist and be an object', function () {
      expect(typeof CalenderFeedApi).toEqual('object');
    });
    it('CalenderFeedApi.getSingleEventDetails should exist and be a function', function () {
      expect(typeof CalenderFeedApi.getSingleEventDetails).toEqual('function');
    });
    it('CalenderFeedApi.getFeedEvents should exist and be a function', function () {
      expect(typeof CalenderFeedApi.getFeedEvents).toEqual('function');
    });
  });

  describe('Unit : Location Factory', function () {
    var STATUS_MESSAGES, STATUS_CODE,Location;
    beforeEach(module('eventsFeedPluginWidget'));
    beforeEach(inject(function (_STATUS_CODE_, _STATUS_MESSAGES_,_Location_) {
      STATUS_CODE = _STATUS_CODE_;
      STATUS_MESSAGES = _STATUS_MESSAGES_;
      Location = _Location_;

    }));
    it('Location should exist and be an object', function () {
      expect(typeof Location).toEqual('object');
    });
    it('Location.goTo should exist and be a function', function () {
      expect(typeof Location.goTo).toEqual('function');
    });
  });

});