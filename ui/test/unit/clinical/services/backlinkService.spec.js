describe("LabOrderResultService", function() {
    var rootScope;
    var mockState;
    var backlinkService;
    var mockWindow;

    beforeEach(module('bahmni.common.uiHelper'));

    beforeEach(module(function ($provide) {
        mockState = jasmine.createSpyObj('$state', ['go']);
        mockWindow = {location: {href: "currentHref"}};

        $provide.value('$window', mockWindow);
        $provide.value('$state', mockState);
    }));

    beforeEach(inject(['backlinkService', function (backlinkServiceInjected) {
        backlinkService = backlinkServiceInjected;
    }]));

    describe("addUrl", function(){
        it("should add goToUrlFuntion for label", function() {
            backlinkService.addUrl({label: "SomeLabel", url: "someUrl"});
            var urlFunction = backlinkService.getUrlByLabel('SomeLabel');

            expect(urlFunction).not.toBeNull();
            urlFunction();
            expect(mockWindow.location.href).toBe("someUrl");
        });

        it("should add goToStateFuntion for label", function() {
            backlinkService.addUrl({label: "SomeLabel", state: "someState"});
            var stateFunction = backlinkService.getUrlByLabel('SomeLabel');

            expect(stateFunction).not.toBeNull();
            stateFunction();
            expect(mockState.go.calls.mostRecent().args[0]).toBe("someState");
        });
    });
});