'use strict';

describe("PatientDashboardTreatmentController", function () {

    beforeEach(module('bahmni.clinical'));

    var scope;
    var stateParams;
    var _clinicalAppConfigService;
    var _retrospectiveEntryService;

    var treatmentSection = {
        "title": "Treatment",
        "name": "treatment",
        "numberOfVisits": 1
    };

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        stateParams = {
            patientUuid: "some uuid"
        }

        _clinicalAppConfigService = jasmine.createSpyObj('clinicalAppConfigService', ['getPatientDashBoardSectionByName']);
        _clinicalAppConfigService.getPatientDashBoardSectionByName.and.returnValue(treatmentSection);

        var retrospectiveEntry = Bahmni.Common.Domain.RetrospectiveEntry.createFrom(Date.now());
        _retrospectiveEntryService = jasmine.createSpyObj('retrospectiveEntryService', ['getRetrospectiveEntry']);
        _retrospectiveEntryService.getRetrospectiveEntry.and.returnValue(retrospectiveEntry);

        $controller('PatientDashboardTreatmentController', {
            $scope: scope,
            $stateParams: stateParams,
            clinicalAppConfigService: _clinicalAppConfigService,
            retrospectiveEntryService : _retrospectiveEntryService

        });
    }));

    describe("The controller is loaded", function () {
        it("should setup the scope", function () {
            expect(scope.patientUuid).toBe('some uuid');
        });
    });

    describe("When configuration doesn't have active attribute", function () {
        it("should isSectionNeeded for active return false", function () {
            expect(scope.isSectionNeeded("active")).toBeFalsy();
        });
        it("should isSectionNeeded for past return true", function () {
            expect(scope.isSectionNeeded("past")).toBeTruthy();
        });
    });

    describe("When configuration has active attribute under treatment section", function () {
        it("should isSectionNeeded for active return false if config has active false", function () {
            treatmentSection.active = false;
            expect(scope.isSectionNeeded("active")).toBeFalsy();
        });
        it("should isSectionNeeded for active return true if config has active true", function () {
            treatmentSection.active = true;
            expect(scope.isSectionNeeded("active")).toBeTruthy();
        });
        it("should isSectionNeeded for past return true", function () {
            expect(scope.isSectionNeeded("past")).toBeTruthy();
        });
    });
});