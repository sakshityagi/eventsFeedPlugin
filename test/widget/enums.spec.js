describe('Unit : eventsFeedPluginWidget widget Enums', function () {
  var TAG_NAMES, STATUS_CODE, ADDRESS_TYPE;
  beforeEach(module('eventsFeedPluginWidget'));

  beforeEach(inject(function (_TAG_NAMES_, _STATUS_CODE_) {
    TAG_NAMES = _TAG_NAMES_;
    STATUS_CODE = _STATUS_CODE_;
  }));


  describe('Enum : STATUS_CODE', function () {
    it('STATUS_CODE should exist and be an object', function () {
      expect(typeof STATUS_CODE).toEqual('object');
    });
    it('STATUS_CODE.INSERTED should exist and equals to "inserted"', function () {
      expect(STATUS_CODE.INSERTED).toEqual('inserted');
    });
    it('STATUS_CODE.UPDATED should exist and equals to "updated"', function () {
      expect(STATUS_CODE.UPDATED).toEqual('updated');
    });
    it('STATUS_CODE.UNDEFINED_DATA should exist and equals to "UNDEFINED_DATA"', function () {
      expect(STATUS_CODE.UNDEFINED_DATA).toEqual('UNDEFINED_DATA');
    });
    it('STATUS_CODE.NOT_FOUND should exist and equals to "NOTFOUND"', function () {
      expect(STATUS_CODE.NOT_FOUND).toEqual('NOTFOUND');
    });
    it('STATUS_CODE.UNDEFINED_OPTIONS should exist and equals to "UNDEFINED_OPTIONS"', function () {
      expect(STATUS_CODE.UNDEFINED_OPTIONS).toEqual('UNDEFINED_OPTIONS');
    });
    it('STATUS_CODE.UNDEFINED_ID should exist and equals to "UNDEFINED_ID"', function () {
      expect(STATUS_CODE.UNDEFINED_ID).toEqual('UNDEFINED_ID');
    });
    it('STATUS_CODE.ITEM_ARRAY_FOUND should exist and equals to "ITEM_ARRAY_FOUND"', function () {
      expect(STATUS_CODE.ITEM_ARRAY_FOUND).toEqual('ITEM_ARRAY_FOUND');
    });
    it('STATUS_CODE.NOT_ITEM_ARRAY should exist and equals to "NOT_ITEM_ARRAY"', function () {
      expect(STATUS_CODE.NOT_ITEM_ARRAY).toEqual('NOT_ITEM_ARRAY');
    });
  });

});
