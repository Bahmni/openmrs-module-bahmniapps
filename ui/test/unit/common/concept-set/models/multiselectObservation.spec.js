'use strict';

describe("Multiselect Observation", function() {
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
    var diabetesConcept = buildConcept("Diabetes", [], []);
    var hyperTensionConcept = buildConcept("HyperTension", [], []);
    var hivConcept = buildConcept("HIV", [], []);
    var comorbidityConcept = buildConcept("Comorbidity", [], [diabetesConcept, hivConcept, hyperTensionConcept]);
    var systolicConcept = buildConcept("Systolic", [], []);
    var vitalsConcept = buildConcept("Vitals", [systolicConcept, comorbidityConcept], []);

    var savedObs = function() {
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
                "value": {name: diabetesConcept.name.name, uuid: diabetesConcept.uuid},
                "voided": false
            },{
                "concept": comorbidityConcept,
                "label": "Comorbidity",
                "groupMembers": [],
                "value": {name: hyperTensionConcept.name.name, uuid: hyperTensionConcept.uuid},
                "voided": false
            }],
            "comment": null,
            "voided": false
        }];
    };

    var newObs = function() {
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
                "value": null,
                "voided": false
            }],
            "comment": null,
            "voided": false
        }];
    };


    //it("should toggle selection of already saved observation",function(){
    //    var rootConcept = savedObs()[0].concept;
    //    var mapper = new Bahmni.ConceptSet.ObservationMapper();
    //    var mappedObs = mapper.map(savedObs(), rootConcept, {"Comorbidity": {multiSelect: true}});
    //    expect(mappedObs.groupMembers.length).toBe(4);
    //    expect(mappedObs.groupMembers[2].label).toEqual("Comorbidity");
    //    expect(mappedObs.groupMembers[2].voided).toBeFalsy();
    //    expect(mappedObs.groupMembers[3].label).toEqual("Comorbidity");
    //    expect(mappedObs.groupMembers[3].voided).toBeFalsy();
    //
    //    mappedObs.groupMembers[1].toggleSelection({name: hyperTensionConcept.name.name, uuid: hyperTensionConcept.uuid});
    //    expect(mappedObs.groupMembers[2].voided).toBeFalsy();
    //    expect(mappedObs.groupMembers[3].voided).toBeTruthy();
    //});

    it("should toggle selection of newly selected observation",function(){
        var rootConcept = savedObs()[0].concept;
        var mapper = new Bahmni.ConceptSet.ObservationMapper();
        var mappedObs = mapper.map(savedObs(), rootConcept, {"Comorbidity": {multiSelect: true}});

        expect(mappedObs.groupMembers.length).toBe(4);
        expect(mappedObs.groupMembers[1]).toEqual(jasmine.any(Bahmni.ConceptSet.MultiSelectObservation));

        mappedObs.groupMembers[1].toggleSelection({name: hivConcept.name.name, uuid: hivConcept.uuid});
        expect(mappedObs.groupMembers.length).toBe(5);
        expect(mappedObs.groupMembers[4].voided).toBeFalsy();
    });

    it("should add new obs when there are no saved obs",function(){
        var rootConcept = newObs()[0].concept;
        var mapper = new Bahmni.ConceptSet.ObservationMapper();
        var mappedObs = mapper.map(newObs(), rootConcept, {"Comorbidity": {multiSelect: true}});

        expect(mappedObs.groupMembers.length).toBe(3);
        expect(mappedObs.groupMembers[1].label).toEqual("Comorbidity");
        expect(mappedObs.groupMembers[1]).toEqual(jasmine.any(Bahmni.ConceptSet.MultiSelectObservation));
        expect(mappedObs.groupMembers[1].voided).toBeFalsy();

        mappedObs.groupMembers[1].toggleSelection({name: hivConcept.name.name, uuid: hivConcept.uuid});
        expect(mappedObs.groupMembers.length).toBe(4);
        expect(mappedObs.groupMembers[3].value.name).toEqual(hivConcept.name.name);
        expect(mappedObs.groupMembers[3].voided).toBeFalsy();
    });

    it("should clone and create new empty value observation",function(){
        var rootConcept = newObs()[0].concept;
        var mapper = new Bahmni.ConceptSet.ObservationMapper();
        var mappedObs = mapper.map(newObs(), rootConcept, {"Comorbidity": {multiSelect: true}});
        var clonedObs = mappedObs.cloneNew();

        expect(clonedObs).not.toBeNull();
        expect(clonedObs.value).toBe(undefined);
        expect(clonedObs.comment).toBe(undefined);

        expect(clonedObs.groupMembers.length).toBe(3);
        expect(clonedObs.groupMembers[1].label).toEqual("Comorbidity");
        expect(clonedObs.groupMembers[1]).toEqual(jasmine.any(Bahmni.ConceptSet.MultiSelectObservation));
        expect(clonedObs.groupMembers[1].voided).toBeFalsy();
    });

    it("should return array of selected values", function() {
        var rootConcept = savedObs()[0].concept;
        var mapper = new Bahmni.ConceptSet.ObservationMapper();
        var mappedObs = mapper.map(savedObs(), rootConcept, {"Comorbidity": {multiSelect: true}});

        expect(mappedObs.groupMembers.length).toBe(4);
        expect(mappedObs.groupMembers[1]).toEqual(jasmine.any(Bahmni.ConceptSet.MultiSelectObservation));
        expect(mappedObs.groupMembers[1].getValues()).toEqual(['HyperTension', 'Diabetes']);

        mappedObs.groupMembers[1].toggleSelection({name: hivConcept.name.name, uuid: hivConcept.uuid});
        expect(mappedObs.groupMembers[1].getValues()).toEqual(['HyperTension', 'Diabetes', 'HIV']);
    })
});
