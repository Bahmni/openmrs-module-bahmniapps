'use strict';

describe("TreatmentControllerTest", function () {

    var treatmentService;
    var scope;
    var treatmentController;
    var drug;
    var dosageFrequencies = {
        "results": [
            {
                "uuid": "62ff9e01-2696-11e3-895c-0800271c1b75",
                "name": {"name": "Dosage Frequency" },
                "answers": [
                    { "display": "qD", "name": {"name": "qD"}}
                ]
            }
        ]};
    var dosageInstructions = {
        "results": [
            {
                "uuid": "63272569-2696-11e3-895c-0800271c1b75",
                "name": {"name": "Dosage Instructions"},
                "answers": [
                    { "display": "AC", "name": {"name": "AC"}}
                ]
            }
        ]
    };

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function () {
        treatmentService = jasmine.createSpyObj('treatmentService', ['search']);
    }));


    var setUp = function () {
        drug = new Bahmni.Clinical.TreatmentDrug();
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            scope.consultation = [];
            scope.dosageFrequencyConfig = dosageFrequencies;
            scope.dosageInstructionConfig = dosageInstructions;
            treatmentController = $controller('TreatmentController', {
                $scope: scope,
                $rootScope: scope,
                treatmentService: treatmentService
            });
        });
    };

    describe("checkValidityOfInputFieldsTest", function () {
        it('should not be valid drug if non empty drug has no uuid', function () {
            setUp();

            drug.empty = false;
            expect(scope.isValidDrugName(drug)).toBe(false);
        });

        it('should not be valid drug if dosage frequency is empty when prn [take as required] is not set', function () {
            setUp();

            drug.empty = false;
            drug.prn = false;
            drug.dosageFrequency = '';
            expect(scope.isValidDosageFrequency(drug)).toBe(false);

            drug.prn = false;
            drug.dosageFrequency = null;
            expect(scope.isValidDosageFrequency(drug)).toBe(false);

            drug.prn = false;
            drug.dosageFrequency = undefined;
            expect(scope.isValidDosageFrequency(drug)).toBe(false);

            drug.prn = true;
            drug.dosageFrequency = undefined;
            expect(scope.isValidDosageFrequency(drug)).toBe(true);

        });

        it('should not be valid drug if numberOfDosageDays is empty or null', function () {
            setUp();

            drug.empty = false;
            drug.numberOfDosageDays = '';
            expect(scope.isValidNumberOfDosageDays(drug)).toBe(false);

            drug.numberOfDosageDays = null;
            expect(scope.isValidNumberOfDosageDays(drug)).toBe(false);

            drug.numberOfDosageDays = undefined;
            expect(scope.isValidNumberOfDosageDays(drug)).toBe(false);

            drug.numberOfDosageDays = "3";
            expect(scope.isValidNumberOfDosageDays(drug)).toBe(true);

        });

        it('should not be valid drug if numberPerDosage is empty or null', function () {
            setUp();

            drug.empty = false;
            drug.numberPerDosage = '';
            expect(scope.isValidNumberPerDosage(drug)).toBe(false);

            drug.numberPerDosage = null;
            expect(scope.isValidNumberPerDosage(drug)).toBe(false);

            drug.numberPerDosage = undefined;
            expect(scope.isValidNumberPerDosage(drug)).toBe(false);

            drug.numberPerDosage = "3";
            expect(scope.isValidNumberPerDosage(drug)).toBe(true);

        });
    });

    describe("checkIfSelectedDrugsHaveCorrectDataTest", function () {
        it('should set treatment drug with the correct data on drug being selected', function () {
            setUp();
            var drugUuid = "drug-uuid";

            scope.selectedDrugs = [new Bahmni.Clinical.TreatmentDrug()];

            var chosenDrug = {};
            chosenDrug.uuid = drugUuid;
            chosenDrug.name = "my drug";
            chosenDrug.doseStrength = "100";
            chosenDrug.units = "mg";
            chosenDrug.dosageForm = {"name": {"name": "Tablet"}};
            chosenDrug.concept= {uuid :"concept uuid"};

            scope.searchResults = [chosenDrug];

            scope.onDrugSelected(0, drugUuid);
            var drugAfterSelection = scope.selectedDrugs[0];
            expect(drugAfterSelection.empty).toBe(false);
            expect(drugAfterSelection.uuid).toBe(drugUuid);
            expect(drugAfterSelection.name).toBe("my drug");
            expect(drugAfterSelection.originalName).toBe("my drug");
            expect(drugAfterSelection.strength).toBe("100 mg");
            expect(drugAfterSelection.dosageForm).toBe("Tablet");
            expect(drugAfterSelection.concept.uuid).toBe("concept uuid");
            expect(drugAfterSelection.numberPerDosage).toBe(1);
            expect(drugAfterSelection.empty).toBe(false);

            //unselected form values remain unchanged
            expect(drugAfterSelection.prn).toBe(false);
            expect(drugAfterSelection.dosageFrequency).toBe("");
            expect(drugAfterSelection.dosageInstruction).toBe("");
            expect(drugAfterSelection.numberOfDosageDays).toBe("");
            expect(drugAfterSelection.notes).toBe("");

        });

    });

    describe("disableTabChangeIfThereAreInvalidDrugsTest", function () {
        it('should allow tab switch if no drug is selected', function () {
            setUp();
            var emptyDrug = new Bahmni.Clinical.TreatmentDrug();
            scope.selectedDrugs = [ emptyDrug];
            expect(scope.beforeContextChange()).toBe(true);
        });

        it('should not allow tab switch if drug is selected and mandatory fields not filled', function () {
            setUp();
            var drug = new Bahmni.Clinical.TreatmentDrug();
            drug.empty = false;

            scope.selectedDrugs = [drug];
            expect(scope.beforeContextChange()).toBe(false);
        });

        it('should not allow tab switch if drug is selected and mandatory fields are partially filled', function () {
            setUp();
            var drug = new Bahmni.Clinical.TreatmentDrug();
            drug.empty = false;
            drug.uuid = "drug uuid";
            drug.name = "drug name";
            drug.prn = true;

            scope.selectedDrugs = [drug];
            expect(scope.beforeContextChange()).toBe(false);
        });

        it('should allow tab switch if drug is selected and all mandatory fields are filled', function () {
            setUp();
            var drug = new Bahmni.Clinical.TreatmentDrug();
            drug.empty = false;
            drug.uuid = "drug uuid";
            drug.name = "drug name";
            drug.prn = true;
            drug.numberOfDosageDays = 2;
            drug.numberPerDosage = 1;
            var emptyDrug = new Bahmni.Clinical.TreatmentDrug();

            scope.selectedDrugs = [drug, emptyDrug];
            expect(scope.beforeContextChange()).toBe(true);
        });
    });

});
