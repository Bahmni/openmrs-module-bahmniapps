describe("VisitTabConfigService", function () {

    var appService;
    var visitTabConfigService;

    var config = [
        {a: "apple", defaultSections: true},
        {b: "ball"}
    ];

    var mandatoryConfig = { c: "cat" };

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
        var load = visitTabConfigService.load();
        load.then(function(response) {
            expect(response.tabs.length).toEqual(2);
            expect(response.tabs).toEqual([{a: "apple", defaultSections: true, c: "cat"}, {b: "ball"}]);
            done();
        });
    });
});