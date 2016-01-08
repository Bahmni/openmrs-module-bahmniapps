'use strict';
describe("DrugOrderOptionsSet", function () {
    var masterConfig, listOfDrugsForAnInputCOnfig,listOfDrugsForAnotherInputCOnfig,
        anInputConfig, anotherInputConfig, drugOrderOptions = [], model;
    beforeEach(function() {
        masterConfig = {
            "doseUnits": [{"name": "mg"}, {"name": "Tablet(s)"}],
            "routes": [{"name": "Oral"}, {"name": "Inhalation"}],
            "durationUnits": [{"name": "Day(s)"}, {"name": "Minute(s)"}],
            "dosingInstructions": [{"name": "Before meals"}, {"name": "As directed"}],
            "dispensingUnits": [{"name": "Tablet(s)"}, {"name": "Unit(s)"}],
            "frequencies": [
                { "uuid": "ca407cb0-3a91-11e5-b380-0050568236ae", "frequencyPerDay": 1, "name": "Seven days a week"},
                { "uuid": "18a35ec5-3a92-11e5-b380-0050568236ae", "frequencyPerDay": 0.857142857, "name": "Six days a week"}
            ]
        };
        listOfDrugsForAnInputCOnfig = [
            {name: "K"},
            {name: "T"}
        ];
        listOfDrugsForAnotherInputCOnfig = [
            {name: "L"}
        ];

        anInputConfig = {
            "conceptSetName": "All TB Drugs",
            "doseUnits": ["mg"],
            "frequencies" :["Seven days a week"],
            "routes" : ["Oral"],
            "disableFields": ["doseUnits", "frequencies"]
        };

        anotherInputConfig = {
            "conceptSetName": "All NonTB Drugs",
            "doseUnits": ["Tablet(s)"],
            "disableFields": ["frequencies"]
        };

        drugOrderOptions.push(new Bahmni.Clinical.DrugOrderOptions(anInputConfig, listOfDrugsForAnInputCOnfig, masterConfig));
        drugOrderOptions.push(new Bahmni.Clinical.DrugOrderOptions(anotherInputConfig,listOfDrugsForAnotherInputCOnfig , masterConfig));
        model = new Bahmni.Clinical.DrugOrderOptionsSet(drugOrderOptions, masterConfig);
    });

    describe("doseUnits", function() {
        it("will search for doseUnits in all drugOrderOptions object", function() {
            var doseUnits = model.getDoseUnits({name: "K"});
            expect(doseUnits.length).toBe(1);
        });

        it("will search for doseUnits in masterConfig when none of the existing options match", function() {
            var doseUnits = model.getDoseUnits({name: "non existant drug"});
            expect(doseUnits.length).toBe(2);
        });

        it("will search for doseUnits in masterConfig if inputConfiguration is missing", function() {
            model = new Bahmni.Clinical.DrugOrderOptionsSet(null, masterConfig);
            var doseUnits = model.getDoseUnits({name: "non existant drug"});
            expect(doseUnits.length).toBe(2);
        });
    });

    describe("disableField", function() {
        it("returns true if field set as disabled", function() {
            expect(model.disableField({name: "K"}, "doseUnits")).toBe(true);
            expect(model.disableField({name: "L"}, "doseUnits")).toBe(false);
            expect(model.disableField({name: "L"}, "frequencies")).toBe(true);
        });

        it("returns false if field not set as disabled", function() {
            expect(model.disableField({name: "K"}, "fieldNotPresentInHideList")).toBe(false);
        });

        it("returns false if drug not present in any config", function() {
            expect(model.disableField({name: "nonExistentDrug"}, "doseUnits")).toBe(false);
        });

        it("returns false if drug is null", function() {
            expect(model.disableField(null, "doseUnits")).toBe(false);
        });
    });
});