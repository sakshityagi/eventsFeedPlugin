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
      Buildfire.datastore.save();
      Buildfire.datastore.get();

    }));
    it("creates spies for each requested function", function () {
      expect(Buildfire.datastore.get).toBeDefined();
      expect(Buildfire.datastore.save).toBeDefined();
    });

    it("Methods that the spies were called", function () {
      expect(Buildfire.datastore.get).toHaveBeenCalled();
    });
    it('DataStore should exist and be an object', function () {
      expect(typeof DataStore).toEqual('object');
    });
    it('DataStore.get should exist and be a function', function () {
      expect(typeof DataStore.get).toEqual('function');
    });
    it('DataStore.save should exist and be a function', function () {
      expect(typeof DataStore.save).toEqual('function');
    });
    describe('Mock get method of service', function () {
      var spy;
      var TAG_NAME="TEST";
      beforeEach(inject(function () {
        spy = spyOn(DataStore, 'get').and.callFake(function () {

        });

      }));
      it('DataStore.get should be defined', function () {
        DataStore.get(TAG_NAME);
        expect(DataStore.get).toBeDefined();
      });
      it('DataStore.get should pass if it calls', function () {
        DataStore.get();
        expect(spy).toHaveBeenCalled();
      });

    });
  });

});

