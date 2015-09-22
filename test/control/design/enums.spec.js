describe('Unit : eventsFeedPluginDesign design Enums', function () {
  var TAG_NAMES, STATUS_CODE;
  beforeEach(module('eventsFeedPluginDesign'));

  beforeEach(inject(function (_TAG_NAMES_, _STATUS_CODE_) {
    TAG_NAMES = _TAG_NAMES_;
    STATUS_CODE = _STATUS_CODE_;
  }));

  describe('Enum : TAG_NAMES', function () {
    it('TAG_NAMES should exist and be an object', function () {
      expect(typeof TAG_NAMES).toEqual('object');
    });
    it('TAG_NAMES.CONTACT_INFO should exist and equals to "ContactInfo"', function () {
      expect(TAG_NAMES.CONTACT_INFO).toEqual('ContactInfo');
    });
  });

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
    it('STATUS_CODE.NOT_FOUND should exist and equals to "NOTFOUND"', function () {
      expect(STATUS_CODE.NOT_FOUND).toEqual('NOTFOUND');
    });
  });


});
