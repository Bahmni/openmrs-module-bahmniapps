'use strict';

describe("drugOrderViewModel", function () {
    var sampleTreatment = function (extensionParams, routes) {
        var sampleTreatment = new Bahmni.Clinical.DrugOrderViewModel(extensionParams, routes);
        sampleTreatment.drugName = "calpol 500mg(tablets)";
        sampleTreatment.instructions = "Before Meals";
        sampleTreatment.duration = "10";
        sampleTreatment.durationUnit = "Days";
        sampleTreatment.scheduledDate = "21/12/2014";
        sampleTreatment.quantity = "12";
        sampleTreatment.quantityUnit = "Capsule";
        return sampleTreatment;
    };

    it("should get the text to be displayed in the treatment list", function () {
        var treatment = sampleTreatment({}, []);
        treatment.route = "Orally";
        treatment.uniformDosingType.dose = "1";
        treatment.uniformDosingType.doseUnits = "Capsule";
        treatment.uniformDosingType.frequency = "Once a day";
        expect(treatment.getDescription()).toBe("1 Capsule, Once a day, Before Meals, Orally - 10 Days (12 Capsule)");
    });

    it("should get the text to be displayed in the treatment list with dosage instructions", function () {
        var treatment = sampleTreatment({}, []);
        treatment.frequencyType = "variable";
        treatment.route = "Orally";
        treatment.dose = null;
        treatment.frequency = null;
        treatment.variableDosingType = {
            morningDose: 1,
            afternoonDose: 1,
            eveningDose: 1
        };

        expect(treatment.getDescription()).toBe("1-1-1, Before Meals, Orally - 10 Days (12 Capsule)")
    });

    it("should get the default route from the config", function() {
        var treatment = sampleTreatment({defaultRoute: "Orally"}, [{name: "Intramuscular"}, {name: "Orally"}]);
        expect(treatment.route).toBe("Orally");
    });

    it("should get default durationUnit from config if available", function() {
        var treatment = sampleTreatment({defaultDurationUnit: "Days"}, [{name: "Days"}, {name: "Months"}]);
        expect(treatment.durationUnit).toBe("Days");
    });

    it("should reset dosingType when changing frequency type", function() {
        var sampleTreatment = new Bahmni.Clinical.DrugOrderViewModel({}, []);
        sampleTreatment.uniformDosingType = {
            dose: 1,
            doseUnits: "Tablets",
            frequency: "Once a Day"
        };
        sampleTreatment.setFrequencyType("variable");
        expect(sampleTreatment.uniformDosingType).toEqual({});
    });
});