'use strict';

describe("PatientDashboardLabOrdersController", function () {

    beforeEach(module('bahmni.clinical'));

    var scope;
    var stateParams;
    var _clinicalConfigService;
    var labResultSection = {
        "title": "Lab Results",
        "name": "labOrders",
        "dashboardParams": {
            "title": null,
            "showInvestigationChart": false,
            "showInvestigationTable": true,
            "showNormalValues": true,
            "showCommentsExpanded": true,
            "showLabManagerNotes": true
        }
    };
    var controller;

    beforeEach(inject(function ($controller, $rootScope) {
        controller = $controller;
        scope = $rootScope.$new();
        _clinicalConfigService = jasmine.createSpyObj('clinicalConfigService', ['getPatientDashBoardSectionByName']);

        stateParams = {
            patientUuid: "some uuid"
        };
    }));

    describe("when initialized", function () {
        it("creates configuration for displaying lab order display parameters", function () {
            _clinicalConfigService.getPatientDashBoardSectionByName.and.returnValue(labResultSection);
            controller('PatientDashboardLabOrdersController', {
                $scope: scope,
                $stateParams: stateParams,
                clinicalConfigService: _clinicalConfigService
            });


            var params = scope.dashboardParams;
            expect(params.patientUuid).toBe("some uuid");
            expect(params.showNormalValues).toBe(labResultSection.dashboardParams.showNormalValues);
        });

        it("passes in just the patient uuid when no parameters specified", function () {
            _clinicalConfigService.getPatientDashBoardSectionByName.and.returnValue({});
            controller('PatientDashboardLabOrdersController', {
                $scope: scope,
                $stateParams: stateParams,
                clinicalConfigService: _clinicalConfigService
            });

            var params = scope.dashboardParams;
            expect(params.patientUuid).toBe("some uuid");
        });

    });
});