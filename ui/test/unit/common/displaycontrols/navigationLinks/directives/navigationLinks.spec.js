'use strict';

describe('NavigationalLinks DisplayControl', function () {
    var scope, rootScope, filter, httpBackend, compile, q, compiledScope, appService;
    var html = '<navigation-links params="section" link-params="{patientUuid: patient.uuid, visitUuid: visitSummary.uuid}"></navigation-links>';
    var mandatoryConfig = { sections: [{type: "General"}, {type: "Discharge Summary"}] };

    beforeEach(module('bahmni.common.displaycontrol.navigationlinks'));

    beforeEach(module(function ($provide) {
        $provide.value('appService', appService);
    }));

    beforeEach(inject(function($filter, $compile, $httpBackend, $rootScope, $q){
        filter = $filter;
        compile = $compile;
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        appService = jasmine.createSpyObj('appService', ['loadConfig', 'loadMandatoryConfig', 'getAppDescriptor']);
        appService.loadMandatoryConfig.and.returnValue(specUtil.respondWith({data: mandatoryConfig}));
        appService.getAppDescriptor.and.returnValue(appDescriptor);
        q = $q;

        scope = rootScope.$new();
        scope.section = {params: {links: links}};

        httpBackend.expectGET("../common/displaycontrols/navigationlinks/views/navigationLinks.html").respond("<div>dummy</div>");

        var compiledEle = compile(html)(scope);

        scope.$digest();
        httpBackend.flush();

        compiledScope = compiledEle.isolateScope();
        scope.$digest();
    }));


    it('should get the navigationLinks html', function () {
        expect(compiledScope).not.toBeUndefined();
    });

    it('should show url for existing parameters', function () {
        expect(compiledScope.showUrl(links[0])).toBeTruthy();
    });

    it('should not show url for non-existing parameters', function () {
        expect(compiledScope.showUrl({
            "title": "Patient ADT Page",
            "url": "../adt/#/patient/{{patientUuid}}/visit/{{visit}}/"
        })).toBeFalsy();
    });
});

var links = [
    {
        "title": "Home Dashboard",
        "url": "../home/#/dashboard"
    },
    {
        "title": "Patient Visit Page",
        "url": "../clinical/#/patient/{{patientUuid}}/dashboard/visit/{{visitUuid}}"
    },
    {
        "title": "Patient ADT Page",
        "url": "../adt/#/patient/{{patientUuid}}/visit/{{visitUuid}}/"
    },
    {
        "title": "Patient Dashboard",
        "url": "../clinical/#/patient/{{patientUuid}}/dashboard"
    },
    {
        "title": "Discharge Summary Page",
        "url": "../clinical/#/patient/{{patientUuid}}/dashboard/visit/{{visitUuid}}"
    },
    {
        "title": "Program Management Page",
        "url": "../clinical/#/patient/{{patientUuid}}/consultationContext"
    },
    {
        "title": "Consultation",
        "url": "../clinical/#/patient/{{patientUuid}}/concept-set-group/observations"
    }
];

var appDescriptor = {};
appDescriptor.formatUrl = function(){};
