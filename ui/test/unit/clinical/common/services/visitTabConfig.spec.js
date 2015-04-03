describe("VisitTabConfigService", function () {

    var appService;
    var visitTabConfigService;

    var config = [{
        b: "ball"
    }];

    var mandatoryConfig = [{
        a: "apple"
    }];

    beforeEach(module('bahmni.clinical'));

    beforeEach(module(function () {
        appService = jasmine.createSpyObj('appService', ['loadConfig', 'loadMandatoryConfig']);
        appService.loadMandatoryConfig.and.returnValue(specUtil.respondWith({data: mandatoryConfig}));
        appService.loadConfig.and.returnValue(specUtil.respondWith({data: config}));
    }));

    beforeEach(module(function ($provide) {
        $provide.value('appService', appService);
        $provide.value('$q', Q);
    }));

    beforeEach(inject(['visitTabConfig', function (visitTabConfig) {
        visitTabConfigService = visitTabConfig;
    }]));

    it("should load the visit config", function (done) {
        visitTabConfigService.load().then(function() {
            expect(visitTabConfigService.tabs.length).toEqual(2);
            expect(visitTabConfigService.tabs).toEqual([mandatoryConfig[0], config[0]]);
            done();
        });
    });
});