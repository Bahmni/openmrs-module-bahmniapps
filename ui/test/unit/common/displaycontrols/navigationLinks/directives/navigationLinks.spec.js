'use strict';

describe('NavigationalLinks DisplayControl', function () {
    var scope, rootScope, filter, httpBackend, compile, q, compiledScope, appService, compileDirective;
    var html = '<navigation-links params="section" link-params="linkParams"></navigation-links>';
    var mandatoryConfig = { sections: [{type: "General"}, {type: "Discharge Summary"}] };
    var linkParams = {patientUuid: "patientUuid", visitUuid: "visitUuid"};
    var spinner = jasmine.createSpyObj('spinner', ['show', 'hide', 'forPromise']);

    var showLinks = ["home", "visit", "inpatient"];
    var customLinks = [
        {
            "title":"CONSULTATION_PAGE_KEY",
            "url": "../clinical/#/consultation/patient/{{patientUuid}}/concept-set-group/observations/",
            "icon": "C"
        }
    ];

    var appDescriptor = {};
    appDescriptor.formatUrl = function(){};

    beforeEach(module('bahmni.common.displaycontrol.navigationlinks'));

    beforeEach(module(function ($provide) {
        $provide.value('appService', appService);
        $provide.value('spinner', spinner);
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


        compileDirective = function (params, linkParams) {
            scope = rootScope.$new();
            scope.section = params;
            scope.linkParams = linkParams;
            httpBackend.expectGET("../common/displaycontrols/navigationlinks/views/navigationLinks.html").respond("<div>dummy</div>");
            var compiledEle = compile(html)(scope);
            scope.$digest();
            httpBackend.flush();
            compiledScope = compiledEle.isolateScope();
            scope.$digest();
        }
    }));


    it('should get the navigationLinks html', function () {
        var params = {showLinks: showLinks, customLinks: customLinks};
        compileDirective(params, linkParams);
        expect(compiledScope).not.toBeUndefined();
    });

    it('should show url for existing parameters', function () {
        var params = {showLinks: showLinks, customLinks: customLinks};
        compileDirective(params, linkParams);
        expect(compiledScope.showUrl({"url": "../home/#/dashboard"})).toBeTruthy();
    });

    it('should not show url for non-existing parameters', function () {
        var params = {showLinks: showLinks, customLinks: customLinks};
        compileDirective(params, linkParams);
        expect(compiledScope.showUrl({
            "title": "Patient ADT Page",
            "url": "../adt/#/patient/{{patientUuid}}/visit/{{visit}}/"
        })).toBeFalsy();
    });

    it('should show only links configured under showLinks config', function () {
        var params = {showLinks: showLinks};
        compileDirective(params, linkParams);
        expect(compiledScope.getLinks().length).toBe(showLinks.length);
    });

    it('should show only links configured under customLinks config', function () {
        var params = {customLinks: customLinks};
        compileDirective(params, linkParams);
        expect(compiledScope.getLinks().length).toBe(customLinks.length);
    });

    it('should show collection of links configured under customLinks and showLinks config', function () {
        var params = {showLinks: showLinks, customLinks: customLinks};
        compileDirective(params, linkParams);
        expect(compiledScope.getLinks().length).toBe(customLinks.length + showLinks.length);
    });

    it('should not show any link if both customLinks and showLinks config are not configured', function () {
        compileDirective({}, linkParams);
        expect(compiledScope.getLinks().length).toBe(0);
    });

    it('should not show any link if both customLinks and showLinks config are not configured', function () {
        showLinks = ["home", "visit", "inpatient"];
        compileDirective({}, linkParams);
        expect(compiledScope.getLinks().length).toBe(0);
    });

    it('should not show url if the linkParams does not contain visitUuid', function () {
        var showLinks = ["home", "visit", "registration", "inpatient", "enrolment", "visitAttribute"];
        var params = {showLinks: showLinks, customLinks: customLinks};
        var linkParams = {patientUuid: "patientUuid"};
        compileDirective(params, linkParams);
        expect(compiledScope.showUrl({url: "../clinical/#/default/patient/{{patientUuid}}/dashboard/visit/{{visitUuid}}/?encounterUuid=active"})).toBeFalsy();
    });
});
