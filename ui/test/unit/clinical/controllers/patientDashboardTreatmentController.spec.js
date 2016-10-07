'use strict';

describe("PatientDashboardTreatmentController", function () {

    beforeEach(module('bahmni.clinical'));

    var scope, ngDialog;

    var treatmentConfigParams = {
        title: "Treatments",
        type: "treatment",
        dashboardConfig: {
            title: null,
            showChart: false,
            showTable: true,
            numberOfVisits: 2,
            showOtherActive: true,
            showCommentsExpanded: false
        },
        expandedViewConfig: {
            title: null,
            showChart: false,
            showTable: true,
            numberOfVisits: 1,
            showOtherActive: true,
            showCommentsExpanded: false
        }
    };

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        scope.patient = {
            uuid: "patient uuid"
        };

        ngDialog = jasmine.createSpyObj('ngDialog', ['open']);

        var config = {
            "dashboardName": "General",
            "sections": [treatmentConfigParams]
        };

        scope.dashboard = Bahmni.Common.DisplayControl.Dashboard.create(config);

        $controller('PatientDashboardTreatmentController', {
            $scope: scope,
            ngDialog: ngDialog
        });
    })
    )
    ;

    describe("The controller is loaded", function () {
        it("should setup the scope", function () {
            expect(scope.patient.uuid).toBe("patient uuid");
        });
    });

    describe("Should fetch configuration", function () {
        it("should fetch dashboard params", function () {
            var expected = {};
            _.extend(expected, treatmentConfigParams.dashboardConfig || {}, {patientUuid: "patient uuid"});
            expect(expected).toEqual(scope.dashboardConfig);
        });

        it("should fetch summary page params", function () {
            var expected = {};
            _.extend(expected, treatmentConfigParams.expandedViewConfig || {}, {patientUuid: "patient uuid"});
            expect(expected).toEqual(scope.expandedViewConfig);
        });
    });
})
;