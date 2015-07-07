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
        expect(observationGraph[0].values[0].age).toBe(180);
        expect(observationGraph[0].values[0].Temperature).toBe(45);

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
        expect(observationGraph[0].values[0].age).toBeUndefined();

        expect(observationGraph[1].name).toBe("Weight");
        expect(observationGraph[1].units).toBe("kg");
        expect(observationGraph[1].values.length).toBe(1);

        expect(observationGraph[1].values[0].observationDateTime).toBeDefined();
        expect(observationGraph[1].values[0].Weight).toBe(80);
        expect(observationGraph[1].values[0].age).toBeUndefined();
    });

    it("should create model for growth chart", function() {
        var obsServiceValues = [{
            observationDateTime: "2015-01-01",
            value: 3.4,
            concept: {name: "Weight", units: "Kg"}
        }];
        var config = new Bahmni.Clinical.ObservationGraphConfig({
            "xAxisConcept": "Age",
            "yAxisConcepts": ["Weight"],
            "growthChart": {
                "referenceData": "growthChartReference.csv"
            },
            "numberOfVisits": 20
        });
        var person = {birthdate: new Date()};
        var observationGraphReferenceObsModel = [
            {
                name: "3rd",
                units: "Kg",
                values: [{"3rd": 3.3, Age: 4}]
            }
        ];
        var observationGraph = Bahmni.Clinical.ObservationGraph.create(obsServiceValues, person, config, observationGraphReferenceObsModel);

        expect(observationGraph[0].name).toBe("Weight");
        expect(observationGraph[0].units).toBe("Kg");
        expect(observationGraph[0].values.length).toBe(1);
        expect(observationGraph[0].values[0].Weight).toBe(3.4);
        expect(observationGraph[0].values[0].Age).toBeDefined();

        expect(observationGraph[1].name).toBe("3rd");
        expect(observationGraph[1].units).toBe("Kg");
        expect(observationGraph[1].values.length).toBe(1);
        expect(observationGraph[1].values[0]['3rd']).toBe(3.3);
        expect(observationGraph[1].values[0].Age).toBeDefined();
    });

    it("should create model without taking concept name text case (Uppercase/Lowercase) into account", function() {
        var obsServiceValues = [{
            observationDateTime: "2015-02-03",
            value: 80,
            concept: {name: "WEIGHT", units: "kg"}
        }];

        var config = new Bahmni.Clinical.ObservationGraphConfig({
            "yAxisConcepts": ["Weight"],
            "xAxisConcept": "observationDateTime",
            "numberOfVisits": 3
        });

        var observationGraph = Bahmni.Clinical.ObservationGraph.create(obsServiceValues, null, config);

        expect(observationGraph[0].name).toBe("Weight");
        expect(observationGraph[0].units).toBe("kg");
        expect(observationGraph[0].values.length).toBe(1);
    });
});