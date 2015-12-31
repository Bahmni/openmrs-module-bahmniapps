'use strict';

describe("DrugOrderOptions", function () {
    var masterConfig, listOfDrugs, inputConfig, model;
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

        inputConfig = {
            "conceptSetName": "All TB Drugs",
            "doseUnits": ["mg"],
            "frequencies" :["Seven days a week"],
            "routes" : ["Oral"],
            "hideFields": ["doseUnits", "frequencies"]
        };

        model = new Bahmni.Clinical.DrugOrderOptions(inputConfig, listOfDrugs, masterConfig);
    });

    describe("doseUnits", function() {
        it("provides filtered dose units when a drug matches the list of drugs provided during initialization", function() {
            var doseUnits = model.getDoseUnits({name: "K"});
            expect(doseUnits.length).toBe(1);
            expect(doseUnits).toContain({"name": "mg"});
        });

        it("returns null if drug does not match list of drugs provided during initialization", function() {
            var doseUnits = model.getDoseUnits({name: "non existing drug"});
            expect(doseUnits).toBeNull();
        });

        it("returns all dose units if no drugs specified during construction", function() {
            model = new Bahmni.Clinical.DrugOrderOptions(inputConfig, [], masterConfig);
            var doseUnits = model.getDoseUnits();
            expect(doseUnits.length).toBe(1);
            expect(doseUnits).toContain({"name": "mg"});
        });

        it("returns null if no drugs passed in", function() {
            expect(model.getDoseUnits()).toBeNull();
        });
    });

    describe("routes", function () {
        it("provides filtered routes when a drug matches the list of drugs provided during initialization", function() {
            var routes = model.getRoutes({name: "K"});
            expect(routes.length).toBe(1);
            expect(routes).toContain({"name": "Oral"});
        });

        it("returns null if drug does not match list of drugs provided during initialization", function() {
            var routes = model.getRoutes({name: "non existing drug"});
            expect(routes).toBeNull();
        });

        it("returns all routes if drug does not match list of drugs provided during initialization", function() {
            model = new Bahmni.Clinical.DrugOrderOptions(inputConfig, [], masterConfig);
            var routes = model.getRoutes();
            expect(routes.length).toBe(1);
            expect(routes).toContain({"name": "Oral"});

        });
    });

    describe('frequencies', function (){
        it("provides filtered frequencies when a drug matches the list of drugs provided during initialization", function() {
            var frequencies = model.getFrequencies({name: "K"});
            expect(frequencies.length).toBe(1);
            expect(frequencies).toContain({ "uuid": "ca407cb0-3a91-11e5-b380-0050568236ae", "frequencyPerDay": 1, "name": "Seven days a week"});
        });

        it("returns null if drug does not match list of drugs provided during initialization", function() {
            var frequencies = model.getFrequencies({name: "non existing drug"});
            expect(frequencies).toBeNull();
        });

        it("returns all frequencies if drug does not match list of drugs provided during initialization", function() {
            model = new Bahmni.Clinical.DrugOrderOptions(inputConfig, [], masterConfig);
            var frequencies = model.getFrequencies();
            expect(frequencies.length).toBe(1);
            expect(frequencies).toContain({ "uuid": "ca407cb0-3a91-11e5-b380-0050568236ae", "frequencyPerDay": 1, "name": "Seven days a week"});
        });

    });
    
    it("should hidden elements on UI mentioned in inputConfig", function () {
        expect(model.showField({name: "K"}, 'doseUnits')).toBe(false);
        expect(model.showField({name: "K"}, 'durationUnits')).toBe(true);
        expect(model.showField({name: "nonexistentDrug"}, 'durationUnits')).toBeNull();

        inputConfig.hideFields = null;
        model = new Bahmni.Clinical.DrugOrderOptions(inputConfig, listOfDrugs, masterConfig);
        expect(model.showField({name: "K"}, 'doseUnits')).toBe(true);
    });

    it("should use masterConfig as input configuration when inputConfig not provided", function() {
        model = new Bahmni.Clinical.DrugOrderOptions(null, listOfDrugs, masterConfig);

        expect(model.getDoseUnits({name: "K"}).length).toBe(2);
        expect(model.getRoutes({name: "K"}).length).toBe(2);
        expect(model.getDurationUnits({name: "K"}).length).toBe(2);
        expect(model.getDosingInstructions({name: "K"}).length).toBe(2);
        expect(model.getDispensingUnits({name: "K"}).length).toBe(2);
        expect(model.getFrequencies({name: "K"}).length).toBe(2);
    });

    it("should use masterConfig as input configuration when fields missing in inputConfig", function() {
        inputConfig.doseUnits = null;
        model = new Bahmni.Clinical.DrugOrderOptions(inputConfig, listOfDrugs, masterConfig);

        expect(model.getDoseUnits({name: "K"}).length).toBe(2);
    });
});