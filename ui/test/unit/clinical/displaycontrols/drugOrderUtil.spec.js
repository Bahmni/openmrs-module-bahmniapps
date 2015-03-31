'use strict';

describe("mergeContinuousTreatments", function () {
    var sampleTreatment = function (uuid, instructions, dose, doseUnits, frequency, route, scheduledDate, effectiveStopDate, duration, durationUnits,additionalInstructions,asNeeded) {
        var drugOrderViewModel = new Bahmni.Clinical.DrugOrderViewModel();
        drugOrderViewModel.drug = {
            uuid: uuid
        };
        drugOrderViewModel.instructions = instructions;
        drugOrderViewModel.uniformDosingType.dose = dose;
        drugOrderViewModel.uniformDosingType.doseUnits = doseUnits;
        drugOrderViewModel.uniformDosingType.frequency = frequency;
        drugOrderViewModel.route = route;
        drugOrderViewModel.scheduledDate = scheduledDate;
        drugOrderViewModel.effectiveStopDate = effectiveStopDate;
        drugOrderViewModel.duration = duration;
        drugOrderViewModel.durationUnit = durationUnits;
        drugOrderViewModel.additionalInstructions = additionalInstructions;
        drugOrderViewModel.asNeeded = asNeeded;

        return drugOrderViewModel;
    };

    it("should merge continuous treatments if all information's are same except duration and durationUnits", function () {
        var treatment1 = sampleTreatment("drug.uuid", "instructions", 1, "doseUnits", "frequency", "route", 1420088400000, 1420261200000, 3, "Day(s)");
        var treatment2 = sampleTreatment("drug.uuid", "instructions", 1, "doseUnits", "frequency", "route", 1420347600000, 1420520400000, 3, "Day(s)");

        var continuousTreatments = Bahmni.Clinical.DrugOrder.Util.mergeContinuousTreatments([treatment1, treatment2]);
        expect(continuousTreatments.length).toBe(1);
        expect(continuousTreatments[0].lastStopDate).toBe(1420520400000);
        expect(continuousTreatments[0].span['Day(s)']).toBe(6);
    });

    it("should merge continuous treatments if even though duration and duration units are different", function () {
        var treatment1 = sampleTreatment("drug.uuid", "instructions", 1, "doseUnits", "frequency", "route", 1420088400000, 1420261200000, 3, "Day(s)");
        var treatment2 = sampleTreatment("drug.uuid", "instructions", 1, "doseUnits", "frequency", "route", 1420347600000, 1420520400000, 6, "Week(s)");

        var continuousTreatments = Bahmni.Clinical.DrugOrder.Util.mergeContinuousTreatments([treatment1, treatment2]);
        expect(continuousTreatments.length).toBe(1);
        expect(continuousTreatments[0].lastStopDate).toBe(1420520400000);
        expect(continuousTreatments[0].span['Day(s)']).toBe(3);
        expect(continuousTreatments[0].span['Week(s)']).toBe(6);
    });

    it("should not merge treatments if all information's are same except duration and durationUnits and has one day gap.", function () {
        var treatment1 = sampleTreatment("drug.uuid", "instructions", 1, "doseUnits", "frequency", "route", 1420088400000, 1420261200000, 3, "Day(s)");
        var treatment2 = sampleTreatment("drug.uuid", "instructions", 1, "doseUnits", "frequency", "route", 1420434000000, 1420606800000, 3, "Day(s)");

        var continuousTreatments = Bahmni.Clinical.DrugOrder.Util.mergeContinuousTreatments([treatment1, treatment2]);
        expect(continuousTreatments.length).toBe(2);
    });

    it("should not merge continuous drug's if drug uuid's are different", function () {
        var treatment1 = sampleTreatment("drug.uuid", "instructions", 1, "doseUnits", "frequency", "route", 1420088400000, 1420261200000, 3, "Day(s)");
        var treatment2 = sampleTreatment("drug.uuid1", "instructions", 1, "doseUnits", "frequency", "route", 1420347600000, 1420520400000, 3, "Day(s)");

        var continuousTreatments = Bahmni.Clinical.DrugOrder.Util.mergeContinuousTreatments([treatment1, treatment2]);
        expect(continuousTreatments.length).toBe(2);
    });

    it("should not merge continuous drug's if instruction's are different", function () {
        var treatment1 = sampleTreatment("drug.uuid", "instructions", 1, "doseUnits", "frequency", "route", 1420088400000, 1420261200000, 3, "Day(s)");
        var treatment2 = sampleTreatment("drug.uuid", "instructions1", 1, "doseUnits", "frequency", "route", 1420347600000, 1420520400000, 3, "Day(s)");

        var continuousTreatments = Bahmni.Clinical.DrugOrder.Util.mergeContinuousTreatments([treatment1, treatment2]);
        expect(continuousTreatments.length).toBe(2);
    });

    it("should not merge continuous drug's if dose are different", function () {
        var treatment1 = sampleTreatment("drug.uuid", "instructions", 1, "doseUnits", "frequency", "route", 1420088400000, 1420261200000, 3, "Day(s)");
        var treatment2 = sampleTreatment("drug.uuid", "instructions", 2, "doseUnits", "frequency", "route", 1420347600000, 1420520400000, 3, "Day(s)");

        var continuousTreatments = Bahmni.Clinical.DrugOrder.Util.mergeContinuousTreatments([treatment1, treatment2]);
        expect(continuousTreatments.length).toBe(2);
    });

    it("should not merge continuous drug's if dose units are different", function () {
        var treatment1 = sampleTreatment("drug.uuid", "instructions", 1, "doseUnits", "frequency", "route", 1420088400000, 1420261200000, 3, "Day(s)");
        var treatment2 = sampleTreatment("drug.uuid", "instructions", 1, "doseUnits1", "frequency", "route", 1420347600000, 1420520400000, 3, "Day(s)");

        var continuousTreatments = Bahmni.Clinical.DrugOrder.Util.mergeContinuousTreatments([treatment1, treatment2]);
        expect(continuousTreatments.length).toBe(2);
    });

    it("should not merge continuous drug's if frequency are different", function () {
        var treatment1 = sampleTreatment("drug.uuid", "instructions", 1, "doseUnits", "frequency", "route", 1420088400000, 1420261200000, 3, "Day(s)");
        var treatment2 = sampleTreatment("drug.uuid", "instructions", 1, "doseUnits", "frequency1", "route", 1420347600000, 1420520400000, 3, "Day(s)");

        var continuousTreatments = Bahmni.Clinical.DrugOrder.Util.mergeContinuousTreatments([treatment1, treatment2]);
        expect(continuousTreatments.length).toBe(2);
    });

    it("should not merge continuous drug's if route's are different", function () {
        var treatment1 = sampleTreatment("drug.uuid", "instructions", 1, "doseUnits", "frequency", "route", 1420088400000, 1420261200000, 3, "Day(s)");
        var treatment2 = sampleTreatment("drug.uuid", "instructions", 1, "doseUnits", "frequency", "route1", 1420347600000, 1420520400000, 3, "Day(s)");

        var continuousTreatments = Bahmni.Clinical.DrugOrder.Util.mergeContinuousTreatments([treatment1, treatment2]);
        expect(continuousTreatments.length).toBe(2);
    });
    it("should not merge continuous drug's if SOS's are different", function () {
            var treatment1 = sampleTreatment("drug.uuid", "instructions", 1, "doseUnits", "frequency", "route", 1420088400000, 1420261200000, 3, "Day(s)","addn1",true);
            var treatment2 = sampleTreatment("drug.uuid", "instructions", 1, "doseUnits", "frequency", "route", 1420347600000, 1420520400000, 3, "Day(s)","addn1",false);

            var continuousTreatments = Bahmni.Clinical.DrugOrder.Util.mergeContinuousTreatments([treatment1, treatment2]);
            expect(continuousTreatments.length).toBe(2);
    });
     it("should not merge continuous drug's if addn Instrction's are different", function () {
                var treatment1 = sampleTreatment("drug.uuid", "instructions", 1, "doseUnits", "frequency", "route", 1420088400000, 1420261200000, 3, "Day(s)","addn1",true);
                var treatment2 = sampleTreatment("drug.uuid", "instructions", 1, "doseUnits", "frequency", "route", 1420347600000, 1420520400000, 3, "Day(s)","addn2",true);

                var continuousTreatments = Bahmni.Clinical.DrugOrder.Util.mergeContinuousTreatments([treatment1, treatment2]);
                expect(continuousTreatments.length).toBe(2);
        });
});