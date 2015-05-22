'use strict';

describe("Previous Encounter Observation", function() {
    it("control type should be readonly", function() {
        var obs = new Bahmni.ConceptSet.PreviousEncounterObservation({}, {allowAddMore: true});
        expect(obs.getControlType()).toBe("readOnly");
    });
    it("")
});
