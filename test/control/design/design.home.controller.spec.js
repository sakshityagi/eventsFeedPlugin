/**
 * Created by ttnd on 4/9/15.
 */
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
        DesignHome = $controller('DesignHomeCtrl', {
            $scope: $scope,
            $q: q,
            DataStore: DataStore,
            TAG_NAMES: TAG_NAMES
        });
    });


    describe('Variable Unit: DesignHome.layouts', function () {
        it('it should pass if DesignHome.layouts match the result', function () {
            expect(DesignHome.layouts).toEqual({
                listLayouts: [
                    {name: "Layout_1"},
                    {name: "Layout_2"}
                ]
            });
        });
    });


})
;