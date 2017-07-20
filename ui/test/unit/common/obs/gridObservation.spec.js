'use strict';

describe("Observation", function () {
    var GridObservation = Bahmni.Common.Obs.GridObservation;

    describe("display Value", function () {
        it("should return obs group value (comma separated values from the server side) for observation type grid", function () {
            var observation = new GridObservation({"type": "grid", "value": "ER-, PR+"});
            expect(observation.isFormElement()).toBeTruthy();
            expect(observation.getDisplayValue()).toBe("ER-, PR+");
        });

        it("should return Yes or No translation keys for boolean values", function() {
            var obs = {
                groupMembers: [
                    {isBoolean: true, value: true},
                    {isBoolean: true, value: false},
                    {isBoolean: true, value: true}
                ]
            }
            var observation = new GridObservation(obs, {});
            expect(observation.getDisplayValue()).toBe("OBS_BOOLEAN_YES_KEY, OBS_BOOLEAN_NO_KEY, OBS_BOOLEAN_YES_KEY");
        });

        it("should return concept short name or name if value is of type object", function() {
            var obs = {
                groupMembers: [
                    {value: {name: {name: "Concept One"}, names: [{name: "C1", conceptNameType: "SHORT"}]}},
                    {value: {name: {name: "Concept Two"}, names: []}},
                    {isBoolean: true, value: false},
                ]
            }
            var observation = new GridObservation(obs, {});
            expect(observation.getDisplayValue()).toBe("C1, Concept Two, OBS_BOOLEAN_NO_KEY");
        });

        it("should return value shortname or name or just value", function() {
            var obs = {
                groupMembers: [
                    {value: {name: "Concept One", shortName: "C1"}},
                    {value: 10},
                    {isBoolean: true, value: false},
                ]
            }
            var observation = new GridObservation(obs, {});
            expect(observation.getDisplayValue()).toBe("C1, 10, OBS_BOOLEAN_NO_KEY");
        });

        it("should return empty if no value", function() {
            var obs = {
                groupMembers: [
                    {},
                    {value: 10},
                    {isBoolean: true, value: false},
                ]
            }
            var observation = new GridObservation(obs, {});
            expect(observation.getDisplayValue()).toBe("10, OBS_BOOLEAN_NO_KEY");
        });
    })

});