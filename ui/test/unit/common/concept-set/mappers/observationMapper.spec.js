'use strict';

describe("ConceptSetObservationMapper", function() {
    var buildConcept = function(name, setMembers, answers, classname, datatype) {
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
    var savedObs = function() {
        var diabetesConcept = buildConcept("Diabetes", [], []);
        var hivConcept = buildConcept("HIV", [], []);
        var hyperTensionConcept = buildConcept("HyperTension", [], []);
        var comorbidityConcept = buildConcept("Comorbidity", [], [diabetesConcept, hivConcept, hyperTensionConcept]);

        var systolicConcept = buildConcept("Systolic", [], []);
        var vitalsConcept = buildConcept("Vitals", [systolicConcept, comorbidityConcept], []);
        return [{
            "concept": vitalsConcept,
            "label": "Vitals",
            "possibleAnswers": [],
            "groupMembers": [{
                "concept": systolicConcept,
                "label": "Systolic",
                "groupMembers": [],
                "value": "90",
                "voided": false
            },{
                "concept": comorbidityConcept,
                "label": "Comorbidity",
                "groupMembers": [],
                "value": diabetesConcept,
                "voided": false
            },{
                "concept": comorbidityConcept,
                "label": "Comorbidity",
                "groupMembers": [],
                "value": hyperTensionConcept,
                "voided": false
            }],
            "comment": null,
            "voided": false
        }];
    }

    it("should map observation tree", function() {
        var rootConcept = savedObs()[0].concept;
        var mapper = new Bahmni.ConceptSet.ObservationMapper();
        var mappedObs = mapper.map(savedObs(), rootConcept, {});

        expect(mappedObs.label).toEqual("Vitals");
        expect(mappedObs.groupMembers[0].label).toEqual("Systolic");
    });

    it("should map multiSelect Obs", function() {
        var rootConcept = savedObs()[0].concept;
        var mapper = new Bahmni.ConceptSet.ObservationMapper();
        var mappedObs = mapper.map(savedObs(), rootConcept, {"Comorbidity": {multiSelect: true}});

        expect(mappedObs.groupMembers.length).toBe(4);
        expect(mappedObs.groupMembers[1].label).toEqual("Comorbidity");
        expect(mappedObs.groupMembers[1]).toEqual(jasmine.any(Bahmni.ConceptSet.MultiSelectObservation));
        expect(mappedObs.groupMembers[2].hidden).toBeTruthy();
        expect(mappedObs.groupMembers[3].hidden).toBeTruthy();
    });

    it("should map ObservationNode", function() {
        var headache = buildConcept("Headache", [], []);
        var chiefComplaint = buildConcept("Chief Complaint", [], [], "Misc", "Coded");
        var duration = buildConcept("Chief Complaint Duration", [], [], "Duration", "Numeric");
        var chiefComplaintData = buildConcept("Chief Complaint Data", [chiefComplaint, duration], [], "Concept Details");

        var obs = [{
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

        var rootConcept = obs[0].concept;
        var mapper = new Bahmni.ConceptSet.ObservationMapper();
        var mappedObs = mapper.map(obs, rootConcept);

        expect(mappedObs.groupMembers.length).toBe(2);
        expect(mappedObs).toEqual(jasmine.any(Bahmni.ConceptSet.ObservationNode));
        expect(mappedObs.value).toEqual(headache.name);
    })
});
