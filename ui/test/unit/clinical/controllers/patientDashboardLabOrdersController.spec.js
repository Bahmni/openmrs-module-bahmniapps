'use strict';

describe("PatientDashboardLabOrdersController", function () {

    beforeEach(module('bahmni.clinical'));

    var scope;
    var stateParams;
    var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
    var labResultSection = {
        "title": "Lab Results",
        "type": "labOrders",
        "dashboardConfig": {
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
        spinner.forPromise.and.callFake(function () {
            return {}
        });
        stateParams = {
            patientUuid: "some uuid"
        };
    }));

    describe("when initialized", function () {
        it("creates configuration for displaying lab order display parameters", function () {
            scope.dashboard = Bahmni.Common.DisplayControl.Dashboard.create({
                "dashboardName": "General",
                "sections": [labResultSection]
            });
            controller('PatientDashboardLabOrdersController', {
                $scope: scope,
                $stateParams: stateParams,
                spinner: spinner
            });
            var params = scope.dashboardConfig;
            expect(params.patientUuid).toBe("some uuid");
            expect(params.showNormalValues).toBe(labResultSection.dashboardConfig.showNormalValues);
        });

        it("passes in just the patient uuid when no parameters specified", function () {
            scope.dashboard = Bahmni.Common.DisplayControl.Dashboard.create({
                "dashboardName": "General",
                "sections": []
            });
            controller('PatientDashboardLabOrdersController', {
                $scope: scope,
                $stateParams: stateParams
            });

            var params = scope.dashboardConfig;
            expect(params.patientUuid).toBe("some uuid");
        });

    });
});