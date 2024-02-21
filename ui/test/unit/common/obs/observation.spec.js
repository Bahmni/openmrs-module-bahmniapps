'use strict';

describe("Observation", function () {
    var conceptGroupFormatService;
    beforeEach(function () {
        conceptGroupFormatService = jasmine.createSpyObj('conceptGroupFormatService', ['isObsGroupFormatted', 'groupObs']);
        conceptGroupFormatService.isObsGroupFormatted.and.returnValue(false);
    });
    var Observation = Bahmni.Common.Obs.Observation;

    describe("display Value", function () {
        it("should return yes and no for Boolean observation", function () {
            var yesObservation = new Observation({"type": "Boolean", "value": true});
            expect(yesObservation.getDisplayValue()).toBe("OBS_BOOLEAN_YES_KEY");
            var noObservation = new Observation({"type": "Boolean", "value": false});
            expect(noObservation.getDisplayValue()).toBe("OBS_BOOLEAN_NO_KEY");
        });
        it("should return translation keys for yes and no for Boolean observation", function(){
           var yesObservation = new Observation({"concept": {name : "booleanConcept", "dataType": "Boolean"}, "value" : true});
           expect(yesObservation.getDisplayValue()).toBe("OBS_BOOLEAN_YES_KEY");
            var noObservation = new Observation({"concept": {name : "booleanConcept", "dataType": "Boolean"}, "value" : false});
            expect(noObservation.getDisplayValue()).toBe("OBS_BOOLEAN_NO_KEY");
        });

        it("should return shortName if exists for coded observation", function () {
            var observation = new Observation({"type": "Coded", "groupMembers": [], "value": {"shortName": "BP", "name": "Blood Pressure"}, concept: {conceptClass: 'Text'}});
            expect(observation.getDisplayValue()).toBe("BP");
        });

        it("should return value for nonCoded observation", function () {
            var observation = new Observation({"type": "Numeric", "groupMembers": [], "value": 1.0, concept: {conceptClass: 'Text'}});
            expect(observation.getDisplayValue()).toBe(1.0);
        });

        it("should return duration if present for an observation", function () {
            var observation = new Observation({"type": "Numeric", "groupMembers": [], "value": 1.0, "duration": 120, concept: {conceptClass: 'Text'}});
            expect(observation.getDisplayValue()).toBe("1 since 2 Hours");
        });

        it("should return datetime in specific format", function () {
            var observation = new Observation({"type": "Datetime", "value": "2014-12-05 17:00:00"});
            expect(observation.getDisplayValue()).toBe("05 Dec 2014 5:00 pm");
        });

        it("should return empty if value is null", function () {
            var observation = new Observation({"type": "Datetime", "value": ""});
            expect(observation.getDisplayValue()).toBe("");
            observation = new Observation({"type": "Date", "value": ""});
            expect(observation.getDisplayValue()).toBe("");
        });

        it("should format date to bahmniDate  if value is of type date", function () {
            var observation = new Observation({"type": "Date", "value": "2012-12-10"});
            expect(observation.getDisplayValue()).toBe("10 Dec 2012");
        });
        it("should format date in months and years if config is set to display in months and years", function(){
            var observation = new Observation({"type": "Date", "value": "2012-12-10"},{"displayMonthAndYear": true});
            expect((observation.getDisplayValue())).toBe("Dec 2012");
        });
        it("should format date in text to months and years if config is set to display in months and years", function(){
            var observation = new Observation({"type": "text", "value": "2012-12-10"},{"displayMonthAndYear": true});
            expect((observation.getDisplayValue())).toBe("Dec 2012");
        });
    });


    describe("is Image Concept", function(){
        it("should return concept is image", function(){
            var observation = new Observation({"type": "Text", "value": 'imageUrl1', concept: {conceptClass: 'Image'}});
            expect(observation.isImageConcept()).toBeTruthy();
        });
    });
});