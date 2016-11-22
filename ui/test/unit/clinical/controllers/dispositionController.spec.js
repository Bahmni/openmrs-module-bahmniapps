'use strict';

describe("DispositionController", function () {

    var scope, rootScope ,controller,retrospectiveEntry,retrospectiveEntryService;

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        rootScope = $rootScope;
        controller = $controller;
        rootScope.consultation = {preSaveHandler: new Bahmni.Clinical.Notifier()};

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
        scope.$destroy();
        expect(scope.consultation.disposition.additionalObs).toEqual([]);
    });

    it("should save the dispositionNotes when its Not empty", function () {
        scope.consultation.disposition = {'code':'ADMIT'};
        scope.dispositionCode = 'ADMIT';
        scope.dispositionNote ={'value':'some notes'};
        scope.$destroy();
        expect(scope.consultation.disposition.additionalObs.length).toBe(1);
        expect(scope.consultation.disposition.additionalObs[0]).toEqual({'value':'some notes','voided' : false});
    });

    it("should save the dispositionNotes when its voided ", function () {
        scope.consultation.disposition = {'code':'ADMIT'};
        scope.dispositionCode = 'ADMIT';
        scope.dispositionNote ={'uuid':'someUuid','value':'','voided':true};
        scope.$destroy();
        expect(scope.consultation.disposition.additionalObs.length).toBe(1);
        expect(scope.consultation.disposition.additionalObs[0]).toEqual({'uuid':'someUuid','value':'','voided':true});
    });

    it("should unvoid the note when when dispositionNotes is added back", function () {
        scope.consultation.disposition = {'code':'ADMIT'};
        scope.dispositionCode = 'ADMIT';
        scope.dispositionNote ={'uuid':'someUuid','value':'','voided':false};
        scope.$destroy();
        expect(scope.consultation.disposition.additionalObs.length).toBe(1);
        expect(scope.consultation.disposition.additionalObs[0]).toEqual({'uuid':'someUuid','value':'','voided':true});
        initController();
        scope.dispositionCode = 'ADMIT';
        scope.dispositionNote ={'uuid':'someUuid','value':'some notes'};
        scope.$destroy();
        expect(scope.consultation.disposition.additionalObs[0]).toEqual({'uuid':'someUuid','value':'some notes','voided':false});
    });

    var initController = function () {
        scope = rootScope.$new();
        controller('DispositionController', {
            $scope: scope,
            $rootScope: rootScope,
            retrospectiveEntryService: retrospectiveEntryService
        });
    }
});