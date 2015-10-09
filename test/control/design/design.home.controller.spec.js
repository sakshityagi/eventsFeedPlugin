describe('Unit : eventsFeedPluginDesign design.home.controller.js', function () {
  var $scope, DesignHome, $rootScope, q, $controller, DataStore, TAG_NAMES, STATUS_CODE, STATUS_MESSAGES;
  beforeEach(module('eventsFeedPluginDesign'));

  beforeEach(inject(function (_$rootScope_, _$q_, _$controller_, _DataStore_, _TAG_NAMES_, _STATUS_CODE_, _STATUS_MESSAGES_) {
    $rootScope = _$rootScope_;
    q = _$q_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    DataStore = _DataStore_;
    TAG_NAMES = _TAG_NAMES_;
    STATUS_CODE = _STATUS_CODE_;
    STATUS_MESSAGES = _STATUS_MESSAGES_;
  }));

  beforeEach(function () {
    inject(function ($injector, $q) {
      $rootScope = $injector.get('$rootScope');
      $scope = $rootScope.$new();
      DesignHome = $injector.get('$controller')('DesignHomeCtrl', {
        $scope: $scope,
          data: {
            design: {
              itemDetailsLayout: 'test',
              itemDetailsBgImage: 'test1'
            }
        },
        Buildfire: {
          imageLib: {
            showDialog: function (options, callback) {
              controller._callback(null, {selectedFiles: ['test']});
            }
          },
          components: {
            images: {
              thumbnail: function () {

              }
            }
          },
          datastore: {
            get: function () { },
            save: function () { }
          }
        }
      });
      q = $q;
    });
  });


  describe('changeItemLayout', function () {
    it('should change the value of item details layout when called', function () {
      controller.changeItemLayout('test');
      expect(DesignHome.data.design["itemDetailsLayout"]).toEqual('test');
    });
  });
  describe('Variable Unit: DesignHome.layouts', function () {
    it('it should pass if DesignHome.layouts match the result', function () {
      expect(DesignHome.layouts).toEqual({
        itemDetailsLayout: [
          {name: "Event_Item_1"},
          {name: "Event_Item_2"},
          {name: "Event_Item_3"},
          {name: "Event_Item_4"}
        ]
      });
    });
  });
});