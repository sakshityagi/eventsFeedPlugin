describe('Unit : eventsFeedPlugin design services', function () {
  describe('Unit: Buildfire Provider', function () {
    var Buildfire;
    beforeEach(module('eventsFeedPluginDesign'));

    beforeEach(inject(function (_Buildfire_, $q) {
      Buildfire = _Buildfire_;

    }));
    it('Buildfire should exist and be an object', function () {
      expect(typeof Buildfire).toEqual('object');
    });
  });

  describe('Unit : DataStore Factory', function () {
    var DataStore, Buildfire, STATUS_MESSAGES, STATUS_CODE, q;
    beforeEach(module('eventsFeedPluginDesign'));
    beforeEach(inject(function (_DataStore_, _STATUS_CODE_, _STATUS_MESSAGES_) {
      DataStore = _DataStore_;
      STATUS_CODE = _STATUS_CODE_;
      STATUS_MESSAGES = _STATUS_MESSAGES_;
      Buildfire = {
        datastore: {}
      };
      Buildfire.datastore = jasmine.createSpyObj('Buildfire.datastore', ['get','getById','insert','update', 'save', 'deleteById']);
      Buildfire.datastore.get();
      Buildfire.datastore.getById();
      Buildfire.datastore.insert();
      Buildfire.datastore.update();
      Buildfire.datastore.save();
      Buildfire.datastore.deleteById();

    }));
    it("creates spies for each requested function", function () {
      expect(Buildfire.datastore.get).toBeDefined();
      expect(Buildfire.datastore.getById).toBeDefined();
      expect(Buildfire.datastore.insert).toBeDefined();
      expect(Buildfire.datastore.update).toBeDefined();
      expect(Buildfire.datastore.save).toBeDefined();
      expect(Buildfire.datastore.deleteById).toBeDefined();
    });

    it("Methods that the spies were called", function () {
      expect(Buildfire.datastore.get).toHaveBeenCalled();
      expect(Buildfire.datastore.getById).toHaveBeenCalled();
      expect(Buildfire.datastore.insert).toHaveBeenCalled();
      expect(Buildfire.datastore.update).toHaveBeenCalled();
      expect(Buildfire.datastore.deleteById).toHaveBeenCalled();
    });
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
    it('DataStore.deleteById should exist and be a function', function () {
      expect(typeof DataStore.deleteById).toEqual('function');
    });
  });

});

