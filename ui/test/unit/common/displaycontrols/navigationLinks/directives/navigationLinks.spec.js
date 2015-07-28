'use strict';

describe('NavigationalLinks DisplayControl', function () {
    var scope, rootScope, filter, httpBackend, compile, q, compiledScope;
    var html = '<navigation-links params="section" link-params="{patientUuid: patient.uuid, visitUuid: visitSummary.uuid}"></navigation-links>';

    beforeEach(module('bahmni.common.displaycontrol.navigationlinks'));

    beforeEach(inject(function($filter, $compile, $httpBackend, $rootScope, $q){
        filter = $filter;
        compile = $compile;
        httpBackend = $httpBackend;
        rootScope = $rootScope;
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

    it('should get dashboard url', function () {
        expect(compiledScope.getUrl(links[0])).toBe("../home/#/dashboard");
    });

    it('should show url for existing parameters', function () {
        expect(compiledScope.showUrl(links[0])).toBeTruthy();
    });

    it('should not show url for non-existing parameters', function () {
        expect(compiledScope.showUrl({
            "title": "Patient ADT Page",
            "url": "../adt/#/patient/:patientUuid/visit/:visit/"
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
        "url": "../clinical/#/patient/:patientUuid/dashboard/visit/:visitUuid"
    },
    {
        "title": "Patient ADT Page",
        "url": "../adt/#/patient/:patientUuid/visit/:visitUuid/"
    },
    {
        "title": "Patient Dashboard",
        "url": "../clinical/#/patient/:patientUuid/dashboard"
    },
    {
        "title": "Discharge Summary Page",
        "url": "../clinical/#/patient/:patientUuid/dashboard/visit/:visitUuid"
    },
    {
        "title": "Program Management Page",
        "url": "../clinical/#/patient/:patientUuid/consultationContext"
    },
    {
        "title": "Consultation",
        "url": "../clinical/#/patient/:patientUuid/concept-set-group/observations"
    }
];