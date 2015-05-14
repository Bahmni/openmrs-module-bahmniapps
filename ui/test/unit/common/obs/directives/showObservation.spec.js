'use strict';

describe("ensure that the directive show-observation works properly", function () {

    var scope, rootScope, filter,httpBackend,compile, q, bahmniDateTimeFilter;

    var html = '<show-observation  show-details-button="showDetailsButton" patient="patient" observation="observation" show-date="showDate" show-time="showTime"></show-observation>';

    var observation = {
        "value": 1,
        "concept": {"shortName": null, "name": "Other", "set": true, "units": null, "conceptClass": "Misc", "dataType": "N/A"},
        "conceptUuid" : "otherUuid",
        "observationDateTime" : "2014-10-21T11:30:47.000+0530"
    };

    var patient = {identifier: 'GAN1234', name: 'Ram Singh', uuid: 'p-uuid-1', activeVisitUuid: 'v-uuid-1'};

    beforeEach(module('bahmni.common.obs'));
    beforeEach(module('bahmni.common.uiHelper'));

    beforeEach(inject(function($filter, $compile, $httpBackend, $rootScope, $q, bahmniDateTimeFilter){
        filter = $filter;
        compile = $compile;
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        q = $q;
        bahmniDateTimeFilter = bahmniDateTimeFilter;
    }));

    it("should test print, toggle", function () {

        scope = rootScope.$new();
        scope.showDetailsButton = true;
        scope.patient = patient;
        scope.observation = observation;
        scope.showDate = false;
        scope.showTime = false;

        httpBackend.expectGET("../common/obs/views/showObservation.html").respond("<div>dummy</div>");

        var compiledEle = compile(html)(scope);

        scope.$digest();
        httpBackend.flush();

        var compiledScope = compiledEle.isolateScope();
        scope.$digest();

        expect(compiledScope).not.toBeUndefined();
        expect(compiledScope.print).toBeFalsy();
        compiledScope.toggle(observation)
        expect(observation.showDetails).toBeTruthy();
        expect(compiledScope.dateString(observation)).toBe(null);
    });

    it("dateString() should return only date", function () {

        scope = rootScope.$new();
        scope.showDetailsButton = true;
        scope.patient = patient;
        scope.observation = observation;
        scope.showDate = false;
        scope.showTime = true;

        httpBackend.expectGET("../common/obs/views/showObservation.html").respond("<div>dummy</div>");

        var compiledEle = compile(html)(scope);

        scope.$digest();
        httpBackend.flush();

        var compiledScope = compiledEle.isolateScope();
        scope.$digest();

        expect(compiledScope).not.toBeUndefined();
        expect(compiledScope.dateString(observation)).toBe('11:30 am');
    });

    it("dateString() should return datetime", function () {

        scope = rootScope.$new();
        scope.showDetailsButton = true;
        scope.patient = patient;
        scope.observation = observation;
        scope.showDate = true;
        scope.showTime = true;

        httpBackend.expectGET("../common/obs/views/showObservation.html").respond("<div>dummy</div>");

        var compiledEle = compile(html)(scope);

        scope.$digest();
        httpBackend.flush();

        var compiledScope = compiledEle.isolateScope();
        scope.$digest();

        expect(compiledScope).not.toBeUndefined();
        expect(compiledScope.dateString(observation)).toBe('21 Oct 14 11:30 am');
    });
});
