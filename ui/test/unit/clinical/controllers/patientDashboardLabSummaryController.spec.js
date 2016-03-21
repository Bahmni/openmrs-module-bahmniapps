'use strict';

describe("PatientDashboardLabSummaryController", function () {

    beforeEach(module('bahmni.clinical'));

    var scope;
    var stateParams;

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        scope.ngDialogData = {
            expandedViewConfig: {a: 1, b: 2},
            patient: {uuid: "some uuid"}
        }
        stateParams = {
            patientUuid: "some uuid"
        };
        $controller('PatientDashboardLabSummaryController', {
            $scope: scope,
            $stateParams: stateParams,
        });
    }));

    it("should initialize", function () {
        expect(scope.expandedViewConfig).toEqual({a: 1, b: 2, patientUuid: "some uuid"});
        expect(scope.patient).toEqual({uuid: "some uuid"});
    });
});