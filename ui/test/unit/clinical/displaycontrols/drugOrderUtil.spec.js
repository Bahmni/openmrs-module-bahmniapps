'use strict';

describe("DrugOrderUtil", function () {
    var sampleTreatment = function (uuid, instructions, dose, doseUnits, frequency, route, scheduledDate, effectiveStopDate, duration, durationUnits, additionalInstructions, asNeeded) {
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
    describe("mergeContinuousTreatments", function () {
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

    describe("sortByDateAndTimeAndOrderNumber", function () {
        it("should sort by date in descending order if dates are different", function () {
            var treatment1 = sampleTreatment("drug.uuid1", "instructions", 1, "doseUnits", "frequency", "route", 1420088400000, 1420261200000, 3, "Day(s)", "addn1", true);
            treatment1.effectiveStartDate = new Date(1433788200000);
            var treatment2 = sampleTreatment("drug.uuid2", "instructions", 1, "doseUnits", "frequency", "route", 1420347600000, 1420520400000, 3, "Day(s)", "addn2", true);
            treatment2.effectiveStartDate = new Date(1433874600000);

            var continuousTreatments = Bahmni.Clinical.DrugOrder.Util.sortByDateAndTimeAndOrderNumber([treatment1, treatment2]);
            expect(continuousTreatments.length).toBe(2);
            expect(continuousTreatments[0].drug.uuid).toBe("drug.uuid2");
            expect(continuousTreatments[1].drug.uuid).toBe("drug.uuid1");
        });

        it("should sort by date in ascending order if dates are same with different time", function () {
            var treatment1 = sampleTreatment("drug.uuid1", "instructions", 1, "doseUnits", "frequency", "route", 1420088400000, 1420261200000, 3, "Day(s)", "addn1", true);
            treatment1.effectiveStartDate = new Date(1433824820000);
            var treatment2 = sampleTreatment("drug.uuid2", "instructions", 1, "doseUnits", "frequency", "route", 1420347600000, 1420520400000, 3, "Day(s)", "addn2", true);
            treatment2.effectiveStartDate = new Date(1433749220000);

            var continuousTreatments = Bahmni.Clinical.DrugOrder.Util.sortByDateAndTimeAndOrderNumber([treatment1, treatment2]);
            expect(continuousTreatments.length).toBe(2);
            expect(continuousTreatments[0].drug.uuid).toBe("drug.uuid1");
            expect(continuousTreatments[1].drug.uuid).toBe("drug.uuid2");
        });

        it("should sort by order Number in ascending order if date and time are same", function () {
            var treatment3 = sampleTreatment("drug.uuid3", "instructions", 1, "doseUnits", "frequency", "route", 1420347600000, 1420520400000, 3, "Day(s)", "addn2", true);
            treatment3.effectiveStartDate = new Date(1433749220000);
            treatment3.orderNumber = 3;
            var treatment2 = sampleTreatment("drug.uuid2", "instructions", 1, "doseUnits", "frequency", "route", 1420347600000, 1420520400000, 3, "Day(s)", "addn2", true);
            treatment2.effectiveStartDate = new Date(1433749220000);
            treatment2.orderNumber = 2;
            var treatment1 = sampleTreatment("drug.uuid1", "instructions", 1, "doseUnits", "frequency", "route", 1420088400000, 1420261200000, 3, "Day(s)", "addn1", true);
            treatment1.effectiveStartDate = new Date(1433749220000);
            treatment1.orderNumber = 1;


            var continuousTreatments = Bahmni.Clinical.DrugOrder.Util.sortByDateAndTimeAndOrderNumber([treatment1, treatment2, treatment3]);
            expect(continuousTreatments.length).toBe(3);
            expect(continuousTreatments[0].drug.uuid).toBe("drug.uuid1");
            expect(continuousTreatments[1].drug.uuid).toBe("drug.uuid2");
            expect(continuousTreatments[2].drug.uuid).toBe("drug.uuid3");
        });

        it("should 1) sort by date in descending order AND " +
                  "2) sort by ascending order with same date and different time AND " +
                  "3) sort by order number in ascending order if date and time are same", function () {
            var treatment1 = sampleTreatment("drug.uuid1", "instructions", 1, "doseUnits", "frequency", "route", 1420347600000, 1420520400000, 3, "Day(s)", "addn2", true);
            treatment1.effectiveStartDate = new Date(1439264420000);
            var treatment2 = sampleTreatment("drug.uuid2", "instructions", 1, "doseUnits", "frequency", "route", 1420088400000, 1420261200000, 3, "Day(s)", "addn1", true);
            treatment2.effectiveStartDate = new Date(1433738420000);
            var treatment3 = sampleTreatment("drug.uuid3", "instructions", 1, "doseUnits", "frequency", "route", 1420347600000, 1420520400000, 3, "Day(s)", "addn2", true);
            treatment3.effectiveStartDate = new Date(1433749220000);
            treatment3.orderNumber = 3;
            var treatment4 = sampleTreatment("drug.uuid4", "instructions", 1, "doseUnits", "frequency", "route", 1420347600000, 1420520400000, 3, "Day(s)", "addn2", true);
            treatment4.effectiveStartDate = new Date(1433749220000);
            treatment4.orderNumber = 4;

            var continuousTreatments = Bahmni.Clinical.DrugOrder.Util.sortByDateAndTimeAndOrderNumber([treatment4, treatment2, treatment1, treatment3]);
            expect(continuousTreatments.length).toBe(4);
            expect(continuousTreatments[0].drug.uuid).toBe("drug.uuid1");
            expect(continuousTreatments[1].drug.uuid).toBe("drug.uuid2");
            expect(continuousTreatments[2].drug.uuid).toBe("drug.uuid3");
            expect(continuousTreatments[3].drug.uuid).toBe("drug.uuid4");
        });
    });
});
