'use strict';
describe("DrugOrderOptionsSet", function () {
    var masterConfig, listOfDrugs, firstInputConfiguration, secondInputConfiguration, drugOrderOptions = [], model;
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
        listOfDrugs = [
            {name: "K"},
            {name: "T"}
        ];

        firstInputConfiguration = {
            "conceptSetName": "All TB Drugs",
            "doseUnits": ["mg"],
            "frequencies" :["Seven days a week"],
            "routes" : ["Oral"]
        };
        secondInputConfiguration = {
            "conceptSetName": "All TB Drugs",
            "doseUnits": ["mg"],
            "frequencies" :["Seven days a week"],
            "routes" : ["Oral"]
        };

        drugOrderOptions.push(new Bahmni.Clinical.DrugOrderOptions(firstInputConfiguration, listOfDrugs, masterConfig));
        drugOrderOptions.push(new Bahmni.Clinical.DrugOrderOptions(secondInputConfiguration, listOfDrugs, masterConfig));
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
        })
    });
});