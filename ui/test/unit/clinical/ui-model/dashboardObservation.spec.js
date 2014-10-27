'use strict';

describe("DashboardObservation", function () {
    var DashboardObservation = Bahmni.Clinical.DashboardObservation;

    describe("display Value", function () {
        it("should return yes and no for Boolean observation", function () {
            var yesObservation = new DashboardObservation({"type": "Boolean", "value": true});
            expect(yesObservation.getDisplayValue()).toBe("Yes");
            var noObservation = new DashboardObservation({"type": "Boolean", "value": false});
            expect(noObservation.getDisplayValue()).toBe("No");
        });

        it("should return shortName if exists for coded observation", function () {
            var observation = new DashboardObservation({"type": "Coded", "value": {"shortName": "BP", "name": "Blood Pressure"}});
            expect(observation.getDisplayValue()).toBe("BP");
        });

        it("should return value for nonCoded observation", function () {
            var observation = new DashboardObservation({"type": "Numeric", "value": 1.0});
            expect(observation.getDisplayValue()).toBe(1.0);
        });

        it("should return duration is present for an observation", function () {
            var observation = new DashboardObservation({"type": "Numeric", "value": 1.0, "duration": 120});
            expect(observation.getDisplayValue()).toBe("1 since 2 Hours");
        });

        it("should return obs group value (comma separated values from the server side) for observation type grid", function () {
            var observation = new DashboardObservation({"type": "grid", "value": "ER-, PR+"});
            expect(observation.getDisplayValue()).toBe("ER-, PR+");
        });

        it("should return comma separated values for observation type multiSelect", function () {
            var observation = new DashboardObservation({"type": "multiSelect", groupMembers: [
                {"type": "Coded", "value": {"shortName": "Invasive Ductal Carcinoma", "name": "Invasive Ductal Carcinoma"}},
                {"type": "Coded", "value": {"shortName": "Invasive Lobular Carcinoma", "name": "Invasive Lobular Carcinoma"}}
            ]});
            expect(observation.getDisplayValue()).toBe("Invasive Ductal Carcinoma, Invasive Lobular Carcinoma");
        });

    })

});