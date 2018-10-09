describe("VisitTabConfigService", function () {

    var appService;
    var visitTabConfigService;

    var section1 = {type: "extra section 1"};
    var section2 = {type: "mandatory section 2"};
    var section3 = {type: "mandatory section 3"};
    var config = [
        {a: "apple", defaultSections: true, sections: [section1]},
        {b: "ball"}
    ];
    var mandatoryConfig = { sections: [section2, section3] };

    beforeEach(module('bahmni.clinical'));

    beforeEach(module(function () {
        appService = jasmine.createSpyObj('appService', ['loadConfig', 'loadMandatoryConfig']);
        appService.loadMandatoryConfig.and.returnValue(specUtil.respondWith({data: mandatoryConfig}));
    }));

    beforeEach(module(function ($provide) {
        $provide.value('appService', appService);
        $provide.value('$q', Q);
    }));

    beforeEach(inject(['visitTabConfig', function (visitTabConfig) {
        visitTabConfigService = visitTabConfig;
    }]));

    it("should concat mandatory sections if defaultSections flag is present", function (done) {
        appService.loadConfig.and.returnValue(specUtil.respondWith(config));
        var load = visitTabConfigService.load();
        load.then(function(response) {
            expect(response.tabs).toEqual([{a: "apple", defaultSections: true, sections: [section2, section3, section1]}, {b: "ball"}]);
            done();
        });
    });

    it("should concat mandatory sections even if there are no other sections defined", function (done) {
        delete config[0].sections;
        appService.loadConfig.and.returnValue(specUtil.respondWith(config));
        var load = visitTabConfigService.load();
        load.then(function(response) {
            expect(response.tabs).toEqual([{a: "apple", defaultSections: true, sections: [section2, section3]}, {b: "ball"}]);
            done();
        });
    });

    it("should override the mandatory section config if config section is present", function (done) {
        var section4 = {type: "mandatory section 2", config:{key: "value"}};
        var config = [
            {a: "apple", defaultSections: true, sections: [section1, section4]},
            {b: "ball"}
        ];
        appService.loadConfig.and.returnValue(specUtil.respondWith(config));
        var load = visitTabConfigService.load();
        load.then(function(response) {
            expect(response.tabs[0].sections[0]).not.toEqual({type: "mandatory section 2"});
            expect(response.tabs).toEqual([{a: "apple", defaultSections: true, sections: [section4, section3, section1]}, {b: "ball"}]);
            done();
        });
    })
});