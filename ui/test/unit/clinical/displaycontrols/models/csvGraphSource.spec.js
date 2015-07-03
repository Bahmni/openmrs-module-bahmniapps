ddescribe('CSV Graph Source', function () {
    'use strict';
    var csvString, config, person;

    beforeEach(function () {
        csvString = "Gender,Age,3rd,10th\nM,01,2.3,2.7\nM,02,3.4,3.7";
        config =
        {
            "yAxisConcepts": ["Height"],
            "xAxisConcept": "Age",
            "referenceData": {
                source: "heightReference.csv",
                filterRows: ["Gender"]
            },
            "numberOfVisits": 20
        };
        person = {gender: "M"};
    });

    it("creates an ObservationGraph out of a csv", function () {
        new Bahmni.Clinical.CsvGraphSource(csvString, config, person).createObservationGraph();
    });

    it("fails if there are multiple y axis concepts", function () {
        config.yAxisConcepts = ["Height","Weight"];
        var creatingWithMultipleYAxes = function() {
            new Bahmni.Clinical.CsvGraphSource(csvString, config, person);
        };

        expect(creatingWithMultipleYAxes).toThrow();
    });

    it("converts the csv into an ObservationGraph", function() {
        var observationGraph = new Bahmni.Clinical.CsvGraphSource(csvString, config, person).createObservationGraph();
        expect(observationGraph[0].name).toBe("3rd");
        expect(observationGraph[1].name).toBe("10th");
        expect(observationGraph[0].values.length).toBe(2);
        expect(observationGraph[1].values.length).toBe(2);
        expect(observationGraph[0].values[0].Height).toBe("2.3");
        expect(observationGraph[0].values[1].Height).toBe("3.4");
        expect(observationGraph[1].values[0].Height).toBe("2.7");
        expect(observationGraph[1].values[1].Height).toBe("3.7");
    });

    it("converts the csv into an ObservationGraph", function() {
        csvString = "Gender,Age,3rd,10th\nM,01,2.3,2.7\nF,02,3.4,3.7";

        var observationGraph = new Bahmni.Clinical.CsvGraphSource(csvString, config, person).createObservationGraph();
        expect(observationGraph[0].name).toBe("3rd");
        expect(observationGraph[0].values.length).toBe(1);
        expect(observationGraph[0].values[0].Height).toBe("2.3");
    });
});