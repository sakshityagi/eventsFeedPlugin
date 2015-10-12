describe('Unit : event Feed Plugin widget.feed.controller.js', function () {
    var WidgetEvent, scope, $rootScope, $controller, Buildfire, ActionItems, TAG_NAMES, STATUS_CODE, LAYOUTS, STATUS_MESSAGES, CONTENT_TYPE, q;
    beforeEach(module('eventsFeedPluginWidget'));
    var editor;
    beforeEach(inject(function (_$rootScope_, _$q_, _$controller_, _TAG_NAMES_, _STATUS_CODE_, _LAYOUTS_, _STATUS_MESSAGES_) {
        $rootScope = _$rootScope_;
        q = _$q_;
        scope = $rootScope.$new();
        $controller = _$controller_;
        TAG_NAMES = _TAG_NAMES_;
        STATUS_CODE = _STATUS_CODE_;
        STATUS_MESSAGES = _STATUS_MESSAGES_;
        LAYOUTS = _LAYOUTS_;
        Buildfire = {
            components: {
                carousel: {
                    editor: function (name) {
                        return {}
                    },
                    viewer: function (name) {
                        return {}
                    }
                }
            }
        };
        ActionItems = jasmine.createSpyObj('ActionItems', ['showDialog']);
        Buildfire.components.carousel = jasmine.createSpyObj('Buildfire.components.carousel', ['editor','onAddItems']);

    }));

    beforeEach(function () {
        WidgetEvent = $controller('WidgetEventCtrl', {
            $scope: scope,
            $q: q,
            Buildfire: Buildfire,
            TAG_NAMES: TAG_NAMES,
            ActionItems: ActionItems,
            STATUS_CODE: STATUS_CODE,
            CONTENT_TYPE: CONTENT_TYPE,
            LAYOUTS: LAYOUTS
        });
    });
    var options = {width:"100px", height:"100px"};
    var url;
    describe('Units: units should be Defined', function () {
     });

    describe('$destroy', function() {
        it('should invoke when get $destroy', function() {
            $rootScope.$broadcast('$destroy');
        });
    });

    describe('WidgetEvent.cropImage invike', function() {
        it('It should invoke when it call', function() {
            WidgetEvent.cropImage(url,options)
        });

        it('It should invoke if options.height is true', function() {
            expect(options.height).toEqual("100px")
        });

        it('It should invoke if options.width is true', function() {
            expect(options.width).toEqual("100px")
        });
    });

    describe('Carousel:LOADED', function() {options
        it('should invoke when get Carousel:LOADED', function() {
            $rootScope.$broadcast('Carousel:LOADED');
        });
    });

})
;