'use strict';

describe("drugOrderViewModel", function () {
    var sampleTreatment = function (extensionParams, routes) {
        var sampleTreatment = new Bahmni.Clinical.DrugOrderViewModel(extensionParams, routes);
        sampleTreatment.drugName = "calpol 500mg(tablets)";
        sampleTreatment.dose = "1";
        sampleTreatment.doseUnit = "Capsule";
        sampleTreatment.frequency = "Once a day";
        sampleTreatment.instructions = "Before Meals";
        sampleTreatment.morningDose = null;
        sampleTreatment.afternoonDose = null;
        sampleTreatment.eveningDose = null;
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
        var text = treatment.getText();
        expect(text).toBe("calpol 500mg(tablets) - 1 Capsule, Once a day, Before Meals, , Orally - 10 Days (12 Capsule)");
    });

    it("should get the text to be displayed in the treatment list with dosage instructions", function () {
        var treatment = sampleTreatment({}, []);
        treatment.route = "Orally";
        treatment.dose = null;
        treatment.frequency = null;
        treatment.morningDose = 1;
        treatment.afternoonDose = 1;
        treatment.eveningDose = 1;
        var text = treatment.getText();
        expect(text).toBe("calpol 500mg(tablets) - 1-1-1, Before Meals, , Orally - 10 Days (12 Capsule)")
    });

    it("should get the default route from the config", function() {
        var treatment = sampleTreatment({defaultRoute: "Orally"}, [{name: "Intramuscular"}, {name: "Orally"}]);
        expect(treatment.route).toBe("Orally");
    });
});