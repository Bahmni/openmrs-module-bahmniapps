'use strict';

describe("PatientDashboardLabOrdersController", function () {

    beforeEach(module('bahmni.clinical'));

    var scope;
    var stateParams;
    var _clinicalAppConfigService;
    var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
    var labResultSection = {
        "title": "Lab Results",
        "name": "labOrders",
        "dashboardParams": {
            "title": null,
            "showChart": false,
            "showTable": true,
            "showNormalValues": true,
            "showCommentsExpanded": true,
            "showAccessionNotes": true
        }
    };
    var controller;

    beforeEach(inject(function ($controller, $rootScope) {
        controller = $controller;
        scope = $rootScope.$new();

        spinner.forPromise.and.callFake(function(param) {return {}});
        _clinicalAppConfigService = jasmine.createSpyObj('clinicalAppConfigService', ['getPatientDashBoardSectionByName']);
        _clinicalAppConfigService.getPatientDashBoardSectionByName.and.returnValue(labResultSection);


        stateParams = {
            patientUuid: "some uuid"
        };
    }));

    describe("when initialized", function () {
        it("creates configuration for displaying lab order display parameters", function () {
        controller('PatientDashboardLabOrdersController', {
            $scope: scope,
            $stateParams: stateParams,
            spinner: spinner,
            clinicalAppConfigService: _clinicalAppConfigService
        });


            var params = scope.dashboardParams;
            expect(params.patientUuid).toBe("some uuid");
            expect(params.showNormalValues).toBe(labResultSection.dashboardParams.showNormalValues);
        });

        it("passes in just the patient uuid when no parameters specified", function () {
            _clinicalAppConfigService.getPatientDashBoardSectionByName.and.returnValue({});
            controller('PatientDashboardLabOrdersController', {
                $scope: scope,
                $stateParams: stateParams,
                clinicalAppConfigService: _clinicalAppConfigService
            });

            var params = scope.dashboardParams;
            expect(params.patientUuid).toBe("some uuid");
        });

    });
});