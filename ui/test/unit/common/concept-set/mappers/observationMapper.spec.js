'use strict';

describe("ConceptSetObservationMapper", function() {
    var buildConcept = function(name, setMembers, answers) {
        return {
            "name": {name: name},
            "set": setMembers && setMembers.length > 0,
            conceptClass: {name: "N/A"},
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
});
