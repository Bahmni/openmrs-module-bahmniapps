'use strict';

describe("Observation Graph Model", function () {
    it("should create a model out of data coming from the service and the config | one observation against dateTime", function () {
        var obsServiceValues = [{
            observationDateTime: "2015-01-01",
            value: 45,
            concept: {name: "Temperature", units: "Celsius"}
        }];

        var config = new Bahmni.Clinical.ObservationGraphConfig({
            "yAxisConcepts": ["Temperature"],
            "xAxisConcept": "observationDateTime",
            "numberOfVisits": 3
        });

        var observationGraph = Bahmni.Clinical.ObservationGraph.create(obsServiceValues, null, config);

        expect(observationGraph[0].name).toBe("Temperature");
        expect(observationGraph[0].units).toBe("Celsius");

        expect(observationGraph[0].values.length).toBe(1);
        expect(observationGraph[0].values[0].observationDateTime).toBeDefined();
        expect(observationGraph[0].values[0].Temperature).toBe(45);
        expect(observationGraph[0].values[0].units).toBe("Celsius");

        expect(observationGraph[0].values[0].age).toBeUndefined();
    });

    it("should create a model out of data coming from the service and the config | one observation against age", function () {
        var obsServiceValues = [{
            observationDateTime: "2015-01-01",
            value: 45,
            concept: {name: "Temperature", units: "Celsius"}
        }];

        var config = new Bahmni.Clinical.ObservationGraphConfig({
            "yAxisConcepts": ["Temperature"],
            "xAxisConcept": "age",
            "numberOfVisits": 3
        });

        var observationGraph = Bahmni.Clinical.ObservationGraph.create(obsServiceValues, {birthdate:"2000-01-01"}, config);

        expect(observationGraph[0].name).toBe("Temperature");
        expect(observationGraph[0].units).toBe("Celsius");

        expect(observationGraph[0].values.length).toBe(1);
        expect(observationGraph[0].values[0].age).toBe('15.0');
        expect(observationGraph[0].values[0].Temperature).toBe(45);
        expect(observationGraph[0].values[0].units).toBe("Celsius");

        expect(observationGraph[0].values[0].observationDateTime).toBeUndefined();
    });

    it("should create a model out of data coming from the service and the config | two observations against dateTime", function () {
        var obsServiceValues = [{
            observationDateTime: "2015-01-01",
            value: 45,
            concept: {name: "Temperature", units: "Celsius"}
        },{
            observationDateTime: "2015-02-03",
            value: 80,
            concept: {name: "Weight", units: "kg"}
        }];

        var config = new Bahmni.Clinical.ObservationGraphConfig({
            "yAxisConcepts": ["Temperature","Weight"],
            "xAxisConcept": "observationDateTime",
            "numberOfVisits": 3
        });

        var observationGraph = Bahmni.Clinical.ObservationGraph.create(obsServiceValues, null, config);

        expect(observationGraph[0].name).toBe("Temperature");
        expect(observationGraph[0].units).toBe("Celsius");
        expect(observationGraph[0].values.length).toBe(1);

        expect(observationGraph[0].values[0].observationDateTime).toBeDefined();
        expect(observationGraph[0].values[0].Temperature).toBe(45);
        expect(observationGraph[0].values[0].units).toBe("Celsius");
        expect(observationGraph[0].values[0].age).toBeUndefined();

        expect(observationGraph[1].name).toBe("Weight");
        expect(observationGraph[1].units).toBe("kg");
        expect(observationGraph[1].values.length).toBe(1);

        expect(observationGraph[1].values[0].observationDateTime).toBeDefined();
        expect(observationGraph[1].values[0].Weight).toBe(80);
        expect(observationGraph[1].values[0].units).toBe("kg");
        expect(observationGraph[1].values[0].age).toBeUndefined();
    });

    it("the model should be undefined if the observationsValues is empty", function(){
        var observationGraph = Bahmni.Clinical.ObservationGraph.create([], null, null);
        expect(observationGraph).toBeUndefined();
    });
});