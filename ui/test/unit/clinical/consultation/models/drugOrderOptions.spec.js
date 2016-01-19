'use strict';

describe("DrugOrderOptions", function () {
    var masterConfig, inputConfig, model;
    beforeEach(function () {
        masterConfig = {
            "doseUnits": [{"name": "mg"}, {"name": "Tablet(s)"}],
            "routes": [{"name": "Oral"}, {"name": "Inhalation"}],
            "durationUnits": [{"name": "Day(s)"}, {"name": "Minute(s)"}],
            "dosingInstructions": [{"name": "Before meals"}, {"name": "As directed"}],
            "dispensingUnits": [{"name": "Tablet(s)"}, {"name": "Unit(s)"}],
            "frequencies": [
                {
                    "uuid": "ca407cb0-3a91-11e5-b380-0050568236ae",
                    "frequencyPerDay": 1,
                    "name": "Seven days a week"
                },
                {
                    "uuid": "18a35ec5-3a92-11e5-b380-0050568236ae",
                    "frequencyPerDay": 0.857142857,
                    "name": "Six days a week"
                }
            ]
        };

        inputConfig = {
            "conceptSetName": "All TB Drugs",
            "doseUnits": ["mg"],
            "frequencies": ["Seven days a week"],
            "routes": ["Oral"],
            "hiddenFields": ["doseUnits", "frequencies"]
        };

        model = new Bahmni.Clinical.DrugOrderOptions(inputConfig, masterConfig);
    });

    it('should initialise fields from config', function () {
        expect(model.hiddenFields.length).toBe(2);
    });

    it("picks the dose units that are configured from all dose units", function () {
        var doseUnits = model.doseUnits;
        expect(doseUnits.length).toBe(1);
        expect(doseUnits).toContain({"name": "mg"});
    });

    it("picks the routes that are configured from all routes", function () {
        var routes = model.routes;
        expect(routes.length).toBe(1);
        expect(routes).toContain({"name": "Oral"});
    });

    it("picks the frequencies that are configured from all frequencies", function () {
        var frequencies = model.frequencies;
        expect(frequencies.length).toBe(1);
        expect(frequencies).toContain({
            "uuid": "ca407cb0-3a91-11e5-b380-0050568236ae",
            "frequencyPerDay": 1,
            "name": "Seven days a week"
        });
    });

    it("should use masterConfig as input configuration when fields missing in inputConfig", function () {
        inputConfig.doseUnits = null;
        model = new Bahmni.Clinical.DrugOrderOptions(inputConfig, masterConfig);

        expect(model.doseUnits.length).toBe(2);
    });
});