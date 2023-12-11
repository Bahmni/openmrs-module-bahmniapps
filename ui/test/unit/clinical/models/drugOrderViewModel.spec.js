'use strict';

describe("drugOrderViewModel", function () {
    var DateUtil = Bahmni.Common.Util.DateUtil;
    var sampleTreatment = function ( treatmentConfig, defaults, encounterDate) {
        return Bahmni.Tests.drugOrderViewModelMother.build(treatmentConfig, defaults, encounterDate);
    };

    var treatmentConfig;
    beforeEach(function(){
        treatmentConfig = {
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
                }
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
            ],
            getDoseFractions: function(){
                return [
                    {"value": 0.50, "label": "½"},
                    {"value": 0.33, "label": "⅓"},
                    {"value": 0.25, "label": "¼"},
                    {"value": 0.75, "label": "¾"}
            ]},
            inputOptionsConfig: {}
        };
    });
    it("should get the text to be displayed in the treatment list", function () {
        var treatment = sampleTreatment([], null, Bahmni.Common.Util.DateUtil.now());
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

    it("should get the decimal text sum of both dose and mantissa when doseFractions config is absent", function () {
        var treatment = sampleTreatment({}, null, Bahmni.Common.Util.DateUtil.now());
        treatment.durationUnit = "Days";
        treatment.route = "Orally";
        treatment.uniformDosingType.dose = "1.5";
        treatment.uniformDosingType.doseUnits = "Capsule";
        treatment.uniformDosingType.frequency = "Once a day";
        treatment.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
        expect(treatment.getDescription()).toBe("1.5 Capsule, Once a day, Before Meals, Orally - 10 Days");

        treatment.uniformDosingType.frequency = null;
        expect(treatment.getDescription()).toBe("1.5 Capsule, Before Meals, Orally - 10 Days");
    });

    it("should get the mixed fraction text sum of both dose and mantissa when doseFractions config is present", function () {
        var treatment = sampleTreatment(treatmentConfig, null, Bahmni.Common.Util.DateUtil.now());
        treatment.durationUnit = "Days";
        treatment.route = "Orally";
        treatment.uniformDosingType.dose = "1.5";
        treatment.uniformDosingType.doseUnits = "Capsule";
        treatment.uniformDosingType.frequency = "Once a day";
        treatment.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
        expect(treatment.getDescription()).toBe("1½ Capsule, Once a day, Before Meals, Orally - 10 Days");

        treatment.uniformDosingType.frequency = null;
        expect(treatment.getDescription()).toBe("1½ Capsule, Before Meals, Orally - 10 Days");
    });

    it("should get the same real number in the treatment list when doseFractions config is absent", function () {
        var treatment = sampleTreatment({}, null, Bahmni.Common.Util.DateUtil.now());
        treatment.durationUnit = "Days";
        treatment.route = "Orally";
        treatment.uniformDosingType.dose = "1.5";
        treatment.uniformDosingType.doseUnits = "Capsule";
        treatment.uniformDosingType.frequency = "Once a day";
        treatment.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
        expect(treatment.getDescription()).toBe("1.5 Capsule, Once a day, Before Meals, Orally - 10 Days");

        treatment.uniformDosingType.frequency = null;
        expect(treatment.getDescription()).toBe("1.5 Capsule, Before Meals, Orally - 10 Days");
    });

    it("should get the mixed fraction text in the treatment list when doseFractions config is defined ", function () {
        var treatment = sampleTreatment(treatmentConfig, null, Bahmni.Common.Util.DateUtil.now());
        treatment.durationUnit = "Days";
        treatment.route = "Orally";
        treatment.uniformDosingType.dose = "1.50";
        treatment.uniformDosingType.doseUnits = "Capsule";
        treatment.uniformDosingType.frequency = "Once a day";
        treatment.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
        expect(treatment.getDescription()).toBe("1½ Capsule, Once a day, Before Meals, Orally - 10 Days");

        treatment.uniformDosingType.frequency = null;
        expect(treatment.getDescription()).toBe("1½ Capsule, Before Meals, Orally - 10 Days");
    });

    it("should get the same real number in the treatment list when doseFractions is defined and it doesnt have entry for mantissa part of real number", function () {
        var treatment = sampleTreatment(treatmentConfig, null, Bahmni.Common.Util.DateUtil.now());
        treatment.durationUnit = "Days";
        treatment.route = "Orally";
        treatment.uniformDosingType.dose = "1.55";
        treatment.uniformDosingType.doseUnits = "Capsule";
        treatment.uniformDosingType.frequency = "Once a day";
        treatment.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
        expect(treatment.getDescription()).toBe("1.55 Capsule, Once a day, Before Meals, Orally - 10 Days");

        treatment.uniformDosingType.frequency = null;
        expect(treatment.getDescription()).toBe("1.55 Capsule, Before Meals, Orally - 10 Days");
    });

    it("should display mixed fraction variable dosages if doseFractions is present", function () {
        var treatment = sampleTreatment(treatmentConfig, null, Bahmni.Common.Util.DateUtil.now());
        treatment.frequencyType = "variable";
        treatment.route = "Orally";
        treatment.durationUnit = "Days";
        treatment.variableDosingType = {
            morningDose: 1.5,
            afternoonDose: 2.25,
            eveningDose: 3.75
        };

        expect(treatment.getDescription()).toBe("1½-2¼-3¾, Before Meals, Orally - 10 Days")
    });

    it("should not display mixed fraction variable dosages if doseFractions is absent", function () {
        var treatment = sampleTreatment([], null, Bahmni.Common.Util.DateUtil.now());
        treatment.frequencyType = "variable";
        treatment.route = "Orally";
        treatment.durationUnit = "Days";
        treatment.variableDosingType = {
            morningDose: 1.5,
            afternoonDose: 2.25,
            eveningDose: 3.75
        };

        expect(treatment.getDescription()).toBe("1.5-2.25-3.75, Before Meals, Orally - 10 Days")
    });

    it("should display mixed fraction variable dosages if doseFractions is present and in the list", function () {
        var treatment = sampleTreatment(treatmentConfig, null, Bahmni.Common.Util.DateUtil.now());
        treatment.frequencyType = "variable";
        treatment.route = "Orally";
        treatment.durationUnit = "Days";
        treatment.variableDosingType = {
            morningDose: 1.5,
            afternoonDose: 2,
            eveningDose: 3.47
        };

        expect(treatment.getDescription()).toBe("1½-2-3.47, Before Meals, Orally - 10 Days")
    });

    it("should get the text to be displayed in the treatment list with dosage instructions", function () {
        var treatment = sampleTreatment({}, null, Bahmni.Common.Util.DateUtil.now());
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
        var treatment = sampleTreatment({}, null, Bahmni.Common.Util.DateUtil.now());
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

    it("should get the text to be displayed in the treatment list without route", function () {
        var treatment = sampleTreatment({}, null, Bahmni.Common.Util.DateUtil.now());
        treatment.durationUnit = "Days";
        treatment.route = "Orally";
        treatment.uniformDosingType.dose = "1";
        treatment.uniformDosingType.doseUnits = "Capsule";
        treatment.uniformDosingType.frequency = "Once a day";
        treatment.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
        expect(treatment.getDescriptionWithoutRoute()).toBe("1 Capsule, Once a day, Before Meals - 10 Days");
    });

    it("should get the text to be displayed in the treatment list without route without duration", function () {
        var treatment = sampleTreatment({}, [], null, Bahmni.Common.Util.DateUtil.now());
        treatment.durationUnit = "Days";
        treatment.route = "Orally";
        treatment.uniformDosingType.dose = "1";
        treatment.uniformDosingType.doseUnits = "Capsule";
        treatment.uniformDosingType.frequency = "Once a day";
        treatment.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
        expect(treatment.getDescriptionWithoutRouteAndDuration()).toBe("1 Capsule, Once a day, Before Meals ");
    });

    it("should get default durationUnit from config if available", function () {
        treatmentConfig.inputOptionsConfig.defaultDurationUnit = "Month(s)";
        var treatment = sampleTreatment( treatmentConfig, null, Bahmni.Common.Util.DateUtil.now());
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

    it("should copy dose units to uniformDosingType when changing frequency type to uniform", function () {
        var sampleTreatment = new Bahmni.Clinical.DrugOrderViewModel({});
        sampleTreatment.variableDosingType = {
            morningDose: 1,
            afternoonDose: 1,
            eveningDose: 1,
            doseUnits : "Tablets"
        };
        sampleTreatment.setFrequencyType(Bahmni.Clinical.Constants.dosingTypes.uniform);
        expect(sampleTreatment.uniformDosingType).not.toBe({});
        expect(sampleTreatment.uniformDosingType.doseUnits).toEqual("Tablets");
    });

    it("should copy dose units to variableDosingType when changing frequency type to variable", function () {
        var sampleTreatment = new Bahmni.Clinical.DrugOrderViewModel({});
        sampleTreatment.uniformDosingType = {
            doseUnits : "Tablets"
        };
        sampleTreatment.setFrequencyType(Bahmni.Clinical.Constants.dosingTypes.variable);
        expect(sampleTreatment.variableDosingType).not.toBe({});
        expect(sampleTreatment.variableDosingType.doseUnits).toEqual("Tablets");
    });


    it("should change duration unit based on frequency factor for uniform frequency type", function () {
       treatmentConfig.inputOptionsConfig.frequencyDefaultDurationUnitsMap = [
            {"minFrequency":5, "maxFrequency": null, "defaultDurationUnit": "Hour(s)"},
            {"minFrequency":"1/7", "maxFrequency": 5, "defaultDurationUnit": "Day(s)"},
            {"minFrequency":"1/30", "maxFrequency": "1/7", "defaultDurationUnit": "Week(s)"},
            {"minFrequency":null, "maxFrequency": "1/30", "defaultDurationUnit": "Month(s)"}
        ];

        var sampleTreatment = new Bahmni.Clinical.DrugOrderViewModel(treatmentConfig);

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
        treatmentConfig.inputOptionsConfig.frequencyDefaultDurationUnitsMap =[
            {"minFrequency":5, "maxFrequency": null, "defaultDurationUnit": "Hour(s)"},
            {"minFrequency":null, "maxFrequency": "1/30", "defaultDurationUnit": "Month(s)"}
        ];
        var sampleTreatment = new Bahmni.Clinical.DrugOrderViewModel(treatmentConfig);
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
            var treatment = sampleTreatment(treatmentConfig, null, Bahmni.Common.Util.DateUtil.now());
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
            var treatment = sampleTreatment(treatmentConfig, null, Bahmni.Common.Util.DateUtil.now());
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
            var treatment = sampleTreatment({}, treatmentConfig, null, Bahmni.Common.Util.DateUtil.now());
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

        it("should result in NaN for uniform dose when duration is not available", function () {
            var treatment = sampleTreatmentWithUniformDosing(3, "Capsule", "Twice a Day", null, "Day(s)");
            treatment.calculateQuantityAndUnit();
            expect(treatment.quantity).toBeNaN();

            treatment = sampleTreatmentWithVariableDosing(1, 0, 1, "Capsule", null, "Day(s)");
            treatment.calculateQuantityAndUnit();
            expect(treatment.quantity).toBeNaN();
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
            treatment.doseUnits = "Unit(s)";
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

        it("should set dose and unit based on config frequency", function(){
                treatmentConfig.inputOptionsConfig = {
                    "autopopulateDurationBasedOnFrequency" : [
                        {
                        "frequencyName":"Twice a Day",
                        "duration":1,
                        "durationUnit":"Day(s)"
                      }
                    ]
                };
                var treatment = sampleTreatmentWithUniformDosing(3, "Capsule", "Twice a Day");
                treatment.calculateQuantityAndUnit();
                
                expect(treatment.duration).toBe(1);
                expect(treatment.durationUnit).toBe("Day(s)");
            });
    });

    describe("Discontinued", function () {
        it("should return true if the action is discontinue", function () {
            var treatment = sampleTreatment({}, [], null, Bahmni.Common.Util.DateUtil.now());
            treatment.action = 'DISCONTINUE';

            expect(treatment.discontinued()).toBe(true);
        });

        it("should return false if the action is new", function () {
            var treatment = sampleTreatment({}, [], null, Bahmni.Common.Util.DateUtil.now());
            treatment.action = 'NEW';

            expect(treatment.discontinued()).toBe(false);
        });

        it("should return false if the action is Revise", function () {
            var treatment = sampleTreatment({}, [], null, Bahmni.Common.Util.DateUtil.now());
            treatment.action = 'REVISE';

            expect(treatment.discontinued()).toBe(false);
        });
    });

    describe("isDiscontinuedOrStopped", function () {
        it("should return true if the action is discontinue", function () {
            var treatment = sampleTreatment({}, [], null, Bahmni.Common.Util.DateUtil.now());
            treatment.action = 'DISCONTINUE';
            treatment.dateStopped = null;

            expect(treatment.isDiscontinuedOrStopped()).toBe(true);
        });

        it("should return true if order has been stopped", function () {
            var treatment = sampleTreatment({}, [], null, Bahmni.Common.Util.DateUtil.now());
            treatment.action = 'NEW';
            treatment.dateStopped = new Date();

            expect(treatment.isDiscontinuedOrStopped()).toBe(true);
        });

        it("should return false if action is not discontinue and order is not stopped", function () {
            var treatment = sampleTreatment({}, [], null, Bahmni.Common.Util.DateUtil.now());
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
                "concept": {
                    "shortName": "Methylprednisolone 2ml"
                },
                "provider": {name: "superman"},
                "orderAttributes":[{name:"dispensed",value:true},{name:"administered",value:false}]
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

        var config ={
            orderAttributes:[
                {
                    name:"dispensed",
                    uuid:"dispensed-uuid"
                },
                {
                    name:"administered",
                    uuid:"administered-uuid"
                }
            ]
        };

        it("should map fields correctly from Drug Order", function () {
            var drugOrder = new DrugOrderContractMother().create();
            var drugOrderViewModel = Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder,null,config);
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
            expect(drugOrderViewModel.effectiveStartDate).toEqual(DateUtil.parse(drugOrder.effectiveStartDate));
            expect(drugOrderViewModel.effectiveStopDate).toBe(drugOrder.effectiveStopDate);
            expect(drugOrderViewModel.provider).toBe(drugOrder.provider);
            expect(drugOrderViewModel.dateActivated).toBe(drugOrder.dateActivated);
            expect(drugOrderViewModel.reverseSynced).toBeFalsy();

            expect(drugOrderViewModel.orderAttributes.length).toBe(2);
            expect(drugOrderViewModel.orderAttributes[0].name).toBeTruthy("dispensed");
            expect(drugOrderViewModel.orderAttributes[0].value).toBeTruthy();

            expect(drugOrderViewModel.orderAttributes[1].name).toBeTruthy("administered");
            expect(drugOrderViewModel.orderAttributes[1].value).toBeFalsy();

        });

        it("should map fields for reverse synced drug orders", function() {
            var drugOrder = new DrugOrderContractMother().forReverseSynced().create();
            var drugOrderViewModel = Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder);

            expect(drugOrderViewModel.uniformDosingType.dose).toBe(1);
            expect(drugOrderViewModel.doseUnits).toBe("Tablet(s)");
            expect(drugOrderViewModel.reverseSynced).toBe(true);
        });


    });

    describe("OrderAttributes",function(){
        var drugOrderContract =  {
            "uuid": "order-uuid",
            "orderType": "Drug Order",
            "orderNumber": "ORD-1234",
            "visit": {
                "startDateTime": 1397028261000,
                "uuid": "002efa33-4c4f-469f-968a-faedfe3a5e0c"
            },
            "drug": {
                "form": "Injection",
                "uuid": "8d7e3dc0-f4ad-400c-9468-5a9e2b1f4230",
                "name": "Methylprednisolone 2ml"
            },
            "concept": {
                "shortName": "Methylprednisolone 2ml"
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
            "effectiveStartDate": 1410322624000,
            "duration": 10,
            "provider": {name: "superman"},
            "orderAttributes":[
                {name:"dispensed",value:"true",obsUuid:"dispensed-obs-uuid"},
                {name:"administered",value:"false",obsUuid:"administered-obs-uuid"}
            ]
        };

        it("should be mapped to BahmniObservation",function(){
            var config ={
                orderAttributes:[
                    {
                        name:"dispensed",
                        uuid:"dispensed-uuid"
                    },
                    {
                        name:"administered",
                        uuid:"administered-uuid"
                    },
                    {
                        name:"someAction",
                        uuid:"someAction-uuid"
                    }
                ]
            };
            var drugOrderViewModel = Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrderContract,config);
            var orderAttributesAsObs = drugOrderViewModel.getOrderAttributesAsObs();
            expect(orderAttributesAsObs.length).toBe(2);
            expect(orderAttributesAsObs[0].uuid).toBe("dispensed-obs-uuid");
            expect(orderAttributesAsObs[0].value).toBeTruthy();
            expect(orderAttributesAsObs[1].uuid).toBe("administered-obs-uuid");
            expect(orderAttributesAsObs[1].value).toBeFalsy();
        });
    });

    describe("revise", function () {
        it("should create a new object that can be used for revision", function () {
            var treatment = sampleTreatment({}, [], {}, Bahmni.Common.Util.DateUtil.now());
            treatment.uniformDosingType.doseUnits = 'Tablet(s)';
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
            var now = Bahmni.Common.Util.DateUtil.now();
            var treatment = sampleTreatment({}, [], null, now);
            treatment.effectiveStartDate = DateUtil.addDays(now, 2);
            treatment.drug = { form: undefined };
            var revisedTreatment = treatment.revise();
            expect(treatment.scheduledDate.getTime() === revisedTreatment.scheduledDate.getTime()).toBe(true);
        });

        it("should map uuid to previousOrderUuid", function () {
            var treatment = sampleTreatment({}, [], null, Bahmni.Common.Util.DateUtil.now());
            treatment.drug = {  form: undefined };
            treatment.uuid = "previous-order-uuid";

            var revisedTreatment = treatment.revise();
            expect(revisedTreatment.previousOrderUuid).toBe(treatment.uuid);
            expect(treatment.previousOrderUuid).not.toBe(treatment.uuid);
        });

        it("should set action as REVISE", function () {
            var treatment = sampleTreatment({}, [], null, Bahmni.Common.Util.DateUtil.now());
            treatment.drug = { form: undefined };

            var revisedTreatment = treatment.revise();
            expect(revisedTreatment.action).toBe(Bahmni.Clinical.Constants.orderActions.revise);
            expect(treatment.action).not.toBe(Bahmni.Clinical.Constants.orderActions.revise);
        });

        it("should clear dose, doseUnits and quantity for reverse synced drug orders", function(){
            var treatment = sampleTreatment({}, [], null, Bahmni.Common.Util.DateUtil.now());
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
            var now = Bahmni.Common.Util.DateUtil.now();
            var treatment = sampleTreatment({}, null, now);
            var today = DateUtil.today();

            treatment.previousOrderUuid = "prev-uuid";
            treatment.effectiveStopDate = DateUtil.subtractDays(today, 30);
            var refilledTreatment = treatment.refill();
            expect(refilledTreatment.uuid).toBe(undefined);
            expect(refilledTreatment.dateActivated).toBe(undefined);
            expect(refilledTreatment.previousOrderUuid).toBe(undefined);
            expect(refilledTreatment.effectiveStartDate).toEqual(now);
            expect(refilledTreatment.effectiveStopDate).toEqual(DateUtil.addDays(now,10));
        });


        it("should refill an active drug order", function () {
            var treatment = sampleTreatment({}, [], null, Bahmni.Common.Util.DateUtil.now());
            var today = DateUtil.today();
            treatment.previousOrderUuid = "prev-uuid";
            treatment.effectiveStopDate = DateUtil.addDays(today, 5);
            var refilledTreatment = treatment.refill();
            expect(refilledTreatment.uuid).toBe(undefined);
            expect(refilledTreatment.dateActivated).toBe(undefined);
            expect(refilledTreatment.previousOrderUuid).toBe(undefined);
            var startDateForRefilledTreatment = DateUtil.addSeconds(treatment.effectiveStopDate, 1);
            expect(refilledTreatment.effectiveStartDate).toEqual(startDateForRefilledTreatment);
            expect(refilledTreatment.effectiveStopDate).toEqual(DateUtil.addDays(startDateForRefilledTreatment,10));
        });

        it("should refill an active drug order ending today", function () {
            var today = DateUtil.today();
            var treatment = sampleTreatment({}, [], null, DateUtil.subtractDays(today, 2));
            treatment.previousOrderUuid = "prev-uuid";
            treatment.effectiveStartDate = DateUtil.subtractDays(today, 2);
            treatment.effectiveStopDate = today;
            var refilledTreatment = treatment.refill();
            expect(refilledTreatment.uuid).toBe(undefined);
            expect(refilledTreatment.dateActivated).toBe(undefined);
            expect(refilledTreatment.previousOrderUuid).toBe(undefined);
            var startDateForRefilledTreatment = DateUtil.addSeconds(treatment.effectiveStopDate, 1);
            expect(refilledTreatment.effectiveStartDate).toEqual(startDateForRefilledTreatment);
            expect(refilledTreatment.effectiveStopDate).toEqual(DateUtil.addDays(startDateForRefilledTreatment,10));
        });

        it("should set quantity units as Unit(s) for reverse synced drug orders", function () {
            var treatment = sampleTreatment({}, [], null, Bahmni.Common.Util.DateUtil.now());
            var today = DateUtil.today();
            treatment.previousOrderUuid = "prev-uuid";
            treatment.effectiveStopDate = today;
            treatment.quantityUnit = null;
            var refilledTreatment = treatment.refill();
            expect(refilledTreatment.quantityUnit).toBe("Unit(s)");
        });

        it("should clear dose and quantity for reverse synced drug orders", function(){
            var treatment = sampleTreatment({}, [], null, Bahmni.Common.Util.DateUtil.now());
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
            treatmentConfig.inputOptionsConfig.drugFormDefaults =  {"Tablet": { "doseUnits": "Tablet(s)", "route": "Oral" }};
            var treatment = sampleTreatment(treatmentConfig, null, Bahmni.Common.Util.DateUtil.now());
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
            var treatment = sampleTreatment({}, [], null, Bahmni.Common.Util.DateUtil.now());
            var now = DateUtil.now();
            treatment.effectiveStartDate = DateUtil.addDays(now, 2);

            var editedTreatment = treatment.cloneForEdit(0);
            expect(DateUtil.isSameDate(editedTreatment.scheduledDate, treatment.scheduledDate)).toBe(true);
        });

        it("should create a copy of the drug to be edited", function () {
            var treatment = sampleTreatment({}, [], null, Bahmni.Common.Util.DateUtil.now());
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
            var treatment = sampleTreatment({}, [], null, Bahmni.Common.Util.DateUtil.now());
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
            var treatment = sampleTreatment({}, [], null, Bahmni.Common.Util.DateUtil.now());
            var now = DateUtil.now();

            treatment.effectiveStartDate = moment(DateUtil.addSeconds(now, 1)).format(isoDateTimeFormat);

            expect(treatment.scheduledDate).toBe(treatment.effectiveStartDate);
        });

        it("should clear scheduledDate if date is equals now", function () {
            var treatment = sampleTreatment({}, null, Bahmni.Common.Util.DateUtil.now());

            treatment.effectiveStartDate = moment(DateUtil.now()).format(isoDateTimeFormat);

            expect(treatment.scheduledDate).toBe(null);
        });

        it("should clear scheduledDate if date is today few seconds ago", function () {
            var treatment = sampleTreatment({}, null, Bahmni.Common.Util.DateUtil.now());

            treatment.effectiveStartDate = moment(DateUtil.addSeconds(DateUtil.now(), -1)).format(isoDateTimeFormat);

            expect(treatment.scheduledDate).toBe(null);
        });

        it("should clear scheduledDate if date is past date", function () {
            var treatment = sampleTreatment({}, null, Bahmni.Common.Util.DateUtil.now());
            var now = DateUtil.now();

            treatment.effectiveStartDate = moment(DateUtil.subtractDays(now, 2)).format(isoDateTimeFormat);

            expect(treatment.scheduledDate).toBe(null);
        });
    });

    describe("Validate", function () {
        describe("for uniform dosing type", function () {
            var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());

            it("should fail validation if dose type is empty", function () {
                var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
                treatment.frequencyType = null;
                expect(treatment.isUniformDoseRequired()).toBeFalsy();
            });

            it("should not fail validation if all dose info is empty", function () {
                treatment.uniformDosingType = {
                    dose: undefined,
                    doseUnits: undefined
                };
                expect(treatment.isUniformDoseRequired()).toBeFalsy();
            });

            it("should fail validation if dose units are given but dose is not", function () {
                treatment.uniformDosingType = {
                    dose: undefined,
                    doseUnits: "Some"
                };

                expect(treatment.isUniformDoseRequired()).toBeTruthy();
            });


            it("should pass validation when dose is not given but dose fractions and units are given", function(){
                treatment.uniformDosingType = {
                    dose: undefined,
                    doseUnits: "Some",
                    doseFraction: 3/4
                };

                expect(treatment.isUniformDoseRequired()).toBeFalsy();

            });
            it("should pass validation dose and dose units are given ", function () {
                var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
                treatment.uniformDosingType = {
                    dose: 1,
                    doseUnits: "Some"
                };

                expect(treatment.isUniformDoseRequired()).toBeTruthy();
            });

            it("should not throw validation error when route is present in routesToMakeDoseSectionNonMandatory but units are defaulted", function () {
                treatmentConfig.inputOptionsConfig ={};
                var treatment = sampleTreatment(treatmentConfig, null, Bahmni.Common.Util.DateUtil.now());
                treatment.uniformDosingType.doseUnits = "ml";
                treatment.uniformDosingType.dose = undefined;
                treatment.route = "Topical";

                expect(treatment.isDoseMandatory()).toBeTruthy();

                treatmentConfig.inputOptionsConfig.routesToMakeDoseSectionNonMandatory = ["Topical", "Inhalation"];
                var treatment = sampleTreatment(treatmentConfig, null, Bahmni.Common.Util.DateUtil.now());
                treatment.uniformDosingType.doseUnits = "ml";
                treatment.uniformDosingType.dose = undefined;
                treatment.route = 'Topical';

                expect(treatment.isDoseMandatory()).toBeFalsy();
            });

            it("should validate mantissa for the routes in routesToMakeDoseSectionNonMandatory", function () {
                treatmentConfig.inputOptionsConfig ={};
                var treatment = sampleTreatment(treatmentConfig, null, Bahmni.Common.Util.DateUtil.now());
                treatment.uniformDosingType.dose = undefined;
                treatment.uniformDosingType.doseUnits = "ml";

                expect(treatment.isMantissaRequired()).toBeTruthy();

                treatmentConfig.inputOptionsConfig.routesToMakeDoseSectionNonMandatory = ["Topical", "Inhalation"];
                var treatment = sampleTreatment(treatmentConfig, null, Bahmni.Common.Util.DateUtil.now());
                treatment.uniformDosingType.dose = undefined;
                treatment.uniformDosingType.doseUnits = "ml";
                treatment.route = 'Topical';

                expect(treatment.isMantissaRequired()).toBeFalsy();
            });

            it("should validate uniform dose unit for the routes in routesToMakeDoseSectionNonMandatory", function () {
                treatmentConfig.inputOptionsConfig ={};
                var treatment = sampleTreatment(treatmentConfig, null, Bahmni.Common.Util.DateUtil.now());
                treatment.uniformDosingType.dose = 1;
                expect(treatment.isUniformDoseUnitRequired()).toBeTruthy();

                treatmentConfig.inputOptionsConfig.routesToMakeDoseSectionNonMandatory = ["Topical", "Inhalation"];
                var treatment = sampleTreatment(treatmentConfig, null, Bahmni.Common.Util.DateUtil.now());
                treatment.route = 'Topical';

                expect(treatment.isUniformDoseUnitRequired()).toBeFalsy();
            });

            it("should fail validation if dose is given but dose units is not", function () {
                treatment.uniformDosingType = {
                    dose: 1,
                    doseUnits: undefined
                };

                expect(treatment.isUniformDoseUnitRequired()).toBeTruthy();
            });

        });

        describe("for variable dosing type", function () {
            var treatment = sampleTreatment({}, {});
            treatment.frequencyType = Bahmni.Clinical.Constants.dosingTypes.variable;
            treatment.isUniformFrequency = false;

            it("should not fail validation if all the fields are empty", function () {
                treatment.variableDosingType = {
                    morningDose: undefined,
                    afternoonDose: undefined,
                    eveningDose: undefined,
                    doseUnits: undefined
                };

                expect(treatment.isVariableDoseRequired()).toBeFalsy();
            });

            it("should fail validation if morning dose is set and all other fields are empty", function () {
                treatment.variableDosingType = {
                    morningDose: 1,
                    afternoonDose: undefined,
                    eveningDose: undefined,
                    doseUnits: undefined
                };

                expect(treatment.isVariableDoseRequired()).toBeTruthy();
            });

            it("should fail validation if afternoon dose is set and all other fields are empty", function () {
                treatment.variableDosingType = {
                    morningDose: undefined,
                    afternoonDose: 1,
                    eveningDose: undefined,
                    doseUnits: undefined
                };

                expect(treatment.isVariableDoseRequired()).toBeTruthy();
            });

            it("should fail validation if evening dose is set and all other fields are empty", function () {
                treatment.variableDosingType = {
                    morningDose: undefined,
                    afternoonDose: undefined,
                    eveningDose: 1,
                    doseUnits: undefined
                };

                expect(treatment.isVariableDoseRequired()).toBeTruthy();
            });

            it("should fail validation if dose units is set and all other fields are empty", function () {
                treatment.variableDosingType = {
                    morningDose: undefined,
                    afternoonDose: undefined,
                    eveningDose: undefined,
                    doseUnits: "Tablet(s)"
                };

                expect(treatment.isVariableDoseRequired()).toBeTruthy();
            });

            it("should pass validation if all the fields are set", function () {
                treatment.variableDosingType = {
                    morningDose: 1,
                    afternoonDose: 0,
                    eveningDose: 1,
                    doseUnits: "Tablet(s)"
                };

                expect(treatment.isVariableDoseRequired()).toBeTruthy();
            });

            it("should pass validation if dose and dose units are not given for the routes in routesToMakeDoseSectionNonMandatory ", function () {
                treatmentConfig.inputOptionsConfig ={};
                var treatment = sampleTreatment(treatmentConfig, null, Bahmni.Common.Util.DateUtil.now());
                treatment.isUniformFrequency = false;
                treatment.variableDosingType.doseUnits = "ml";

                expect(treatment.isVariableDoseRequired()).toBeTruthy();

                treatmentConfig.inputOptionsConfig.routesToMakeDoseSectionNonMandatory = ["Topical", "Inhalation"];
                var treatment = sampleTreatment(treatmentConfig, null, Bahmni.Common.Util.DateUtil.now());
                treatment.route = 'Topical';

                expect(treatment.isVariableDoseRequired()).toBeFalsy();
            });

            it("should validate variable dose with all three doses entered", function () {
                var treatment = sampleTreatment(treatmentConfig, null, Bahmni.Common.Util.DateUtil.now());
                treatment.isUniformFrequency = false;
                treatment.frequencyType = Bahmni.Clinical.Constants.dosingTypes.variable;
                treatment.variableDosingType = {
                    morningDose: undefined,
                    afternoonDose: undefined,
                    eveningDose: undefined,
                };

                expect(treatment.isVariableDoseEmpty(treatment.variableDosingType)).toBeTruthy();

                treatment.variableDosingType = {
                    morningDose: 1,
                    afternoonDose: 2,
                    eveningDose: 3,
                };

                expect(treatment.isVariableDoseEmpty(treatment.variableDosingType)).toBeFalsy();
            });
        });

    });

    describe("isFrequencyType", function(){
        var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
        it("should return true if the frequency type is same.", function(){
            expect(treatment.isFrequencyType(Bahmni.Clinical.Constants.dosingTypes.uniform)).toBeTruthy();
        });

        it("should return false if the frequency type is not same.", function(){
            expect(treatment.isFrequencyType(Bahmni.Clinical.Constants.dosingTypes.variable)).toBeFalsy();
        });
    });

    describe("getDisplayName", function(){
        it("should return drug + form", function(){
            var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            expect(treatment.getDisplayName()).toBe("calpol 500mg (Tablet)");
        })
    });

    describe("getDescriptionWithQuantity", function(){
        xit("should return drug form as quantity unit if drug form is tablet", function(){
            var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            treatment.setDose(4);
            treatment.doseUnits = "Tablet(s)";
            treatment.quantityUnit = "Capsule(s)";
            expect(treatment.getDescriptionWithQuantity()).toBe("Before Meals, 1(12 Capsule(s))");
        })

        it("should return drug form as quantity unit if dose is not specified", function(){
            var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            treatment.doseUnits = "Tablet(s)";
            treatment.quantityUnit = "Capsule(s)";
            expect(treatment.getDescriptionWithQuantity()).toBe("Before Meals, 1(12 Capsule(s))");
        })

        it("should return drug form as quantity unit if variable dose is not specified", function(){
            var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            treatment.frequencyType = "variable";
            treatment.quantityUnit = "Capsule(s)";
            expect(treatment.getDescriptionWithQuantity()).toBe("Before Meals, 1(12 Capsule(s))");
        })

        it("should return drug form as quantity unit if mantissa is specified", function(){
            var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            treatment.uniformDosingType.dose = "0.5";
            treatment.doseUnits = "Tablet(s)";
            treatment.quantityUnit = "Capsule(s)";
            expect(treatment.getDescriptionWithQuantity()).toBe("0.5 Tablet(s), Before Meals, 1(12 Capsule(s))");
        })
    });

    describe("getDescriptionWithQuantity", function(){
        xit("should return 'Units' as quantity unit if drug form is not a tablet or a capsule", function(){
            var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            treatment.drug.form = "Inhaler";
            treatment.setDose(4);
            treatment.doseUnits = "Unit(s)";
            treatment.quantityUnit = "Unit(s)";
            expect(treatment.getDescriptionWithQuantity()).toBe("Before Meals, 1(12 Unit(s))");
        })
    });

    describe("changeDrug", function(){
        it("should set default dose units if units available in config", function(){
            treatmentConfig.inputOptionsConfig.drugFormDefaults = {"Ayurvedic" : {"doseUnits": "Teaspoon", "route": "Orally" }};
            var treatment = sampleTreatment(treatmentConfig, null, Bahmni.Common.Util.DateUtil.now());
            treatment.changeDrug({form : "Ayurvedic"});

            expect(treatment.doseUnits).toBe("Teaspoon");
            expect(treatment.route).toBe("Orally");
        });

        it("should not set dose units if units not available in config", function(){
            treatmentConfig.inputOptionsConfig.drugFormDefaults = {"Ayurvedic" : {"doseUnits": "ml", "route": "Mouth" }};
            var treatment = sampleTreatment(treatmentConfig, null, Bahmni.Common.Util.DateUtil.now());
            treatment.changeDrug({form : "Ayurvedic"});

            expect(treatment.doseUnits).toBe(undefined);
            expect(treatment.route).toBeUndefined();
        });

        it("should not fail when drugFormDefaults is not define for drug form", function(){
            treatmentConfig.inputOptionsConfig.drugFormDefaults = {"Ayurvedic" : {"doseUnits": "TeaSpoon", "route": "Mouth" }};
            var treatment = sampleTreatment({}, null, Bahmni.Common.Util.DateUtil.now());

            treatment.changeDrug({form : "Capsule"});

            expect(treatment.doseUnits).toBe(undefined);
            expect(treatment.route).toBe(undefined);
        })

        it("should not fail when app config does not have drugFormDefaults", function(){
            var treatment = sampleTreatment( {}, null, Bahmni.Common.Util.DateUtil.now());

            treatment.changeDrug({form : "Ayurvedic"});

            expect(treatment.doseUnits).toBe(undefined);
            expect(treatment.route).toBe(undefined);
        })

        it("should not fail when drug is cleared", function(){
            var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());

            treatment.changeDrug(null);

            expect(treatment.drug).toBe(null);
        })
    });
    describe("checkOverlappingSchedule", function () {
        it("should return true if self order and other order do not have effective stop date", function(){
            var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            var otherOrder = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            treatment.effectiveStopDate = null;
            otherOrder.effectiveStopDate = null;
            expect(treatment.overlappingScheduledWith(otherOrder)).toBeTruthy();
        })

        it("should return true if self order and other order have same start date", function(){
            var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            var otherOrder = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            treatment.effectiveStartDate = DateUtil.parse("11/1/2001");
            treatment.effectiveStopDate = DateUtil.parse("11/7/2001");
            otherOrder.effectiveStartDate = DateUtil.parse("11/1/2001");
            otherOrder.effectiveStopDate = DateUtil.parse("11/7/2001");
            expect(treatment.overlappingScheduledWith(otherOrder)).toBeTruthy();
        })

        it("should return false if self order ends before other order starts", function(){
            var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            var otherOrder = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            treatment.effectiveStartDate = DateUtil.parse("11/7/2001");
            treatment.effectiveStopDate = DateUtil.parse("11/9/2001");
            otherOrder.effectiveStartDate = DateUtil.parse("11/11/2001");
            expect(treatment.overlappingScheduledWith(otherOrder)).toBeFalsy();
        })

        it("should return false if self order starts after other Order", function(){
            var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            var otherOrder = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            treatment.effectiveStartDate = DateUtil.parse("11/15/2001");
            treatment.effectiveStopDate = DateUtil.parse("11/17/2001");
            otherOrder.effectiveStopDate = DateUtil.parse("11/14/2001");
            expect(treatment.overlappingScheduledWith(otherOrder)).toBeFalsy();
        })

        it("should return true if self order stops after the other order has already been activated", function(){
            var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            var otherOrder = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            treatment.effectiveStartDate = DateUtil.parse("11/09/2001");
            treatment.effectiveStopDate = DateUtil.parse("11/17/2001");
            otherOrder.effectiveStartDate = DateUtil.parse("11/11/2001");
            expect(treatment.overlappingScheduledWith(otherOrder)).toBeTruthy();
        })

        it("should return true if self order starts when the other order is active", function(){
            var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            var otherOrder = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            treatment.effectiveStartDate = DateUtil.parse("11/12/2001");
            otherOrder.effectiveStartDate = DateUtil.parse("11/10/2001");
            otherOrder.effectiveStopDate = DateUtil.parse("11/14/2001");
            expect(treatment.overlappingScheduledWith(otherOrder)).toBeTruthy();
        })

        it("should return true if self order starts before other order and ends after other order", function(){
            var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            var otherOrder = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            treatment.effectiveStartDate = DateUtil.parse("11/09/2001");
            treatment.effectiveStopDate = DateUtil.parse("11/17/2001");
            otherOrder.effectiveStartDate = DateUtil.parse("11/10/2001");
            otherOrder.effectiveStopDate = DateUtil.parse("11/14/2001");
            expect(treatment.overlappingScheduledWith(otherOrder)).toBeTruthy();
        })

        it("should return true if self order starts on the stop date of other order", function(){
            var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            var otherOrder = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            treatment.effectiveStartDate = DateUtil.parse("11/09/2001");
            treatment.effectiveStopDate = DateUtil.parse("11/14/2001");
            otherOrder.effectiveStartDate = DateUtil.parse("11/06/2001");
            otherOrder.effectiveStopDate = DateUtil.parse("11/09/2001");
            expect(treatment.overlappingScheduledWith(otherOrder)).toBeTruthy();
        })

        it("should return true if other order starts before self order and ends after self order", function(){
            var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            var otherOrder = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            treatment.effectiveStartDate = DateUtil.parse("11/09/2001");
            treatment.effectiveStopDate = DateUtil.parse("11/11/2001");
            otherOrder.effectiveStartDate = DateUtil.parse("11/06/2001");
            otherOrder.effectiveStopDate = DateUtil.parse("11/12/2001");
            expect(treatment.overlappingScheduledWith(otherOrder)).toBeTruthy();
        })

        it("should return true if self order ends on the start date of other order", function(){
            var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            var otherOrder = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            treatment.effectiveStartDate = DateUtil.parse("11/09/2001");
            treatment.effectiveStopDate = DateUtil.parse("11/11/2001");
            otherOrder.effectiveStartDate = DateUtil.parse("11/11/2001");
            otherOrder.effectiveStopDate = DateUtil.parse("11/14/2001");
            expect(treatment.overlappingScheduledWith(otherOrder)).toBeTruthy();
        })

        it("should return true if both orders start and end on same dates", function(){
            var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            var otherOrder = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            treatment.effectiveStartDate = DateUtil.parse("11/09/2001");
            treatment.effectiveStopDate = DateUtil.parse("11/11/2001");
            otherOrder.effectiveStartDate = DateUtil.parse("11/09/2001");
            otherOrder.effectiveStopDate = DateUtil.parse("11/11/2001");
            expect(treatment.overlappingScheduledWith(otherOrder)).toBeTruthy();
        })

    });

    describe("getSpanDetails", function(){
        it("should concatenate all span details by (+) and return as string", function(){
            var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            treatment.span = {
                "Day(s)": 2,
                "Week(s)": 3
            };
            expect(treatment.getSpanDetails()).toBe("- 2 Day(s) + 3 Week(s)");
        });

        it("should not concatenate if span details is only one.", function(){
            var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());
            treatment.span = {
                "Week(s)": 3
            };
            expect(treatment.getSpanDetails()).toBe("- 3 Week(s)");
        });

        it("should return empty string if there is no span for the drug", function(){
            var treatment = sampleTreatment({}, {}, null, Bahmni.Common.Util.DateUtil.now());

            expect(treatment.getSpanDetails()).toBe('');
        })
    })
});
