'use strict';

describe("ConceptSetObservationMapper", function () {
    var buildConcept = function (name, setMembers, answers, classname, datatype) {
        return {
            "name": {name: name},
            "set": setMembers && setMembers.length > 0,
            conceptClass: {name: classname || "N/A"},
            dataType: datatype || "Text",
            setMembers: setMembers,
            answers: answers,
            "uuid": name + "_uuid"
        };
    };
    var mapper = new Bahmni.ConceptSet.ObservationMapper();

    var savedObs = function () {
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
            "formNamespace": "Bahmni",
            "groupMembers": [{
                "concept": comorbidityConcept,
                "label": "Comorbidity",
                "groupMembers": [],
                "value": diabetesConcept,
                "voided": false
            }, {
                "concept": systolicConcept,
                "label": "Systolic",
                "groupMembers": [],
                "value": "90",
                "voided": false
            }, {
                "concept": comorbidityConcept,
                "label": "Comorbidity",
                "groupMembers": [],
                "value": hyperTensionConcept,
                "voided": false
            }],
            "comment": null,
            "voided": false
        }];
    };

    var chiefComplaintObs = function () {
        var headache = buildConcept("Headache", [], []);
        var chiefComplaint = buildConcept("Chief Complaint", [], [], "Misc", "Coded");
        var duration = buildConcept("Chief Complaint Duration", [], [], "Duration", "Numeric");
        var chiefComplaintData = buildConcept("Chief Complaint Data", [chiefComplaint, duration], [], "Concept Details");
        var unit = buildConcept('Chief Complaint Duration', [], [], "Units", "Coded");
        var days = buildConcept('Days', [], []);
        return [{
            "concept": chiefComplaintData,
            "label": "Chief Complaint Data",
            "formNamespace": "Bahmni",
            "groupMembers": [{
                "concept": chiefComplaint,
                "label": "Chief Complaint",
                "groupMembers": [],
                "value": headache,
                "voided": false
            }, {
                "concept": duration,
                "label": "Duration",
                "groupMembers": [],
                "value": 30,
                "voided": false
            }, {
                "concept": unit,
                "label": "Units",
                "groupMembers": [],
                "value": days,
                "voided": false
            }],
            "comment": null,
            "voided": false
        }];
    };

    var translatedMessages = {
        "CHIEF_COMPLAINT_DATA_WITHOUT_OTHER_CONCEPT_TEMPLATE_KEY": "Headache since 30 Days",
        "CHIEF_COMPLAINT_DATA_CONCEPT_NAME_KEY": "Vitals"
    };

    var translate = jasmine.createSpyObj('$translate', ['instant']);
    translate.instant.and.callFake(function (key) {
        return translatedMessages[key];
    });

    it("should map observation tree", function () {
        var rootConcept = savedObs()[0].concept;
        var mappedObs = mapper.map(savedObs(), rootConcept, {});

        expect(mappedObs.label).toEqual("Vitals");
        expect(mappedObs.groupMembers[0].label).toEqual("Systolic");
    });

    it("should map multiSelect Obs", function () {
        var rootConcept = savedObs()[0].concept;
        var mappedObs = mapper.map(savedObs(), rootConcept, {"Comorbidity": {multiSelect: true}});

        expect(mappedObs.groupMembers.length).toBe(4);
        expect(mappedObs.groupMembers[1].label).toEqual("Comorbidity");
        expect(mappedObs.groupMembers[1]).toEqual(jasmine.any(Bahmni.ConceptSet.MultiSelectObservation));
        expect(mappedObs.groupMembers[2].hidden).toBeTruthy();
        expect(mappedObs.groupMembers[3].hidden).toBeTruthy();
    });

    it("should map ObservationNode", function () {
        var headache = buildConcept("Headache", [], []);
        var obs = chiefComplaintObs();

        var rootConcept = obs[0].concept;
        var mappedObs = mapper.map(obs, rootConcept);

        expect(mappedObs.groupMembers.length).toBe(3);
        expect(mappedObs).toEqual(jasmine.any(Bahmni.ConceptSet.ObservationNode));
        expect(mappedObs.value).toEqual(headache.name);
    });

    it("should map obsGroups as tabular observations if configured", function () {
        var drug = buildConcept("Drug", [], []);
        var concentration = buildConcept("Concentration", [], []);
        var dstResult = buildConcept("DST Result", [drug, concentration], []);
        var headache = buildConcept("Headache", [], []);
        var dst = buildConcept("DST", [headache, dstResult], []);

        var obs = [{
            "concept": dst,
            "label": "DST",
            "comment": null,
            "voided": false,
            groupMembers: [{
                "concept": dstResult,
                "label": "DST Result",
                "groupMembers": [{
                    "concept": drug,
                    "label": "Drug",
                    "groupMembers": [],
                    "value": "Paracetamol",
                    "voided": false
                }, {
                    "concept": concentration,
                    "label": "Concentration",
                    "groupMembers": [],
                    "value": "100mg",
                    "voided": false
                }],
                "comment": null,
                "voided": false
            }, {
                "concept": headache,
                "label": "Headache",
                "groupMembers": [],
                "value": "Mild",
                "comment": null,
                "voided": false
            }, {
                "concept": dstResult,
                "label": "DST Result",
                "groupMembers": [{
                    "concept": drug,
                    "label": "Drug",
                    "groupMembers": [],
                    "value": "Asprine",
                    "voided": false
                }, {
                    "concept": concentration,
                    "label": "Concentration",
                    "groupMembers": [],
                    "value": "500mg",
                    "voided": false
                }],
                "comment": null,
                "voided": false
            }]
        }];

        var rootConcept = obs[0].concept;
        var mappedObs = mapper.map(obs, rootConcept, {"DST Result": {isTabular: true}});

        expect(mappedObs.groupMembers.length).toBe(4);
        expect(mappedObs.groupMembers[0].label).toEqual("Headache");

        expect(mappedObs.groupMembers[1].label).toEqual("DST Result");
        expect(mappedObs.groupMembers[1].hidden).toBeTruthy();

        expect(mappedObs.groupMembers[2].label).toEqual("DST Result");
        expect(mappedObs.groupMembers[3].label).toEqual("DST Result");
    });

    it("should get observations for view", function () {
        var obs = mapper.getObservationsForView(savedObs(), {});

        expect(obs.length).toBe(3);

        expect(obs[0].value).toEqual("Diabetes");
        expect(obs[0].label).toBe("Comorbidity");
        expect(obs[1].value).toBe("90");
        expect(obs[1].label).toBe("Systolic");
        expect(obs[2].value).toEqual("HyperTension");
        expect(obs[2].label).toBe("Comorbidity");
    });

    it("should get observations for view when grid config is there", function () {
        var chiefComplaintObservations = chiefComplaintObs();
        chiefComplaintObservations[0].concept.name = "Vitals";
        var obs = mapper.getObservationsForView(chiefComplaintObservations, {"Vitals": {grid: true}}, translate);
        expect(obs.length).toBe(1);
        expect(obs[0].value).toBe("Headache since 30 Days");
        expect(obs[0].label).toBe("Vitals");
    });
});
