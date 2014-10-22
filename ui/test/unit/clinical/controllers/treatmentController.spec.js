'use strict';

describe("TreatmentController", function () {

    beforeEach(module('bahmni.clinical'));
    var scope, registerTabService, rootScope, contextChangeHandler, newTreatment, editTreatment;
    beforeEach(inject(function ($controller, $rootScope, RegisterTabService) {
        scope = $rootScope.$new();
        rootScope = $rootScope;
        $rootScope.consultation = {};
        scope.consultation = {};
        newTreatment = new Bahmni.Clinical.DrugOrderViewModel({}, {});
        editTreatment = new Bahmni.Clinical.DrugOrderViewModel(null, null);
        scope.currentBoard = {extension: {}, extensionParams: {}};
        contextChangeHandler = jasmine.createSpyObj('contextChangeHandler', ['add']);
        scope.addForm = {$invalid: false, $valid: true};
        registerTabService = RegisterTabService;

        $controller('TreatmentController', {
            $scope: scope,
            $rootScope: rootScope,
            treatmentService: null,
            contextChangeHandler: contextChangeHandler,
            registerTabService: RegisterTabService,
            treatmentConfig: {}
        });
    }));

    describe("add()", function () {
        it("adds treatment object to list of treatments", function () {
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

        it("clears existing treatment object", function () {
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

    describe("saveTreatment()", function () {
        it("copies treatments object to rootScope", function () {
            var drugOrder = Bahmni.Tests.drugOrderViewModelMother.build({}, []);
            drugOrder.durationUnit = {name: "Days"};
            drugOrder.route = {name: "Orally"};
            drugOrder.uniformDosingType.dose = "1";
            drugOrder.uniformDosingType.doseUnits = "Capsule";
            drugOrder.uniformDosingType.frequency = {name: "Once a day"};
            drugOrder.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;

            scope.consultation.newlyAddedTreatments = [ drugOrder];
            registerTabService.fire();
            expect(rootScope.consultation.drugOrders.length).toBe(1);
        });

        it("should not save the treatment if a discontinued drug order is added at the same time", function() {
            var drugOrder = Bahmni.Tests.drugOrderViewModelMother.build({}, []);
            drugOrder.durationUnit = {name: "Days"};
            drugOrder.route = {name: "Orally"};
            drugOrder.uniformDosingType.dose = "1";
            drugOrder.uniformDosingType.doseUnits = "Capsule";
            drugOrder.uniformDosingType.frequency = {name: "Once a day"};
            drugOrder.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;

            scope.addForm = {};
            scope.consultation.newlyAddedTreatments = [drugOrder];

            var discontinuedDrug = drugOrder;
            discontinuedDrug.isMarkedForDiscontinue = true;

            scope.consultation.discontinuedDrugs = [discontinuedDrug];
            scope.treatments = [discontinuedDrug];

            var add = contextChangeHandler.add;
            var contextChangeFunction = add.calls.mostRecent().args[0]

            contextChangeFunction();

            expect(scope.consultation.errorMessage).toBe("Discontinuing and ordering the same drug is not allowed. Instead, use edit.");
        })
    })
});