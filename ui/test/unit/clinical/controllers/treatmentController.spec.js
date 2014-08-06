'use strict';

describe("TreatmentController", function () {

    beforeEach(module('bahmni.clinical'));

    var scope;
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();

        $controller('TreatmentController', {
            $scope: scope,
            $rootScope: null,
            treatmentService: null,
            contextChangeHandler: null,
            registerTabService: null,
            treatmentConfig: {}
        });
    }));

    it("should copy over existing treatment into array of new treatments", function () {
        var treatment = {someObject: true};
        scope.treatment = treatment;
        scope.add();
        expect(scope.treatments.length).toBe(1);
        expect(scope.treatments[0]).toBe(treatment);
    });

    it("should empty treatment on add", function () {
        scope.treatment = {someObject: true};
        scope.add();
        expect(scope.treatment.someObject).toBeFalsy();
    });

    var sampleTreatment = function () {
        return {drugName: "calpol 500mg(tablets)",
            dose: "1",
            doseUnit: {
                "rootConcept": null,
                "name": "Capsule"
            },
            frequency: {
                "uuid": "bac2e9f1-170e-11e4-a196-0800271c1b75",
                "frequencyPerDay": 1,
                "name": "Once a day"
            },
            instructions: {
                "rootConcept": null,
                "name": "Before Meals"
            },
            morningDose: null,
            afternoonDose: null,
            eveningDose: null,
            duration: "10",
            durationUnit: {
                "rootConcept": null,
                "name": "Days"
            },
            route: {
                "rootConcept": null,
                "name": "Orally"
            },
            scheduledDate: "21/12/2014",
            quantity: "12",
            quantityUnit: {
                "rootConcept": null,
                "name": "Capsule"
            }
        };
    };

    it("should get the text to be displayed in the treatment list", function () {
        var treatment = sampleTreatment();
        var text = scope.getText(treatment);
        expect(text).toBe("calpol 500mg(tablets) - 1 Capsule, Once a day, Before Meals, Orally - 10 Days (12 Capsule)");
    });

    it("should get the text to be displayed in the treatment list with dosage instructions", function () {
        var treatment = sampleTreatment();
        treatment.dose = null;
        treatment.frequency = null;
        treatment.morningDose = 1;
        treatment.afternoonDose = 1;
        treatment.eveningDose = 1;
        var text = scope.getText(treatment);
        expect(text).toBe("calpol 500mg(tablets) - 1-1-1, Before Meals, Orally - 10 Days (12 Capsule)")
    })
});