'use strict';

describe("drugOrderViewModel", function () {
    var sampleTreatment = function (extensionParams, treatmentConfig) {
        return Bahmni.Tests.drugOrderViewModelMother.build(extensionParams, treatmentConfig, defaults);
    };

    var treatmentConfig = {
        frequencies: [
            {
                name: "Every Hour",
                frequencyPerDay: 24
            },
            {
                name: "Every Two Hour",
                frequencyPerDay: 12
            },
            {
                name: "Every Five Hour",
                frequencyPerDay: 5
            },
            {
                name: "Every Six Hour",
                frequencyPerDay: 4
            },
            {
                name: "Four times a Day",
                frequencyPerDay: 4
            },
            {
                name: "Twice a Day",
                frequencyPerDay: 2
            },
            {
                name: "Once a Day",
                frequencyPerDay: 1
            },
            {
                name: "Once a Week",
                frequencyPerDay: 1/7
            }
        ],
        routes: [
            {name: "Intramuscular"},
            {name: "Orally"}
        ],
        durationUnits: [
            {name: "Hour(s)", factor: 1 / 24},
            {name: "Day(s)", factor: 1},
            {name: "Week(s)", factor: 7},
            {name: "Month(s)", factor: 30}
        ]
    };

    it("should get the text to be displayed in the treatment list", function () {
        var treatment = sampleTreatment({}, []);
        treatment.durationUnit = "Days";
        treatment.route = "Orally";
        treatment.uniformDosingType.dose = "1";
        treatment.uniformDosingType.doseUnits = "Capsule";
        treatment.uniformDosingType.frequency = "Once a day";
        treatment.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
        expect(treatment.getDescription()).toBe("1 Capsule, Once a day, Before Meals, Orally - 10 Days");

        treatment.uniformDosingType.frequency = null;
        expect(treatment.getDescription()).toBe("1 Capsule, Before Meals, Orally - 10 Days");
    });

    it("should get the text to be displayed in the treatment list with dosage instructions", function () {
        var treatment = sampleTreatment({}, []);
        treatment.frequencyType = "variable";
        treatment.route = "Orally";
        treatment.durationUnit = "Days";
        treatment.variableDosingType = {
            morningDose: 1,
            afternoonDose: 1,
            eveningDose: 1
        };

        expect(treatment.getDescription()).toBe("1-1-1, Before Meals, Orally - 10 Days")
    });

    it("should get the text to be displayed in the treatment list without dosage instructions if the instruction is as directed", function () {
        var treatment = sampleTreatment({}, []);
        treatment.frequencyType = "variable";
        treatment.route = "Orally";
        treatment.durationUnit = "Days";
        treatment.instructions = 'As directed';
        treatment.variableDosingType = {
            morningDose: 1,
            afternoonDose: 1,
            eveningDose: 1
        };

        expect(treatment.getDescription()).toBe("1-1-1, Orally - 10 Days")
    });

    it("should get the default route from the config", function () {
        var treatment = sampleTreatment({defaultRoute: "Orally"}, treatmentConfig);
        expect(treatment.route).toEqual("Orally");
    });

    it("should get default durationUnit from config if available", function () {
        var treatment = sampleTreatment({defaultDurationUnit: "Month(s)"}, treatmentConfig);
        expect(treatment.durationUnit).toEqual("Month(s)");
    });

    it("should reset uniformDosingType and noFrequencyDosingType when changing frequency type to variable", function () {
        var sampleTreatment = new Bahmni.Clinical.DrugOrderViewModel({});
        sampleTreatment.uniformDosingType = {
            dose: 1,
            doseUnits: "Tablets",
            frequency: "Once a Day"
        };
        sampleTreatment.setFrequencyType(Bahmni.Clinical.Constants.dosingTypes.variable);
        expect(sampleTreatment.uniformDosingType).toEqual({});
        expect(sampleTreatment.noFrequencyDosingType).toEqual({});
        expect(sampleTreatment.variableDosingType).not.toBe({});
    });

    it("should reset variableDosingType and noFrequencyDosingType when changing frequency type to uniform", function () {
        var sampleTreatment = new Bahmni.Clinical.DrugOrderViewModel({});
        sampleTreatment.variableDosingType = {
            morningDose: 1,
            afternoonDose: 1,
            eveningDose: 1,
            doseUnits: "Once a Day"
        };
        sampleTreatment.setFrequencyType(Bahmni.Clinical.Constants.dosingTypes.uniform);
        expect(sampleTreatment.uniformDosingType).not.toBe({});
        expect(sampleTreatment.variableDosingType).toEqual({});
        expect(sampleTreatment.noFrequencyDosingType).toEqual({});
    });

    it("should reset variableDosingType and uniformDosingType when changing frequency type to noFrequency", function () {
        var sampleTreatment = new Bahmni.Clinical.DrugOrderViewModel({});
        sampleTreatment.noFrequencyDosingType = {
            dose: 1,
            doseUnits: "Once a Day"
        };
        sampleTreatment.setFrequencyType(Bahmni.Clinical.Constants.dosingTypes.noFrequency);
        expect(sampleTreatment.noFrequencyDosingType).not.toBe({});
        expect(sampleTreatment.variableDosingType).toEqual({});
        expect(sampleTreatment.uniformDosingType).toEqual({});
    });

    it("should change duration unit based on frequency factor", function () {
        var sampleTreatment = new Bahmni.Clinical.DrugOrderViewModel({}, treatmentConfig);

        sampleTreatment.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;

        sampleTreatment.uniformDosingType.frequency = "Every Hour";
        sampleTreatment.calculateDurationUnit();
        expect(sampleTreatment.durationUnit).toBe("Hour(s)");

        sampleTreatment.uniformDosingType.frequency = "Every Two Hour";
        sampleTreatment.calculateDurationUnit();
        expect(sampleTreatment.durationUnit).toBe("Hour(s)");

        sampleTreatment.uniformDosingType.frequency = "Every Five Hour";
        sampleTreatment.calculateDurationUnit();
        expect(sampleTreatment.durationUnit).toBe("Hour(s)");

        sampleTreatment.uniformDosingType.frequency = "Every Six Hour";
        sampleTreatment.calculateDurationUnit();
        expect(sampleTreatment.durationUnit).toBe("Day(s)");

        sampleTreatment.uniformDosingType.frequency = "Four times a Day";
        sampleTreatment.calculateDurationUnit();
        expect(sampleTreatment.durationUnit).toBe("Day(s)");

        sampleTreatment.uniformDosingType.frequency = "Once a Day";
        sampleTreatment.calculateDurationUnit();
        expect(sampleTreatment.durationUnit).toBe("Day(s)");

        sampleTreatment.uniformDosingType.frequency = "Once a Week";
        sampleTreatment.calculateDurationUnit();
        expect(sampleTreatment.durationUnit).toBe("Week(s)")
    });

    describe("calculateDurationInDays", function () {
        it("should convert duration to days", function () {
            var treatment = sampleTreatment({}, treatmentConfig);
            treatment.duration = 6;
            treatment.durationUnit = "Week(s)";
            treatment.calculateDurationInDays();
            expect(treatment.durationInDays).toBe(42);

            treatment.durationUnit = "Month(s)"
            treatment.calculateDurationInDays();
            expect(treatment.durationInDays).toBe(180);

            treatment.durationUnit = "Day(s)"
            treatment.calculateDurationInDays();
            expect(treatment.durationInDays).toBe(6);

            treatment.durationUnit = "Hour(s)";
            treatment.calculateDurationInDays();
            expect(treatment.durationInDays).toBe(0.25);
        });

        it("should default units to days", function () {
            var treatment = sampleTreatment({}, []);
            treatment.duration = 6;
            treatment.durationUnit = "Random";
            treatment.calculateDurationInDays();
            expect(treatment.durationInDays).toBe(6);
        });
    });

    describe("calculateQuantityAndUnit", function () {
        var sampleTreatmentWithUniformDosing = function (dose, doseUnits, frequency, duration, durationUnit, factor) {
            var treatment = sampleTreatment({}, treatmentConfig);
            treatment.quantity = null;
            treatment.quantityUnit = null;
            treatment.uniformDosingType.dose = dose;
            treatment.uniformDosingType.doseUnits = doseUnits;
            treatment.uniformDosingType.frequency = frequency;
            treatment.duration = duration;
            treatment.durationUnit = durationUnit;
            treatment.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
            return treatment;
        };

        var sampleTreatmentWithVariableDosing = function (morningDose, afternoonDose, eveningDose, doseUnits, duration, durationUnit, factor) {
            var treatment = sampleTreatment({}, treatmentConfig);
            treatment.quantity = null;
            treatment.quantityUnit = null;
            treatment.frequencyType = Bahmni.Clinical.Constants.dosingTypes.variable;
            treatment.variableDosingType = {
                morningDose: morningDose,
                afternoonDose: afternoonDose,
                eveningDose: eveningDose,
                doseUnits: doseUnits
            };
            treatment.duration = duration;
            treatment.durationUnit = durationUnit;
            return treatment;
        };

        it("should calculate for uniform dose, frequency and duration", function () {
            var treatment = sampleTreatmentWithUniformDosing(3, "Capsule", "Twice a Day", 5, "Day(s)");
            treatment.calculateQuantityAndUnit();
            expect(treatment.quantity).toBe(30);
        });

        it("should convert duration units to days for calulation", function () {
            var treatment = sampleTreatmentWithUniformDosing(3, "Capsule", "Twice a Day", 5, "Week(s)", 7);
            treatment.calculateQuantityAndUnit();
            expect(treatment.quantity).toBe(210);
        });

        it("should calculate for variable dose and duration", function () {
            var treatment = sampleTreatmentWithVariableDosing(1, 2, 1.5, "Capsule", 4, "Day(s)");
            treatment.calculateQuantityAndUnit();
            expect(treatment.quantity).toBe(18);
        });

        it("should result in 0 for uniform dose when dose is not available", function () {
            var treatment = sampleTreatmentWithUniformDosing(null, "Capsule", "Twice a Day", 5, "Day(s)");
            treatment.calculateQuantityAndUnit();
            expect(treatment.quantity).toBe(0);

            treatment = sampleTreatmentWithVariableDosing(0, 0, null, "Capsule", 4, "Day(s)");
            treatment.calculateQuantityAndUnit();
            expect(treatment.quantity).toBe(0);
        });

        it("should result in 0 for uniform dose when duration is not available", function () {
            var treatment = sampleTreatmentWithUniformDosing(3, "Capsule", "Twice a Day", null, "Day(s)");
            treatment.calculateQuantityAndUnit();
            expect(treatment.quantity).toBe(0);

            treatment = sampleTreatmentWithVariableDosing(1, 0, 1, "Capsule", null, "Day(s)");
            treatment.calculateQuantityAndUnit();
            expect(treatment.quantity).toBe(0);
        });

        it("should result in 0 for uniform dose when frequency is not available", function () {
            var treatment = sampleTreatmentWithUniformDosing(3, "Capsule", null, 5, "Days");
            treatment.calculateQuantityAndUnit();
            expect(treatment.quantity).toBe(0);
        });

        it("should not calculate quantity and quantityUnit if entered manually", function () {
            var treatment = sampleTreatmentWithUniformDosing(3, "Capsule", {name: "Twice a Day", frequencyPerDay: 2}, 5, "Days");
            treatment.quantity = 100;
            treatment.quantityUnit = "not Capsule";
            treatment.setQuantityEnteredManually();
            treatment.calculateQuantityAndUnit();
            expect(treatment.quantity).toBe(100);
            expect(treatment.quantityUnit).toBe("not Capsule");
        });

        it("should be active if the effective stop date is in future", function () {
            var treatment = sampleTreatmentWithUniformDosing(3, "Capsule", {name: "Twice a Day", frequencyPerDay: 2}, 5, "Days");
            treatment.effectiveStopDate = getFutureDate();
            expect(treatment.isActive()).toBe(true);
        });

        it("should be active if the effective stop date is null", function () {
            var treatment = sampleTreatmentWithUniformDosing(3, "Capsule", {name: "Twice a Day", frequencyPerDay: 2}, 5, "Days");
            treatment.effectiveStopDate = undefined;
            expect(treatment.isActive()).toBe(true);
        });

        it("should be active if the effective stop date is today", function () {
            var treatment = sampleTreatmentWithUniformDosing(3, "Capsule", {name: "Twice a Day", frequencyPerDay: 2}, 5, "Days");
            treatment.effectiveStopDate = new Date();
            expect(treatment.isActive()).toBe(true);
        });

        it("should be inActive if the date_stopped is set", function () {
            var treatment = sampleTreatmentWithUniformDosing(3, "Capsule", {name: "Twice a Day", frequencyPerDay: 2}, 5, "Days");
            treatment.dateStopped = new Date();

            expect(treatment.isActive()).toBe(false);
        })
    });

    describe("Discontinued", function () {
        it("should return true if the action is discontinue", function () {
            var treatment = sampleTreatment({}, []);
            treatment.action = 'DISCONTINUE';

            expect(treatment.discontinued()).toBe(true);
        });

        it("should return false if the action is new", function () {
            var treatment = sampleTreatment({}, []);
            treatment.action = 'NEW';

            expect(treatment.discontinued()).toBe(false);
        });

        it("should return false if the action is Revise", function () {
            var treatment = sampleTreatment({}, []);
            treatment.action = 'REVISE';

            expect(treatment.discontinued()).toBe(false);
        });
    });

    describe("isDiscontinuedOrStopped", function () {
        it("should return true if the action is discontinue", function () {
            var treatment = sampleTreatment({}, []);
            treatment.action = 'DISCONTINUE';
            treatment.dateStopped = null;

            expect(treatment.isDiscontinuedOrStopped()).toBe(true);
        });

        it("should return true if order has been stopped", function () {
            var treatment = sampleTreatment({}, []);
            treatment.action = 'NEW';
            treatment.dateStopped = new Date();

            expect(treatment.isDiscontinuedOrStopped()).toBe(true);
        });

        it("should return false if action is not discontinue and order is not stopped", function () {
            var treatment = sampleTreatment({}, []);
            treatment.action = 'REVISE';
            treatment.dateStopped = null;

            expect(treatment.isDiscontinuedOrStopped()).toBe(false);
        });
    });

    function getFutureDate() {
        var today = new Date();
        today.setDate(today.getDate() + 7);
        return today;
    }

    describe("createFromContract", function () {
        var drugOrder = {
            "uuid": null,
            "action": "NEW",
            "careSetting": "Outpatient",
            "orderType": "Drug Order",
            "autoExpireDate": null,
            "scheduledDate": null,
            "dateStopped": null,
            "instructions": null,
            "visit": {
                "startDateTime": 1397028261000,
                "uuid": "002efa33-4c4f-469f-968a-faedfe3a5e0c"
            },
            "drug": {
                "form": "Injection",
                "uuid": "8d7e3dc0-f4ad-400c-9468-5a9e2b1f4230",
                "strength": null,
                "name": "Methylprednisolone 2ml"
            },
            "dosingInstructions": {
                "quantity": 100,
                "route": "Intramuscular",
                "frequency": "Twice a day",
                "doseUnits": "Tablespoon",
                "asNeeded": false,
                "quantityUnits": "Tablet",
                "dose": 5,
                "administrationInstructions": "{\"instructions\":\"In the evening\",\"additionalInstructions\":\"helylo\"}",
                "numberOfRefills": null
            },
            "durationUnits": "Days",
            "dateActivated": 1410322624000,
            "commentToFulfiller": null,
            "effectiveStartDate": 1410322624000,
            "effectiveStopDate": null,
            "orderReasonConcept": null,
            "dosingInstructionType": "org.openmrs.module.bahmniemrapi.drugorder.dosinginstructions.FlexibleDosingInstructions",
            "previousOrderUuid": null,
            "orderReasonText": null,
            "duration": 10,
            "provider": {name: "superman"}
        };

        it("should map fields correctly from Drug Order", function () {
            var drugOrderViewModel = Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder);
            expect(drugOrderViewModel.asNeeded).toBe(drugOrder.dosingInstructions.asNeeded);
            expect(drugOrderViewModel.route).toBe(drugOrder.dosingInstructions.route);
            expect(drugOrderViewModel.duration).toBe(drugOrder.duration);
            expect(drugOrderViewModel.durationUnit).toBe(drugOrder.durationUnits);
            expect(drugOrderViewModel.scheduledDate).toBe(drugOrder.effectiveStartDate);
            expect(drugOrderViewModel.frequencyType).toBe("uniform");
            expect(drugOrderViewModel.uniformDosingType.dose).toBe(drugOrder.dosingInstructions.dose);
            expect(drugOrderViewModel.uniformDosingType.doseUnits).toBe(drugOrder.dosingInstructions.doseUnits);
            expect(drugOrderViewModel.uniformDosingType.frequency).toBe(drugOrder.dosingInstructions.frequency);
            expect(drugOrderViewModel.quantity).toBe(drugOrder.dosingInstructions.quantity);
            expect(drugOrderViewModel.quantityUnit).toBe(drugOrder.dosingInstructions.quantityUnits);
            expect(drugOrderViewModel.drug).toBe(drugOrder.drug);
            expect(drugOrderViewModel.effectiveStartDate).toBe(drugOrder.effectiveStartDate);
            expect(drugOrderViewModel.effectiveStopDate).toBe(drugOrder.effectiveStopDate);
            expect(drugOrderViewModel.provider).toBe(drugOrder.provider);
            expect(drugOrderViewModel.dateActivated).toBe(drugOrder.dateActivated);
        });

    });

    describe("revise", function () {

        it("should create a new object that can be used for revision", function () {
            var treatment = sampleTreatment({}, []);
            var route = treatment.route = 'Oral';
            expect(treatment.route).toBe(route);
            var now = Bahmni.Common.Util.DateUtil.now();
            treatment.scheduledDate = Bahmni.Common.Util.DateUtil.subtractDays(now, 2);
            treatment.drug = { form: undefined };

            var revisedTreatment = treatment.revise();

            var newRoute = 'Transdermal';
            revisedTreatment.route = newRoute;
            expect(treatment.route).toBe(route);
            expect(treatment.getDescription()).not.toBe(revisedTreatment.getDescription());
        });

        it("should not change scheduled date", function () {
            var treatment = sampleTreatment({}, []);
            var now = Bahmni.Common.Util.DateUtil.now();
            treatment.effectiveStartDate = Bahmni.Common.Util.DateUtil.addDays(now, 2);
            treatment.drug = { form: undefined };
            var revisedTreatment = treatment.revise();
            expect(Bahmni.Common.Util.DateUtil.isSameDate(revisedTreatment.scheduledDate, treatment.scheduledDate)).toBe(true);
        });

        it("should map uuid to previousOrderUuid", function () {
            var treatment = sampleTreatment({}, []);
            treatment.drug = {  form: undefined };
            treatment.uuid = "previous-order-uuid";

            var revisedTreatment = treatment.revise();
            expect(revisedTreatment.previousOrderUuid).toBe(treatment.uuid);
            expect(treatment.previousOrderUuid).not.toBe(treatment.uuid);
        });

        it("should set action as REVISE", function () {
            var treatment = sampleTreatment({}, []);
            treatment.drug = { form: undefined };

            var revisedTreatment = treatment.revise();
            expect(revisedTreatment.action).toBe(Bahmni.Clinical.Constants.orderActions.revise);
            expect(treatment.action).not.toBe(Bahmni.Clinical.Constants.orderActions.revise);
        });

    });

    describe("refill", function () {
        it("should refill an inactive drug order", function () {
            var treatment = sampleTreatment({}, []);
            var today = Bahmni.Common.Util.DateUtil.today();

            treatment.previousOrderUuid = "prev-uuid";
            treatment.effectiveStopDate = Bahmni.Common.Util.DateUtil.subtractDays(today, 30);
            var refilledTreatment = treatment.refill();
            expect(refilledTreatment.uuid).toBe(undefined);
            expect(refilledTreatment.dateActivated).toBe(undefined);
            expect(refilledTreatment.previousOrderUuid).toBe(undefined);
            expect(refilledTreatment.effectiveStartDate).toEqual(today);
            expect(refilledTreatment.drugNameDisplay).toBe("calpol 500mg (Tablet)");
        });


        it("should refill an active drug order", function () {
            var treatment = sampleTreatment({}, []);
            var today = Bahmni.Common.Util.DateUtil.today();
            treatment.previousOrderUuid = "prev-uuid";
            treatment.effectiveStopDate = Bahmni.Common.Util.DateUtil.addDays(today, 5);
            var refilledTreatment = treatment.refill();
            expect(refilledTreatment.uuid).toBe(undefined);
            expect(refilledTreatment.dateActivated).toBe(undefined);
            expect(refilledTreatment.previousOrderUuid).toBe(undefined);
            var startDateForRefilledTreatment = Bahmni.Common.Util.DateUtil.addSeconds(treatment.effectiveStopDate, 1);
            expect(refilledTreatment.effectiveStartDate).toEqual(startDateForRefilledTreatment);
            expect(refilledTreatment.drugNameDisplay).toBe("calpol 500mg (Tablet)");
        });

        it("should refill an active drug order ending today", function () {
            var treatment = sampleTreatment({}, []);
            var today = Bahmni.Common.Util.DateUtil.today();
            treatment.previousOrderUuid = "prev-uuid";
            treatment.effectiveStopDate = today;
            var refilledTreatment = treatment.refill();
            expect(refilledTreatment.uuid).toBe(undefined);
            expect(refilledTreatment.dateActivated).toBe(undefined);
            expect(refilledTreatment.previousOrderUuid).toBe(undefined);
            var startDateForRefilledTreatment = Bahmni.Common.Util.DateUtil.addSeconds(treatment.effectiveStopDate, 1);
            expect(refilledTreatment.effectiveStartDate).toEqual(startDateForRefilledTreatment);
            expect(refilledTreatment.drugNameDisplay).toBe("calpol 500mg (Tablet)");
        });

        it("should set quantity units as Unit(s) for reverse synced drug orders", function () {
            var treatment = sampleTreatment({}, []);
            var today = Bahmni.Common.Util.DateUtil.today();
            treatment.previousOrderUuid = "prev-uuid";
            treatment.effectiveStopDate = today;
            treatment.quantityUnit = null;
            var refilledTreatment = treatment.refill();
            expect(refilledTreatment.quantityUnit).toBe("Unit(s)");
        });

    });

    describe("edit", function () {

        it("should not change scheduled date", function () {
            var treatment = sampleTreatment({}, []);
            var now = Bahmni.Common.Util.DateUtil.now();
            treatment.effectiveStartDate = Bahmni.Common.Util.DateUtil.addDays(now, 2);

            var editedTreatment = treatment.cloneForEdit(0);
            expect(Bahmni.Common.Util.DateUtil.isSameDate(editedTreatment.scheduledDate, treatment.scheduledDate)).toBe(true);
        });

        it("should create a copy of the drug to be edited", function () {
            var treatment = sampleTreatment({}, []);
            treatment.route = {name: "Orally"};
            treatment.frequency = {name: "Once a day"}
            var treatmentConfig = {};
            treatmentConfig.routes = [{name: "Orally"}, {name: "intramuscular"}, {name: "intradermal"}];
            treatmentConfig.frequencies = [{name: "Once a day"}, {name: "Twice a day"}];

            var editedTreatment = treatment.cloneForEdit(0);
            expect(editedTreatment.drug.name).toBe(treatment.drug.name);
            expect(editedTreatment.instructions).toBe(treatment.instructions);
            expect(editedTreatment.duration).toBe(treatment.duration);
            expect(editedTreatment.quantity).toBe(treatment.quantity);
            expect(editedTreatment.quantityUnit).toBe(treatment.quantityUnit);
            expect(editedTreatment.route).toEqual(treatment.route);
            expect(editedTreatment.frequency).toEqual(treatment.frequency);
        });

        it("should set the flag isBeingEdited", function () {
            var treatment = sampleTreatment({}, []);
            var editedTreatment = treatment.cloneForEdit(0);
            expect(editedTreatment.isBeingEdited).toBe(true);
        });

    });

    describe("set effectiveStartDate", function () {
        var isoDateFormat = "YYYY-MM-DD";

        it("should set scheduledDate if date is in future", function () {
            var treatment = sampleTreatment({}, []);
            var now = Bahmni.Common.Util.DateUtil.now();

            treatment.effectiveStartDate = moment(Bahmni.Common.Util.DateUtil.addDays(now, 2)).format(isoDateFormat);

            expect(treatment.scheduledDate).toBe(treatment.effectiveStartDate);
        });

        it("should clear scheduledDate if date is today", function () {
            var treatment = sampleTreatment({}, []);

            treatment.effectiveStartDate = moment(Bahmni.Common.Util.DateUtil.now()).format(isoDateFormat);

            expect(treatment.scheduledDate).toBe(null);
        });

        it("should clear scheduledDate if date is in the past", function () {
            var treatment = sampleTreatment({}, []);
            var now = Bahmni.Common.Util.DateUtil.now();

            treatment.effectiveStartDate = moment(Bahmni.Common.Util.DateUtil.subtractDays(now, 2)).format(isoDateFormat);

            expect(treatment.scheduledDate).toBe(null);
        });

        it("should set effective start date to effective stop date + 1 second for refill orders", function(){
            var treatment = sampleTreatment({}, []);
            treatment.effectiveStopDate = Bahmni.Common.Util.DateUtil.now();
            treatment.uiStartDate =  Bahmni.Common.Util.DateUtil.now();
            var expectedEffectiveStartDate = Bahmni.Common.Util.DateUtil.addSeconds(treatment.effectiveStopDate, 1);

            expect(treatment.effectiveStartDate).toEqual(expectedEffectiveStartDate);
        });

    });

    describe("Validate", function () {
        describe("for uniform dosing type", function () {
            var treatment = sampleTreatment({}, {});

            it("should fail validation if dose type is empty", function () {
                var treatment = sampleTreatment({}, {});
                treatment.frequencyType = null;
                expect(treatment.validate()).toBeFalsy();
            });

            it("should fail validation if all dose info is empty", function () {
                treatment.uniformDosingType = {
                    dose: undefined,
                    doseUnits: undefined,
                    frequency: undefined
                };
                expect(treatment.validate()).toBeFalsy();
            });

            it("should pass validation if dose and doseUnits are empty but frequency is not.", function () {
                treatment.uniformDosingType = {
                    dose: undefined,
                    doseUnits: undefined,
                    frequency: "Once a day."
                };

                expect(treatment.validate()).toBeTruthy();
            });

            it("should fail validation if dose and frequency is given but dose units is not", function () {
                treatment.uniformDosingType = {
                    dose: 1,
                    doseUnits: undefined,
                    frequency: "Once a day."
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should fail validation if dose is given but dose units and frequency is not", function () {
                treatment.uniformDosingType = {
                    dose: 1,
                    doseUnits: undefined,
                    frequency: undefined
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should fail validation if dose units are given but dose and frequency is not", function () {
                treatment.uniformDosingType = {
                    dose: undefined,
                    doseUnits: "Some",
                    frequency: undefined
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should fail validation if dose units and frequency are given but dose is not", function () {
                treatment.uniformDosingType = {
                    dose: undefined,
                    doseUnits: "Some",
                    frequency: "Once a day"
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should fail validation dose and dose units are given and frequency is not", function () {
                var treatment = sampleTreatment({}, {});
                treatment.uniformDosingType = {
                    dose: 1,
                    doseUnits: "Some",
                    frequency: undefined
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should pass validation if all are given", function () {
                treatment.uniformDosingType = {
                    dose: 1,
                    doseUnits: "Some",
                    frequency: "Once a day"
                };

                expect(treatment.validate()).toBeTruthy();
            });

            it("should fail validation if all are given but dose is 0", function () {
                treatment.uniformDosingType = {
                    dose: 0,
                    doseUnits: "Some",
                    frequency: "Once a day"
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should fail validation if dose is 0 and dose units is not given", function () {
                treatment.uniformDosingType = {
                    dose: 0,
                    doseUnits: undefined,
                    frequency: "Once a day"
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should fail validation if dose is 0 and dose units is given but frequency is not", function () {
                treatment.uniformDosingType = {
                    dose: 0,
                    doseUnits: "Some",
                    frequency: undefined
                };

                expect(treatment.validate()).toBeFalsy();
            });
        });

        describe("for variable dosing type", function () {
            var treatment = sampleTreatment({}, {});
            treatment.frequencyType = Bahmni.Clinical.Constants.dosingTypes.variable;
            it("should fail validation if all the fields are empty", function () {
                treatment.variableDosingType = {
                    morningDose: undefined,
                    afternoonDose: undefined,
                    eveningDose: undefined,
                    doseUnits: undefined
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should fail validation if morning dose is set and all other fields are empty", function () {
                treatment.variableDosingType = {
                    morningDose: 1,
                    afternoonDose: undefined,
                    eveningDose: undefined,
                    doseUnits: undefined
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should fail validation if afternoon dose is set and all other fields are empty", function () {
                treatment.variableDosingType = {
                    morningDose: undefined,
                    afternoonDose: 1,
                    eveningDose: undefined,
                    doseUnits: undefined
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should fail validation if evening dose is set and all other fields are empty", function () {
                treatment.variableDosingType = {
                    morningDose: undefined,
                    afternoonDose: undefined,
                    eveningDose: 1,
                    doseUnits: undefined
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should fail validation if dose units is set and all other fields are empty", function () {
                treatment.variableDosingType = {
                    morningDose: undefined,
                    afternoonDose: undefined,
                    eveningDose: undefined,
                    doseUnits: "Tablet(s)"
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should pass validation if all the fields are set", function () {
                treatment.variableDosingType = {
                    morningDose: 1,
                    afternoonDose: 0,
                    eveningDose: 1,
                    doseUnits: "Tablet(s)"
                };

                expect(treatment.validate()).toBeTruthy();
            });
        });
        describe("isFrequencyType", function(){
            var treatment = sampleTreatment({}, {});
            it("should return true if the frequency type is same.", function(){
                expect(treatment.isFrequencyType(Bahmni.Clinical.Constants.dosingTypes.uniform)).toBeTruthy();
            });

            it("should return false if the frequency type is not same.", function(){
                expect(treatment.isFrequencyType(Bahmni.Clinical.Constants.dosingTypes.variable)).toBeFalsy();
            });
        });
        describe("getDisplayName", function(){
            it("should return drug + form", function(){
                var treatment = sampleTreatment({}, {});
                expect(treatment.getDisplayName()).toBe("calpol 500mg (Tablet)");
            })
        });
    });
});