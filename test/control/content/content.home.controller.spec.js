describe('Unit : Content Feed Plugin content.home.controller.js', function () {
    var ContentHome, scope, $rootScope, $controller, Buildfire, ActionItems, TAG_NAMES, STATUS_CODE, LAYOUTS, STATUS_MESSAGES, CONTENT_TYPE, q, Utils;
    beforeEach(module('eventsFeedPluginContent'));
    var editor;
    beforeEach(inject(function (_$rootScope_, _$q_, _$controller_, _TAG_NAMES_, _STATUS_CODE_, _LAYOUTS_, _STATUS_MESSAGES_, _CalendarFeed_) {
        $rootScope = _$rootScope_;
        q = _$q_;
        scope = $rootScope.$new();
        $controller = _$controller_;
        TAG_NAMES = _TAG_NAMES_;
        STATUS_CODE = _STATUS_CODE_;
        STATUS_MESSAGES = _STATUS_MESSAGES_;
        LAYOUTS = _LAYOUTS_;
        CalendarFeed = _CalendarFeed_;
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

            },     spinner: {
                hide: function () {
                    return {}
                },
                show: function () {
                    return {}
                }

            }
        };

        ActionItems = jasmine.createSpyObj('ActionItems', ['showDialog']);
    }));

    beforeEach(function () {
        ContentHome = $controller('ContentHomeCtrl', {
            $scope: scope,
            $q: q,
            Buildfire: Buildfire,
            TAG_NAMES: TAG_NAMES,
            ActionItems: ActionItems,
            STATUS_CODE: STATUS_CODE,
            CONTENT_TYPE: CONTENT_TYPE,
            LAYOUTS: LAYOUTS,
            Utils:Utils
        });
    });
    describe('It will test the defined methods', function () {
        it('it should pass if ContentHome is defined', function () {
            expect(ContentHome).not.toBeUndefined();
        });
        it('it should pass if validateCalUrl is called', function () {
       //   ContentHome.validateCalUrl();
        });
        it('it should pass if clearData is called', function () {
            ContentHome.clearData();
        });


    });
    describe('Validate calendar URL', function () {
        var spy;
        beforeEach(inject(function () {
                spy = spyOn(CalendarFeed, 'validate').and.callFake(function () {
                    var deferred = $q.defer();
                    deferred.resolve(1);
                    return deferred.promise;
            });

        }));
        it('CalendarFeed.validate should pass if it Not calls the Cal URL', function () {
            ContentHome.calUrl=false;
            ContentHome.validateCalUrl();
            console.log("aaaaaaaaaaaaaaaa",Buildfire.spinner)
            expect(spy).not.toHaveBeenCalled();
        });

        it('CalendarFeed.validate should pass if it calls Cal URL', function () {
            ContentHome.calUrl=true;
            ContentHome.validateCalUrl();
            expect(spy).toHaveBeenCalled();
        });

        it('ContentHome.validLinkSuccess should pass if its value is false', function () {
            ContentHome.calUrl=true;
            ContentHome.validLinkSuccess = false;
            ContentHome.validateCalUrl();
            expect(ContentHome.validLinkSuccess).toEqual(false);
        });
        it('ContentHome.data.content.feedUrl should pass if it is null', function () {
            ContentHome.calUrl=true;
            ContentHome.data.content.feedUrl = "";
            ContentHome.validateCalUrl();
             expect(ContentHome.data.content.feedUrl).toEqual("");
        });
        it('ContentHome.validLinkFailure should pass if it is null', function () {
            ContentHome.calUrl=true;
            ContentHome.validLinkFailure = false;
            ContentHome.validateCalUrl();

            expect(ContentHome.validLinkFailure).toEqual(false);
        });
    });

})
;