'use strict';

describe("Observation", function () {
    var MultiSelectObservation = Bahmni.Common.Obs.MultiSelectObservation;

    describe("display Value", function () {

        it("should return comma separated values for observation type multiSelect", function () {
            var observation = new MultiSelectObservation([
                {"type": "Coded", "value": {"shortName": "Invasive Ductal Carcinoma", "name": "Invasive Ductal Carcinoma"}},
                {"type": "Coded", "value": {"shortName": "Invasive Lobular Carcinoma", "name": "Invasive Lobular Carcinoma"}}
            ], {});
            expect(observation.getDisplayValue()).toBe("Invasive Ductal Carcinoma, Invasive Lobular Carcinoma");
        });

    })

});