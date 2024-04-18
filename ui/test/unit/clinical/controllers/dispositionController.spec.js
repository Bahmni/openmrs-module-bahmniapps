'use strict';

describe("DispositionController", function () {

    var scope, rootScope ,controller, retrospectiveEntry, retrospectiveEntryService, dispositionService, dispositionActions, appService, translate, $state;

    beforeEach(module('bahmni.clinical'));

    beforeEach(module(function($provide){
        dispositionActions = [
            {"name": {"name": "Admit Patient"}, "mappings": [{"display": "org.openmrs.module.emrapi: ADMIT"}]},
            {"name": {"name": "Undo Discharge"}, "mappings": [{"display": "org.openmrs.module.emrapi: UNDO_DISCHARGE"}]},
            {"name": {"name": "Discharge Patient"}, "mappings": [{"display": "org.openmrs.module.emrapi: DISCHARGE"}]},
            {"name": {"name": "Transfer Patient"}, "mappings": [{"display": "org.openmrs.module.emrapi: TRANSFER"}]}];
        dispositionService = jasmine.createSpyObj('dispositionService',['getDispositionNoteConcept', 'getDispositionActions']);
        dispositionService.getDispositionNoteConcept.and.returnValue(specUtil.simplePromise({data: {results: [{uuid: "uuid"}]}}));
        dispositionService.getDispositionActions.and.returnValue(specUtil.simplePromise({data: {results: [{answers: dispositionActions}]}}));
        $provide.value('dispositionService', dispositionService);
        translate = jasmine.createSpyObj('$translate',['instant']);
        $provide.value('$translate', translate);
        $provide.value('$state', $state);
    }));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        rootScope = $rootScope;
        controller = $controller;
        rootScope.consultation = {preSaveHandler: new Bahmni.Clinical.Notifier()};
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        var appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
        appService.getAppDescriptor.and.returnValue(appDescriptor);
        appDescriptor.getConfigValue.and.returnValue(true);

        retrospectiveEntry = Bahmni.Common.Domain.RetrospectiveEntry.createFrom(Date.parse('2015-07-01'));
        retrospectiveEntryService = jasmine.createSpyObj('retrospectiveEntryService', ['getRetrospectiveEntry']);
        retrospectiveEntryService.getRetrospectiveEntry.and.returnValue(retrospectiveEntry);


       initController();
    }));

    it("should return true if it is in retrospective mode", function () {
        expect(scope.isRetrospectiveMode()).toBeTruthy();
    });

    it("should not save the dispositionNotes when its empty", function () {
        scope.consultation.disposition = {'code':'ADMIT'};
        scope.dispositionCode = 'ADMIT';
        scope.dispositionNote ={'value':''};
        scope.consultation.disposition.additionalObs = {};
        scope.$destroy();
        expect(scope.consultation.disposition.additionalObs).toEqual([]);
    });

    it("should save the dispositionNotes when its Not empty", function () {
        scope.consultation.disposition = {'code':'ADMIT'};
        scope.dispositionCode = 'ADMIT';
        scope.dispositionNote ={'value':'some notes'};
        scope.consultation.disposition.additionalObs ={'value':'some notes'} ;
        scope.$destroy();
        expect(scope.consultation.disposition.additionalObs.length).toBe(1);
        expect(scope.consultation.disposition.additionalObs[0]).toEqual({'value':'some notes','voided' : false});
    });

    it("should save the dispositionNotes when its voided ", function () {
        scope.consultation.disposition = {'code':'ADMIT'};
        scope.dispositionCode = 'ADMIT';
        scope.dispositionNote ={'uuid':'someUuid','value':'','voided':true};
        scope.consultation.disposition.additionalObs ={'uuid':'someUuid','value':'','voided':true} ;
        scope.$destroy();
        expect(scope.consultation.disposition.additionalObs.length).toBe(1);
        expect(scope.consultation.disposition.additionalObs[0]).toEqual({'uuid':'someUuid','value':'','voided':true});
    });

    it("should unvoid the note when when dispositionNotes is added back", function () {
        scope.consultation.disposition = {'code':'ADMIT'};
        scope.dispositionCode = 'ADMIT';
        scope.dispositionNote ={'uuid':'someUuid','value':'','concept': {'uuid': 'someUuid'},'voided':false};
        scope.consultation.disposition.additionalObs ={'uuid':'someUuid','value':'','voided':true} ;
        scope.$destroy();
        expect(scope.consultation.disposition.additionalObs.length).toBe(1);
        expect(scope.consultation.disposition.additionalObs[0]).toEqual({'uuid':'someUuid','value':'','concept': {'uuid': 'someUuid'},'voided':true});
        initController();
        scope.dispositionCode = 'ADMIT';
        scope.dispositionNote ={'uuid':'someUuid','value':'some notes'};
        scope.$destroy();
        expect(scope.consultation.disposition.additionalObs[0]).toEqual({'uuid':'someUuid','value':'some notes','voided':false});
    });

    it("should show disposition action as admit patient", function () {
        scope.$parent.visitSummary = null;
        expect(scope.dispositionActions).toEqual([{"name": "Admit Patient", "code": "ADMIT"}]);
    });

    it("should show disposition action as admit patient if he is discharged", function () {
        scope.$parent.visitSummary = {isDischarged: function () {
            return true;
        }};
        initController();
        expect(scope.dispositionActions).toEqual([{"name": "Undo Discharge", "code": "UNDO_DISCHARGE"}]);
    });

    it("should show disposition actions as transfer patient and transfer patient if he is admitted", function () {
        scope.$parent.visitSummary = {isDischarged: function () {
            return false;
        }, isAdmitted : function () {
            return true;
        }};
        initController();
        expect(scope.dispositionActions).toEqual([{"name": "Transfer Patient", "code": "TRANSFER"},{"name": "Discharge Patient", "code": "DISCHARGE"}]);
    });

    it("should display configured disposition actions irrespective of admission status", function () {
        dispositionActions.push({"name":{"name":"extraDisposition","mappings":[]}});
        scope.$parent.visitSummary = null;
        initController();
        expect(scope.dispositionActions).toContain({"name":"extraDisposition","code":""});
    });

    it("should give undefined value if any of the default values are deleted", function () {
        _.pullAt(dispositionActions,[0]);
        initController();
        expect(scope.dispositionActions[0]).toEqual(undefined);
    });

    var initController = function () {
        scope = rootScope.$new();
        controller('DispositionController', {
            $scope: scope,
            $rootScope: rootScope,
            retrospectiveEntryService: retrospectiveEntryService,
            dispositionService: dispositionService,
            appService: appService,
            $translate: translate

        });
    }
});