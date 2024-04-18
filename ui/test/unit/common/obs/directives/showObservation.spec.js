'use strict';

describe("ensure that the directive show-observation works properly", function () {

    var scope, rootScope, filter, httpBackend, compile, q, ngDialog;
    var html = '<show-observation  show-details-button="showDetailsButton" patient="patient" observation="observation" show-date="showDate" show-time="showTime"></show-observation>';

    var obsDate = new Date();

    var observation = {
        "value": 1,
        "concept": {"shortName": null, "name": "Other", "set": true, "units": null, "conceptClass": "Misc", "dataType": "N/A"},
        "conceptUuid" : "otherUuid",
        "observationDateTime" : obsDate
    };

    var patient = {identifier: 'GAN1234', name: 'Ram Singh', uuid: 'p-uuid-1', activeVisitUuid: 'v-uuid-1'};

    beforeEach(module('bahmni.common.obs'));
    beforeEach(module('bahmni.common.uiHelper'));

    beforeEach(module(function($provide) {
        var conceptSetService = jasmine.createSpyObj('conceptSetService', ['getConceptSetMembers']);
        ngDialog = jasmine.createSpyObj('ngDialog', ['open']);
        $provide.value('conceptSetService', conceptSetService);
        $provide.value('ngDialog', ngDialog);
    }));

    beforeEach(inject(function($filter, $compile, $httpBackend, $rootScope, $q){
        filter = $filter;
        compile = $compile;
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        q = $q;
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
        expect(compiledScope.dateString(observation)).toBe(moment(obsDate).format("h:mm a"));
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
        expect(compiledScope.dateString(observation)).toBe(moment(obsDate).format("DD MMM YYYY h:mm a"));
    });

    it("should open video in a new dialog", function () {
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

        compiledScope.openVideoInPopup(scope.observation);
        expect(ngDialog.open).toHaveBeenCalledWith(
            {
                template: '../common/obs/views/showVideo.html',
                closeByDocument: false,
                className: 'ngdialog-theme-default',
                showClose: true,
                data: {observation: scope.observation}
            }
        )
    });
});
