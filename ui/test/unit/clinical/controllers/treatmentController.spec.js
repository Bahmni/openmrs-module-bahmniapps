'use strict';

describe("TreatmentController", function () {

    beforeEach(module('bahmni.clinical'));


    var scope, newTreatment, editTreatment;

    beforeEach(inject(function ($controller, $rootScope) {
        newTreatment = new Bahmni.Clinical.DrugOrderViewModel({}, {});
        editTreatment = new Bahmni.Clinical.DrugOrderViewModel(null, null);
        scope = $rootScope.$new();
        scope.consultation = {};
        scope.currentBoard = {extension: {}, extensionParams: {}};
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

    describe("Add", function () {
        it("should copy over existing treatment into array of new treatments", function () {
            var treatment = {drugName: true};
            scope.treatment = treatment;
            scope.add();
            expect(scope.treatments.length).toBe(1);
            expect(scope.treatments[0]).toBe(treatment);
        });

        it("should empty treatment", function () {
            scope.treatment = {drugName: true};
            scope.add();
            expect(scope.treatment.drugName).toBeFalsy();
        });
    });

    describe("Save", function () {
        it("should check for any unsaved drug orders", function () {
            expect(scope.unsavedDrugOrders()).toBeTruthy();

            scope.addForm = {$invalid: true};
            scope.treatment = {drugName: true};
            expect(scope.unsavedDrugOrders()).toBeTruthy();
        });
    });

    describe("Clear Form", function () {
        var isSameAs = function(obj1, obj2){
            for(var key in obj1){
                if(key !== "_effectiveStartDate" && typeof obj1[key] !== 'function'){
                    if (!_.isEqual(obj1[key], obj2[key])) {
                        return false;
                    }
                }
            }
            return true;
        };
        it("should do nothing if form is blank", function () {
            scope.treatment = newTreatment;
            scope.clearForm();
            expect(isSameAs(scope.treatment, newTreatment)).toBeTruthy();
        });

        it("should clear treatment object", function () {
            scope.treatment = {drugName: 'Calpol'};
            scope.clearForm();
            expect(isSameAs(scope.treatment, newTreatment)).toBeTruthy();
        });

        it("should reset the treatment being edited", function () {
            scope.treatments = [editTreatment, newTreatment, newTreatment];
            scope.edit(0);
            scope.clearForm();
            expect(isSameAs(scope.treatment, newTreatment)).toBeTruthy();
            expect(scope.treatments[0].isBeingEdited).toBeFalsy();
            expect(scope.treatments[0].isDiscontinuedAllowed).toBeTruthy();
        });
    });

});