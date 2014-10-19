'use strict';

describe("TreatmentController", function () {

    beforeEach(module('bahmni.clinical'));
    var scope;
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        scope.consultation = {};
        scope.currentBoard = {extension: {}};
        $rootScope.contextChangeHandler = {add: function () {
        }};
        scope.addForm = {$invalid: false, $valid: true};

        $controller('TreatmentController', {
            $scope: scope,
            $rootScope: $rootScope,
            treatmentService: null,
            contextChangeHandler: $rootScope.contextChangeHandler,
            registerTabService: null,
            treatmentConfig: {}
        });
    }));

    it("should copy over existing treatment into array of new treatments", function () {
        var treatment = {drugName: true};
        scope.treatment = treatment;
        scope.add();
        expect(scope.treatments.length).toBe(1);
        expect(scope.treatments[0]).toBe(treatment);
    });

    it("should empty treatment on add", function () {
        scope.treatment = {drugName: true};
        scope.add();
        expect(scope.treatment.drugName).toBeFalsy();
    });

    it("should check for any unsaved drug orders", function () {
        expect(scope.unsavedDrugOrders()).toBeTruthy();

        scope.addForm = {$invalid: true};
        scope.treatment = {drugName: true};
        expect(scope.unsavedDrugOrders()).toBeTruthy();
    });
});