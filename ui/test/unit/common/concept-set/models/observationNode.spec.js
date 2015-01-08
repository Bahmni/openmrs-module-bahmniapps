'use strict';

describe("ObservationNode", function() {
    describe("getControlType", function() {
        var savedObs = createSavedObs();
        var rootConcept = savedObs[0].concept;
        var mapper = new Bahmni.ConceptSet.ObservationMapper();

        it("should return freeTextAutocomplete if configured", function() {
            var obsNode = mapper.map(savedObs, rootConcept, {"Chief Complaint": {freeTextAutocomplete: true}});
            expect(obsNode.getControlType()).toBe("freeTextAutocomplete");
        });

        it("should return autocomplete if configured", function() {
            var obsNode = mapper.map(savedObs, rootConcept, {"Chief Complaint": {autocomplete: true}});
            expect(obsNode.getControlType()).toBe("autocomplete");
        });
    })

    function buildConcept(name, setMembers, answers, classname, datatype) {
        return {
            "name": {name: name},
            "set": setMembers && setMembers.length > 0,
            conceptClass: {name: classname || "N/A"},
            dataType: datatype || "Text",
            setMembers: setMembers,
            answers: answers,
            "uuid": name + "_uuid"
        }
    }

    function createSavedObs() {
        var headache = buildConcept("Headache", [], []);
        var chiefComplaint = buildConcept("Chief Complaint", [], [], "Misc", "Coded");
        var duration = buildConcept("Chief Complaint Duration", [], [], "Duration", "Numeric");
        var chiefComplaintData = buildConcept("Chief Complaint Data", [chiefComplaint, duration], [], "Concept Details");

        return [{
            "concept": chiefComplaintData,
            "label": "Chief Complaint Data",
            "groupMembers": [{
                "concept": chiefComplaint,
                "label": "Chief Complaint",
                "groupMembers": [],
                "value": headache,
                "voided": false
            },{
                "concept": duration,
                "label": "Duration",
                "groupMembers": [],
                "value": 30,
                "voided": false
            }],
            "comment": null,
            "voided": false
        }];

    }
});
