'use strict';

describe("ConceptSetObservation", function() {
    it("should copy value from savedObs", function() {
        expect(new Bahmni.ConceptSet.Observation({concept: {name: "someConcept"}}, {value: "someValue"}, {}).value).toBe("someValue");
        expect(new Bahmni.ConceptSet.Observation({concept: {name: "someConcept"}}, null, {}).value).toEqual(undefined);
    })

    it("should return display value", function() {
        var obs = new Bahmni.ConceptSet.Observation({concept: {name: "someConcept"}, possibleAnswers: []}, {value: "UUID2"}, {}); 
        expect(obs.displayValue()).toEqual("UUID2");
    });

    it("should return display value for answer if coded", function() {
        var obs = new Bahmni.ConceptSet.Observation({
            concept: {name: "someConcept"},
            possibleAnswers: [{uuid: "UUID1", display: "ANSWER1"}, {uuid: "UUID2", display: "ANSWER2"}],
        }, {value: "UUID2"}, {});
        expect(obs.displayValue()).toEqual("ANSWER2");
    });

    it("should be group if group members are present", function() {
        expect(new Bahmni.ConceptSet.Observation({concept: {name: "someConcept"}, groupMembers: [{}]}, null, {}).isGroup()).toBeTruthy();
        expect(new Bahmni.ConceptSet.Observation({concept: {name: "someConcept"}, groupMembers: []}, null, {}).isGroup()).toBeFalsy();
        expect(new Bahmni.ConceptSet.Observation({concept: {name: "someConcept"}, groupMembers: null}, null, {}).isGroup()).toBeFalsy();
    });

    it("should be computed if concept class is computed", function() {
        expect(new Bahmni.ConceptSet.Observation({concept: {name: "someConcept", conceptClass: "Computed"}}, null, {}).isComputed()).toBeTruthy();
        expect(new Bahmni.ConceptSet.Observation({concept: {name: "someConcept", conceptClass: "NotComputed"}}, null, {}).isComputed()).toBeFalsy();
    });

    it("should be numeric if concept datatype is numeric", function() {
        expect(new Bahmni.ConceptSet.Observation({concept: {name: "someConcept", dataType: "Numeric"}}, null, {}).isNumeric()).toBeTruthy();
        expect(new Bahmni.ConceptSet.Observation({concept: {name: "someConcept", dataType: "text"}}, null, {}).isNumeric()).toBeFalsy();
    });
});
