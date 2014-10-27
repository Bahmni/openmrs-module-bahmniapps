'use strict';

describe("Observation", function () {
    var GridObservation = Bahmni.Common.Obs.GridObservation;

    describe("display Value", function () {
        it("should return obs group value (comma separated values from the server side) for observation type grid", function () {
            var observation = new GridObservation({"type": "grid", "value": "ER-, PR+"});
            expect(observation.getDisplayValue()).toBe("ER-, PR+");
        });
    })

});