'use strict';

describe("drugOrderViewModel", function () {
    var DateUtil = Bahmni.Common.Util.DateUtil;
    var sampleTreatment = function (extensionParams, treatmentConfig, defaults) {
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
                name: "Five times a Day",
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
            },
            {
                name: "Twice a Week",
                frequencyPerDay: 2/7
            },
            {
                name: "Once a Month",
                frequencyPerDay: 1/30
            },
        ],
        routes: [
            {name: "Intramuscular"},
            {name: "Orally"},
            {name: "Oral"}
        ],
        durationUnits: [
            {name: "Hour(s)", factor: 1 / 24},
            {name: "Day(s)", factor: 1},
            {name: "Week(s)", factor: 7},
            {name: "Month(s)", factor: 30}
        ],
        doseUnits: [
            {name:"Tablet(s)"},
            {name:"Teaspoon"}
        ]
    };

    it("should get the text to be displayed in the treatment list", function () {
        var treatment = sampleTreatment({}, []);
        treatment.durationUnit = "Days";
        treatment.route = "Orally";
        treatment.uniformDosingType.dose = "1";
        treatment.doseUnits = "Capsule";
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

    it("should get default durationUnit from config if available", function () {
        var treatment = sampleTreatment({defaultDurationUnit: "Month(s)"}, treatmentConfig);
        expect(treatment.durationUnit).toEqual("Month(s)");
    });

    it("should reset uniformDosingType when changing frequency type to variable", function () {
        var sampleTreatment = new Bahmni.Clinical.DrugOrderViewModel({});
        sampleTreatment.uniformDosingType = {
            dose: 1,
            frequency: "Once a Day"
        };
        sampleTreatment.setFrequencyType(Bahmni.Clinical.Constants.dosingTypes.variable);
        expect(sampleTreatment.uniformDosingType).toEqual({});
        expect(sampleTreatment.variableDosingType).not.toBe({});
    });

    it("should reset variableDosingType when changing frequency type to uniform", function () {
        var sampleTreatment = new Bahmni.Clinical.DrugOrderViewModel({});
        sampleTreatment.variableDosingType = {
            morningDose: 1,
            afternoonDose: 1,
            eveningDose: 1
        };
        sampleTreatment.setFrequencyType(Bahmni.Clinical.Constants.dosingTypes.uniform);
        expect(sampleTreatment.uniformDosingType).not.toBe({});
        expect(sampleTreatment.variableDosingType).toEqual({});
    });

    it("should change duration unit based on frequency factor for uniform frequency type", function () {
        var appConfig = {"frequencyDefaultDurationUnitsMap": [
            {"minFrequency":5, "maxFrequency": null, "defaultDurationUnit": "Hour(s)"},
            {"minFrequency":"1/7", "maxFrequency": 5, "defaultDurationUnit": "Day(s)"},
            {"minFrequency":"1/30", "maxFrequency": "1/7", "defaultDurationUnit": "Week(s)"},
            {"minFrequency":null, "maxFrequency": "1/30", "defaultDurationUnit": "Month(s)"}
        ]};

        var sampleTreatment = new Bahmni.Clinical.DrugOrderViewModel(appConfig, treatmentConfig);

        sampleTreatment.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;

        sampleTreatment.uniformDosingType.frequency = "Every Hour";
        sampleTreatment.calculateDurationUnit();
        expect(sampleTreatment.durationUnit).toBe("Hour(s)");

        sampleTreatment.uniformDosingType.frequency = "Every Two Hour";
        sampleTreatment.calculateDurationUnit();
        expect(sampleTreatment.durationUnit).toBe("Hour(s)");

        sampleTreatment.uniformDosingType.frequency = "Five times a Day";
        sampleTreatment.calculateDurationUnit();
        expect(sampleTreatment.durationUnit).toBe("Day(s)");

        sampleTreatment.uniformDosingType.frequency = "Every Six Hour";
        sampleTreatment.calculateDurationUnit();
        expect(sampleTreatment.durationUnit).toBe("Day(s)");

        sampleTreatment.uniformDosingType.frequency = "Four times a Day";
        sampleTreatment.calculateDurationUnit();
        expect(sampleTreatment.durationUnit).toBe("Day(s)");

        sampleTreatment.uniformDosingType.frequency = "Once a Day";
        sampleTreatment.calculateDurationUnit();
        expect(sampleTreatment.durationUnit).toBe("Day(s)");

        sampleTreatment.uniformDosingType.frequency = "Twice a Week";
        sampleTreatment.calculateDurationUnit();
        expect(sampleTreatment.durationUnit).toBe("Day(s)");

        sampleTreatment.uniformDosingType.frequency = "Once a Week";
        sampleTreatment.calculateDurationUnit();
        expect(sampleTreatment.durationUnit).toBe("Week(s)");

        sampleTreatment.uniformDosingType.frequency = "Once a Month";
        sampleTreatment.calculateDurationUnit();
        expect(sampleTreatment.durationUnit).toBe("Month(s)");
    });

    it("should not change duration units for non-uniform frequency type", function() {
        var appConfig = {"frequencyDefaultDurationUnitsMap": [
            {"minFrequency":5, "maxFrequency": null, "defaultDurationUnit": "Hour(s)"},
            {"minFrequency":null, "maxFrequency": "1/30", "defaultDurationUnit": "Month(s)"}
        ]};
        var sampleTreatment = new Bahmni.Clinical.DrugOrderViewModel(appConfig, treatmentConfig);
        sampleTreatment.frequencyType = "some frequency type";
        sampleTreatment.durationUnit = "someUnit";
        sampleTreatment.calculateDurationUnit();
        expect(sampleTreatment.durationUnit).toBe("someUnit");
    });

    it("should not change duration units if frequencyDefaultDurationUnitsMap is not configured", function() {
        var sampleTreatment = new Bahmni.Clinical.DrugOrderViewModel({}, treatmentConfig);
        sampleTreatment.durationUnit = "someUnit";
        sampleTreatment.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;

        sampleTreatment.uniformDosingType.frequency = "Every Hour";
        sampleTreatment.calculateDurationUnit();
        expect(sampleTreatment.durationUnit).toBe("someUnit");
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
            treatment.doseUnits = doseUnits;
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
            treatment.doseUnits = doseUnits;
            treatment.frequencyType = Bahmni.Clinical.Constants.dosingTypes.variable;
            treatment.variableDosingType = {
                morningDose: morningDose,
                afternoonDose: afternoonDose,
                eveningDose: eveningDose,
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

        it("should not calculate quantity if entered manually", function () {
            var treatment = sampleTreatmentWithUniformDosing(3, "Capsule", {name: "Twice a Day", frequencyPerDay: 2}, 5, "Days");
            treatment.quantity = 100;
            treatment.setQuantityEnteredManually();
            treatment.calculateQuantityAndUnit();
            expect(treatment.quantity).toBe(100);
        });

        it("should not calculate quantity if entered via edit", function () {
            var treatment = sampleTreatmentWithUniformDosing(3, "Capsule", {name: "Twice a Day", frequencyPerDay: 2}, 5, "Days");
            treatment.quantity = 100;
            treatment.quantityEnteredViaEdit = true;
            treatment.calculateQuantityAndUnit();
            expect(treatment.quantity).toBe(100);
        });

        it("should calculate quantity units all the time", function () {
            var treatment = sampleTreatmentWithUniformDosing(3, "Capsule", {name: "Twice a Day", frequencyPerDay: 2}, 5, "Days");
            treatment.quantityUnit = "not Capsule";
            treatment.setQuantityEnteredManually();
            treatment.calculateQuantityAndUnit();
            expect(treatment.quantityUnit).toBe("Unit(s)");
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

        it("should not be active if the effective stop date is less than current datetime", function () {
            var treatment = sampleTreatmentWithUniformDosing(3, "Capsule", {name: "Twice a Day", frequencyPerDay: 2}, 5, "Days");
            treatment.effectiveStopDate = DateUtil.subtractSeconds(DateUtil.now(), 600);
            expect(treatment.isActive()).toBe(false);
        });

        it("should be active if the effective stop date is greater than current datetime", function () {
            var treatment = sampleTreatmentWithUniformDosing(3, "Capsule", {name: "Twice a Day", frequencyPerDay: 2}, 5, "Days");
            treatment.effectiveStopDate = DateUtil.addSeconds(DateUtil.now(), 600);
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

        var DrugOrderContractMother = function() {
            var drugOrderContract =  {
                "uuid": null,
                "action": "NEW",
                "careSetting": "Outpatient",
                "orderType": "Drug Order",
                "orderNumber": "ORD-1234",
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
            this.create = function() {
                return drugOrderContract;
            };

            this.forReverseSynced = function() {
                drugOrderContract.dosingInstructions = {
                    "administrationInstructions": "{\"dose\":\"1.0\",\"doseUnits\":\"Tablet(s)\"}",
                    "quantityUnits": "Tablet",
                    "quantity": 100
                };
                return this;
            }

        };

        it("should map fields correctly from Drug Order", function () {
            var drugOrder = new DrugOrderContractMother().create();
            var drugOrderViewModel = Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder);
            expect(drugOrderViewModel.asNeeded).toBe(drugOrder.dosingInstructions.asNeeded);
            expect(drugOrderViewModel.route).toBe(drugOrder.dosingInstructions.route);
            expect(drugOrderViewModel.duration).toBe(drugOrder.duration);
            expect(drugOrderViewModel.durationUnit).toBe(drugOrder.durationUnits);
            expect(drugOrderViewModel.scheduledDate).toBe(drugOrder.effectiveStartDate);
            expect(drugOrderViewModel.frequencyType).toBe("uniform");
            expect(drugOrderViewModel.doseUnits).toBe(drugOrder.dosingInstructions.doseUnits);
            expect(drugOrderViewModel.uniformDosingType.dose).toBe(drugOrder.dosingInstructions.dose);
            expect(drugOrderViewModel.uniformDosingType.frequency).toBe(drugOrder.dosingInstructions.frequency);
            expect(drugOrderViewModel.quantity).toBe(drugOrder.dosingInstructions.quantity);
            expect(drugOrderViewModel.quantityUnit).toBe(drugOrder.dosingInstructions.quantityUnits);
            expect(drugOrderViewModel.drug).toBe(drugOrder.drug);
            expect(drugOrderViewModel.effectiveStartDate).toBe(drugOrder.effectiveStartDate);
            expect(drugOrderViewModel.effectiveStopDate).toBe(drugOrder.effectiveStopDate);
            expect(drugOrderViewModel.provider).toBe(drugOrder.provider);
            expect(drugOrderViewModel.dateActivated).toBe(drugOrder.dateActivated);
            expect(drugOrderViewModel.reverseSynced).toBeFalsy();
        });

        it("should map fields for reverse synced drug orders", function() {
            var drugOrder = new DrugOrderContractMother().forReverseSynced().create();
            var drugOrderViewModel = Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder);

            expect(drugOrderViewModel.uniformDosingType.dose).toBe(1);
            expect(drugOrderViewModel.doseUnits).toBe("Tablet(s)");
            expect(drugOrderViewModel.reverseSynced).toBe(true);
        });


    });

    describe("revise", function () {
        it("should create a new object that can be used for revision", function () {
            var treatment = sampleTreatment({}, [], {doseUnits: 'Tablet(s)'});
            var route = treatment.route = 'Oral';
            expect(treatment.route).toBe(route);
            var now = DateUtil.now();
            treatment.scheduledDate = DateUtil.subtractDays(now, 2);
            treatment.drug = { form: undefined };

            var revisedTreatment = treatment.revise();

            var newRoute = 'Transdermal';
            revisedTreatment.route = newRoute;
            expect(revisedTreatment.doseUnits).toBe('Tablet(s)');
            expect(revisedTreatment.getDescription()).not.toBe(treatment.getDescription());
            expect(treatment.route).toBe(route);
        });

        it("should not change scheduled date", function () {
            var treatment = sampleTreatment({}, []);
            var now = DateUtil.now();
            treatment.effectiveStartDate = DateUtil.addDays(now, 2);
            treatment.drug = { form: undefined };
            var revisedTreatment = treatment.revise();
            expect(treatment.scheduledDate.getTime() === revisedTreatment.scheduledDate.getTime()).toBe(true);
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

        it("should clear dose, doseUnits and quantity for reverse synced drug orders", function(){
            var treatment = sampleTreatment({}, []);
            treatment.reverseSynced = true;
            treatment.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
            treatment.uniformDosingType = {
                dose: 1,
                doseUnits: "Tablet(s)",
                frequency: "Once a day"
            };
            expect(treatment.quantity).toBeDefined();
            expect(treatment.quantityUnit).toBeDefined();

            var revisedTreatment = treatment.revise();

            var dosingType = revisedTreatment.uniformDosingType;
            expect(dosingType.dose).toBe(undefined);
            expect(dosingType.doseUnits).toBe(undefined);
            expect(dosingType.frequency).toBe(undefined);
            expect(revisedTreatment.quantity).toBe(undefined);
            expect(revisedTreatment.quantityUnit).toBe("Unit(s)");
        });

    });

    describe("refill", function () {
        it("should refill an inactive drug order", function () {
            var treatment = sampleTreatment({}, []);
            var today = DateUtil.today();

            treatment.previousOrderUuid = "prev-uuid";
            treatment.effectiveStopDate = DateUtil.subtractDays(today, 30);
            var refilledTreatment = treatment.refill();
            expect(refilledTreatment.uuid).toBe(undefined);
            expect(refilledTreatment.dateActivated).toBe(undefined);
            expect(refilledTreatment.previousOrderUuid).toBe(undefined);
            expect(refilledTreatment.effectiveStartDate).toEqual(today);
        });


        it("should refill an active drug order", function () {
            var treatment = sampleTreatment({}, []);
            var today = DateUtil.today();
            treatment.previousOrderUuid = "prev-uuid";
            treatment.effectiveStopDate = DateUtil.addDays(today, 5);
            var refilledTreatment = treatment.refill();
            expect(refilledTreatment.uuid).toBe(undefined);
            expect(refilledTreatment.dateActivated).toBe(undefined);
            expect(refilledTreatment.previousOrderUuid).toBe(undefined);
            var startDateForRefilledTreatment = DateUtil.addSeconds(treatment.effectiveStopDate, 1);
            expect(refilledTreatment.effectiveStartDate).toEqual(startDateForRefilledTreatment);
        });

        it("should refill an active drug order ending today", function () {
            var treatment = sampleTreatment({}, []);
            var today = DateUtil.today();
            treatment.previousOrderUuid = "prev-uuid";
            treatment.effectiveStopDate = today;
            var refilledTreatment = treatment.refill();
            expect(refilledTreatment.uuid).toBe(undefined);
            expect(refilledTreatment.dateActivated).toBe(undefined);
            expect(refilledTreatment.previousOrderUuid).toBe(undefined);
            var startDateForRefilledTreatment = DateUtil.addSeconds(treatment.effectiveStopDate, 1);
            expect(refilledTreatment.effectiveStartDate).toEqual(startDateForRefilledTreatment);
        });

        it("should set quantity units as Unit(s) for reverse synced drug orders", function () {
            var treatment = sampleTreatment({}, []);
            var today = DateUtil.today();
            treatment.previousOrderUuid = "prev-uuid";
            treatment.effectiveStopDate = today;
            treatment.quantityUnit = null;
            var refilledTreatment = treatment.refill();
            expect(refilledTreatment.quantityUnit).toBe("Unit(s)");
        });

        it("should clear dose and quantity for reverse synced drug orders", function(){
            var treatment = sampleTreatment({}, []);
            treatment.reverseSynced = true;
            treatment.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
            treatment.uniformDosingType = {
                dose: 1,
                doseUnits: "Tablet(s)",
                frequency: "Once a day"
            };
            expect(treatment.quantity).toBeDefined();
            expect(treatment.quantityUnit).toBeDefined();

            var refilledTreatment = treatment.refill();

            var dosingType = refilledTreatment.uniformDosingType;
            expect(dosingType.dose).toBe(undefined);
            expect(dosingType.doseUnits).toBe(undefined);
            expect(dosingType.frequency).toBe(undefined);
            expect(refilledTreatment.quantity).toBe(undefined);
            expect(refilledTreatment.quantityUnit).toBe("Unit(s)");
        });

        it("should set doseUnits and route based on drug form for reverse synced drug orders", function(){
            var appConfig = {"drugFormDefaults" : {"Tablet": { "doseUnits": "Tablet(s)", "route": "Oral" }}};
            var treatment = sampleTreatment(appConfig, treatmentConfig);
            treatment.reverseSynced = true;
            treatment.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
            treatment.uniformDosingType = {
                dose: 1,
                doseUnits: "Tablet(s)",
                frequency: "Once a day"
            };
            expect(treatment.quantity).toBeDefined();
            expect(treatment.quantityUnit).toBeDefined();

            var refilledTreatment = treatment.refill();

            expect(refilledTreatment.doseUnits).toBe("Tablet(s)");
            expect(refilledTreatment.route).toBe("Oral");
        });
    });

    describe("edit", function () {

        it("should not change scheduled date", function () {
            var treatment = sampleTreatment({}, []);
            var now = DateUtil.now();
            treatment.effectiveStartDate = DateUtil.addDays(now, 2);

            var editedTreatment = treatment.cloneForEdit(0);
            expect(DateUtil.isSameDate(editedTreatment.scheduledDate, treatment.scheduledDate)).toBe(true);
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
        var isoDateTimeFormat = "YYYY-MM-DD HH:mm:ss";

        beforeEach(function(){
            var now = DateUtil.now();
            spyOn(DateUtil, 'now').and.returnValue(now);
        });

        it("should set scheduledDate if date is in future", function () {
            var treatment = sampleTreatment({}, []);
            var now = DateUtil.now();

            treatment.effectiveStartDate = moment(DateUtil.addSeconds(now, 1)).format(isoDateTimeFormat);

            expect(treatment.scheduledDate).toBe(treatment.effectiveStartDate);
        });

        it("should clear scheduledDate if date is equals now", function () {
            var treatment = sampleTreatment({}, []);

            treatment.effectiveStartDate = moment(DateUtil.now()).format(isoDateTimeFormat);

            expect(treatment.scheduledDate).toBe(null);
        });

        it("should clear scheduledDate if date is today few seconds ago", function () {
            var treatment = sampleTreatment({}, []);

            treatment.effectiveStartDate = moment(DateUtil.addSeconds(DateUtil.now(), -1)).format(isoDateTimeFormat);

            expect(treatment.scheduledDate).toBe(null);
        });

        it("should clear scheduledDate if date is past date", function () {
            var treatment = sampleTreatment({}, []);
            var now = DateUtil.now();

            treatment.effectiveStartDate = moment(DateUtil.subtractDays(now, 2)).format(isoDateTimeFormat);

            expect(treatment.scheduledDate).toBe(null);
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
                treatment.doseUnits = undefined;
                treatment.uniformDosingType = {
                    dose: undefined,
                    frequency: undefined
                };
                expect(treatment.validate()).toBeFalsy();
            });

            it("should pass validation if dose and doseUnits are empty but frequency is not.", function () {
                treatment.doseUnits = undefined;
                treatment.uniformDosingType = {
                    dose: undefined,
                    frequency: "Once a day."
                };

                expect(treatment.validate()).toBeTruthy();
            });

            it("should fail validation if dose and frequency is given but dose units is not", function () {
                treatment.doseUnits = undefined;
                treatment.uniformDosingType = {
                    dose: 1,
                    frequency: "Once a day."
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should fail validation if dose is given but dose units and frequency is not", function () {
                treatment.doseUnits = undefined;
                treatment.uniformDosingType = {
                    dose: 1,
                    frequency: undefined
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should fail validation if dose units are given but dose and frequency is not", function () {
                treatment.doseUnits = "Some";
                treatment.uniformDosingType = {
                    dose: undefined,
                    frequency: undefined
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should fail validation if dose units and frequency are given but dose is not", function () {
                treatment.doseUnits = "Some";
                treatment.uniformDosingType = {
                    dose: undefined,
                    frequency: "Once a day"
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should fail validation dose and dose units are given and frequency is not", function () {
                var treatment = sampleTreatment({}, {});
                treatment.doseUnits = "Some";
                treatment.uniformDosingType = {
                    dose: 1,
                    frequency: undefined
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should pass validation if all are given", function () {
                treatment.doseUnits = "Some";
                treatment.uniformDosingType = {
                    dose: 1,
                    frequency: "Once a day"
                };

                expect(treatment.validate()).toBeTruthy();
            });

            it("should fail validation if all are given but dose is 0", function () {
                treatment.doseUnits = "Some";
                treatment.uniformDosingType = {
                    dose: 0,
                    frequency: "Once a day"
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should fail validation if dose is 0 and dose units is not given", function () {
                treatment.doseUnits = undefined;
                treatment.uniformDosingType = {
                    dose: 0,
                    frequency: "Once a day"
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should fail validation if dose is 0 and dose units is given but frequency is not", function () {
                treatment.doseUnits = "Some";
                treatment.uniformDosingType = {
                    dose: 0,
                    frequency: undefined
                };

                expect(treatment.validate()).toBeFalsy();
            });
        });

        describe("for variable dosing type", function () {
            var treatment = sampleTreatment({}, {});
            treatment.frequencyType = Bahmni.Clinical.Constants.dosingTypes.variable;
            it("should fail validation if all the fields are empty", function () {
                treatment.doseUnits = undefined;
                treatment.variableDosingType = {
                    morningDose: undefined,
                    afternoonDose: undefined,
                    eveningDose: undefined
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should fail validation if morning dose is set and all other fields are empty", function () {
                treatment.doseUnits = undefined;
                treatment.variableDosingType = {
                    morningDose: 1,
                    afternoonDose: undefined,
                    eveningDose: undefined
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should fail validation if afternoon dose is set and all other fields are empty", function () {
                treatment.doseUnits = undefined;
                treatment.variableDosingType = {
                    morningDose: undefined,
                    afternoonDose: 1,
                    eveningDose: undefined
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should fail validation if evening dose is set and all other fields are empty", function () {
                treatment.doseUnits = undefined;
                treatment.variableDosingType = {
                    morningDose: undefined,
                    afternoonDose: undefined,
                    eveningDose: 1
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should fail validation if dose units is set and all other fields are empty", function () {
                treatment.doseUnits = "Tablet(s)";
                treatment.variableDosingType = {
                    morningDose: undefined,
                    afternoonDose: undefined,
                    eveningDose: undefined
                };

                expect(treatment.validate()).toBeFalsy();
            });

            it("should pass validation if all the fields are set", function () {
                treatment.doseUnits = "Tablet(s)";
                treatment.variableDosingType = {
                    morningDose: 1,
                    afternoonDose: 0,
                    eveningDose: 1
                };

                expect(treatment.validate()).toBeTruthy();
            });
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

    describe("changeDrug", function(){
        it("should set default dose units if units available in config", function(){
            var appConfig = {"drugFormDefaults" : {"Ayurvedic" : {"doseUnits": "Teaspoon", "route": "Orally" }}};
            var treatment = sampleTreatment(appConfig, treatmentConfig);
            treatment.changeDrug({form : "Ayurvedic"});

            expect(treatment.doseUnits).toBe("Teaspoon");
            expect(treatment.route).toBe("Orally");
        });

        it("should not set dose units if units not available in config", function(){
            var appConfig = {"drugFormDefaults" : {"Ayurvedic" : {"doseUnits": "ml", "route": "Mouth" }}};
            var treatment = sampleTreatment(appConfig, treatmentConfig);
            treatment.changeDrug({form : "Ayurvedic"});

            expect(treatment.doseUnits).toBe(undefined);
            expect(treatment.route).toBeUndefined();
        });

        it("should not fail when drugFormDefaults is not define for drug form", function(){
            var appConfig = {"drugFormDefaults" : {"Ayurvedic" : {"doseUnits": "Teaspoon", "route": "Mouth" }}};
            var treatment = sampleTreatment(appConfig, {});

            treatment.changeDrug({form : "Capsule"});

            expect(treatment.doseUnits).toBe(undefined);
            expect(treatment.route).toBe(undefined);
        })

        it("should not fail when app config does not have drugFormDefaults", function(){
            var treatment = sampleTreatment({}, {});

            treatment.changeDrug({form : "Ayurvedic"});

            expect(treatment.doseUnits).toBe(undefined);
            expect(treatment.route).toBe(undefined);
        })

        it("should not fail when drug is cleared", function(){
            var treatment = sampleTreatment({}, {});

            treatment.changeDrug(null);

            expect(treatment.drug).toBe(null);
        })
    });
    describe("checkOverlappingSchedule", function () {
        it("should return true if self order and other order do not have effective stop date", function(){
            var treatment = sampleTreatment({}, {});
            var otherOrder = sampleTreatment({}, {});
            treatment.effectiveStopDate = null;
            otherOrder.effectiveStopDate = null;
            expect(treatment.overlappingScheduledWith(otherOrder)).toBeTruthy();
        })

        it("should return true if self order and other order have same start date", function(){
            var treatment = sampleTreatment({}, {});
            var otherOrder = sampleTreatment({}, {});
            treatment.effectiveStartDate = DateUtil.parse("11/1/2001");
            treatment.effectiveStopDate = DateUtil.parse("11/7/2001");
            otherOrder.effectiveStartDate = DateUtil.parse("11/1/2001");
            otherOrder.effectiveStopDate = DateUtil.parse("11/7/2001");
            expect(treatment.overlappingScheduledWith(otherOrder)).toBeTruthy();
        })

        it("should return false if self order ends before other order starts", function(){
            var treatment = sampleTreatment({}, {});
            var otherOrder = sampleTreatment({}, {});
            treatment.effectiveStartDate = DateUtil.parse("11/7/2001");
            treatment.effectiveStopDate = DateUtil.parse("11/9/2001");
            otherOrder.effectiveStartDate = DateUtil.parse("11/11/2001");
            expect(treatment.overlappingScheduledWith(otherOrder)).toBeFalsy();
        })

        it("should return false if self order starts after other Order", function(){
            var treatment = sampleTreatment({}, {});
            var otherOrder = sampleTreatment({}, {});
            treatment.effectiveStartDate = DateUtil.parse("11/15/2001");
            treatment.effectiveStopDate = DateUtil.parse("11/17/2001");
            otherOrder.effectiveStopDate = DateUtil.parse("11/14/2001");
            expect(treatment.overlappingScheduledWith(otherOrder)).toBeFalsy();
        })

        it("should return true if self order stops after the other order has already been activated", function(){
            var treatment = sampleTreatment({}, {});
            var otherOrder = sampleTreatment({}, {});
            treatment.effectiveStartDate = DateUtil.parse("11/09/2001");
            treatment.effectiveStopDate = DateUtil.parse("11/17/2001");
            otherOrder.effectiveStartDate = DateUtil.parse("11/11/2001");
            expect(treatment.overlappingScheduledWith(otherOrder)).toBeTruthy();
        })

        it("should return true if self order starts when the other order is active", function(){
            var treatment = sampleTreatment({}, {});
            var otherOrder = sampleTreatment({}, {});
            treatment.effectiveStartDate = DateUtil.parse("11/12/2001");
            otherOrder.effectiveStartDate = DateUtil.parse("11/10/2001");
            otherOrder.effectiveStopDate = DateUtil.parse("11/14/2001");
            expect(treatment.overlappingScheduledWith(otherOrder)).toBeTruthy();
        })

        it("should return true if self order starts before other order and ends after other order", function(){
            var treatment = sampleTreatment({}, {});
            var otherOrder = sampleTreatment({}, {});
            treatment.effectiveStartDate = DateUtil.parse("11/09/2001");
            treatment.effectiveStopDate = DateUtil.parse("11/17/2001");
            otherOrder.effectiveStartDate = DateUtil.parse("11/10/2001");
            otherOrder.effectiveStopDate = DateUtil.parse("11/14/2001");
            expect(treatment.overlappingScheduledWith(otherOrder)).toBeTruthy();
        })

        it("should return true if self order starts on the stop date of other order", function(){
            var treatment = sampleTreatment({}, {});
            var otherOrder = sampleTreatment({}, {});
            treatment.effectiveStartDate = DateUtil.parse("11/09/2001");
            treatment.effectiveStopDate = DateUtil.parse("11/14/2001");
            otherOrder.effectiveStartDate = DateUtil.parse("11/06/2001");
            otherOrder.effectiveStopDate = DateUtil.parse("11/09/2001");
            expect(treatment.overlappingScheduledWith(otherOrder)).toBeTruthy();
        })

        it("should return true if other order starts before self order and ends after self order", function(){
            var treatment = sampleTreatment({}, {});
            var otherOrder = sampleTreatment({}, {});
            treatment.effectiveStartDate = DateUtil.parse("11/09/2001");
            treatment.effectiveStopDate = DateUtil.parse("11/11/2001");
            otherOrder.effectiveStartDate = DateUtil.parse("11/06/2001");
            otherOrder.effectiveStopDate = DateUtil.parse("11/12/2001");
            expect(treatment.overlappingScheduledWith(otherOrder)).toBeTruthy();
        })

        it("should return true if self order ends on the start date of other order", function(){
            var treatment = sampleTreatment({}, {});
            var otherOrder = sampleTreatment({}, {});
            treatment.effectiveStartDate = DateUtil.parse("11/09/2001");
            treatment.effectiveStopDate = DateUtil.parse("11/11/2001");
            otherOrder.effectiveStartDate = DateUtil.parse("11/11/2001");
            otherOrder.effectiveStopDate = DateUtil.parse("11/14/2001");
            expect(treatment.overlappingScheduledWith(otherOrder)).toBeTruthy();
        })

        it("should return true if both orders start and end on same dates", function(){
            var treatment = sampleTreatment({}, {});
            var otherOrder = sampleTreatment({}, {});
            treatment.effectiveStartDate = DateUtil.parse("11/09/2001");
            treatment.effectiveStopDate = DateUtil.parse("11/11/2001");
            otherOrder.effectiveStartDate = DateUtil.parse("11/09/2001");
            otherOrder.effectiveStopDate = DateUtil.parse("11/11/2001");
            expect(treatment.overlappingScheduledWith(otherOrder)).toBeTruthy();
        })

    });
});