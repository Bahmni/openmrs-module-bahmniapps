'use strict';

describe("Observation Graph Model", function () {
    it("should create a model out of data coming from the service and the config", function () {
        var obsServiceValues = [{
            observationDateTime: "2015-01-01",
            value: 45,
            concept: {name: "Temperature", units: "Celcius"}
        }];

        var config = new Bahmni.Clinical.ObservationGraphConfig({
            "yAxisConcepts": ["Temperature"],
            "xAxisConcept": "observationDateTime",
            "numberOfVisits": 3
        });

        var observationGraph = Bahmni.Clinical.ObservationGraph.create(obsServiceValues, null, config);
    });
});