describe('Observation Graph Reference', function () {
    'use strict';
    var csvString, config, gender, ageInMonths;

    beforeEach(function () {
        csvString = "Gender,Age,3rd,10th\nM,01,2.3,2.7\nM,02,3.4,3.7";
        config = {
            "yAxisConcepts": ["Height"],
            "referenceData": "heightReference.csv",
            "numberOfVisits": 20
        };
        gender = "M";
        ageInMonths = 10;
    });

    it("converts the csv into an ObservationGraph", function() {
        var observationGraph = new Bahmni.Clinical.ObservationGraphReference(csvString, config, gender, ageInMonths).createObservationGraphReferenceLines();
        expect(observationGraph[0].name).toBe("3rd");
        expect(observationGraph[1].name).toBe("10th");
        expect(observationGraph[0].values.length).toBe(2);
        expect(observationGraph[1].values.length).toBe(2);

        expect(observationGraph[0].values[0]["3rd"]).toBe("2.3");
        expect(observationGraph[0].values[0]["Age"]).toBe("01");
        expect(observationGraph[0].values[1]["3rd"]).toBe("3.4");
        expect(observationGraph[0].values[1]["Age"]).toBe("02");

        expect(observationGraph[1].values[0]["10th"]).toBe("2.7");
        expect(observationGraph[1].values[0]["Age"]).toBe("01");
        expect(observationGraph[1].values[1]["10th"]).toBe("3.7");
        expect(observationGraph[1].values[1]["Age"]).toBe("02");
    });

    it("should filter rows by matching the person's gender and age", function() {
        csvString = "Gender,Age,3rd,10th\nM,01,2.3,2.7\nM,11,3.8,4.8\nM,14,3.9,4.0\nF,02,3.4,3.7\nF,11,4.3,4.7\nF,14,5.3,5.7";

        var observationGraph = new Bahmni.Clinical.ObservationGraphReference(csvString, config, gender, ageInMonths).createObservationGraphReferenceLines();
        expect(observationGraph[0].name).toBe("3rd");
        expect(observationGraph[0].values.length).toBe(2);
        expect(observationGraph[0].values[0]["3rd"]).toBe("2.3");
        expect(observationGraph[0].values[1]["3rd"]).toBe("3.8");

        gender="F";
        observationGraph = new Bahmni.Clinical.ObservationGraphReference(csvString, config, gender, ageInMonths).createObservationGraphReferenceLines();
        expect(observationGraph[1].name).toBe("10th");
        expect(observationGraph[1].values.length).toBe(2);
        expect(observationGraph[1].values[0]["10th"]).toBe("3.7");
        expect(observationGraph[1].values[1]["10th"]).toBe("4.7");
    });

    it("should exclude age and y-axis concept header", function(){
        var observationGraph = new Bahmni.Clinical.ObservationGraphReference(csvString, config, gender, ageInMonths).createObservationGraphReferenceLines();
        expect(observationGraph.length).toBe(2);
        expect(observationGraph[0].name).toBe("3rd");
        expect(observationGraph[0].reference).toBe(true);
        expect(observationGraph[1].name).toBe("10th");
        expect(observationGraph[1].reference).toBe(true);
    })
});