'use strict';

describe("Boolean Observation", function() {
    it("toggleSelection should toggle selection for true and false value", function() {
        var observation = {
            concept:{
                name:"ANC, ANC Visit"
            }
        };
        var obs = new Bahmni.ConceptSet.BooleanObservation(observation, {});

        obs.toggleSelection({value: true});
        expect(obs.value).toBeTruthy();

        obs.toggleSelection({value: false});
        expect(obs.value).toBeFalsy();
    });

    it("should clone the observation and remove the UUIDs once cloned", function() {
        var originalObs = {
            "concept": {
                "uuid": "bc29348f-03e9-426c-a083-1b803f62fa28",
                "name": "Delivery Note, Liveborn defects present",
                "dataType": "Boolean"
            },
            "units": null,
            "label": "Defects",
            "possibleAnswers": [],
            "groupMembers": [],
            "comment": null,
            "isObservation": true,
            "conceptUIConfig": {
                "Death Note, Secondary Cause of Death": {
                    "answersConceptName": "Death Note, Cause, Answers",
                    "autocomplete": true
                },
                "Death Note, Tertiary Cause of Death": {
                    "answersConceptName": "Death Note, Cause, Answers",
                    "autocomplete": true
                }
            },
            "uniqueId": "observation_89",
            "uuid": "ead2fb90-762e-4998-8e5d-9589a9574257",
            "value": true,
            "observationDateTime": "2015-02-09T11:58:34.000+0530",
            "isBoolean": true,
            "voided": false
        };

        var obs = new Bahmni.ConceptSet.BooleanObservation(originalObs, {"Delivery Note, Liveborn defects present": {allowAddMore: true}});

        var actualObs = obs.cloneNew();
        expect(actualObs.uuid).toBeNull();
        expect(actualObs.label).toEqual("Defects");
        expect(actualObs.isObservation).toEqual(true);
    });

    it("toggleSelection should set null value if toggled twice", function() {
        var obs = new Bahmni.ConceptSet.BooleanObservation({concept: {name: "ABC"}}, {"ABC": {allowAddMore: true}});
        obs.toggleSelection({value: true});
        obs.toggleSelection({value: true});

        expect(obs.value).toBeNull();
    });

    it("should clone new with null values", function() {
        var obs = new Bahmni.ConceptSet.BooleanObservation({concept: {name: "ABC"}}, {"ABC": {allowAddMore: true}});
        obs.toggleSelection({value: true});
        var clone = obs.cloneNew();

        expect(clone).not.toBeNull();
        expect(clone.value).toBe(undefined);
        expect(clone.comment).toBe(undefined);
    });

    it("canAddMore should be true if configured",function(){
        expect(new Bahmni.ConceptSet.BooleanObservation({concept: {name: "ABC"}}, {"ABC": {allowAddMore: true}}).canAddMore()).toBeTruthy();
        expect(new Bahmni.ConceptSet.BooleanObservation({concept: {name: "ABC"}}, {"ABC": {allowAddMore: false}}).canAddMore()).toBeFalsy();
        expect(new Bahmni.ConceptSet.BooleanObservation({concept: {name: "ABC"}}, {}).canAddMore()).toBeFalsy();
    });

    it("isRequired should retrieve value from conceptSetUIConfig", function() {
        expect(new Bahmni.ConceptSet.BooleanObservation({concept: {name: "ABC"}}, {"ABC": {required: true}}).isRequired()).toBeTruthy();
        expect(new Bahmni.ConceptSet.BooleanObservation({concept: {name: "ABC"}}, {"ABC": {required: false}}).isRequired()).toBeFalsy();
        expect(new Bahmni.ConceptSet.BooleanObservation({concept: {name: "ABC"}}, {}).isRequired()).toBeFalsy();
        expect(new Bahmni.ConceptSet.BooleanObservation({concept: {name: "ABC"}}, {}).isRequired()).toBeFalsy();
    });

    it("should be valid if it is required and present", function() {
        var requiredObservation = new Bahmni.ConceptSet.BooleanObservation({concept: {name: "ABC"}}, {"ABC": {required: true}});
        requiredObservation.value = true;
        expect(requiredObservation.isValid(true, true)).toBeTruthy();

        requiredObservation.value = false;
        expect(requiredObservation.isValid(true, true)).toBeTruthy();

        requiredObservation.value = undefined;
        expect(requiredObservation.isValid(true, false)).toBeFalsy();

        requiredObservation.value = null;
        expect(requiredObservation.isValid(true, false)).toBeFalsy();
    });

    it("should always be valid when it is not required", function() {
        var requiredObservation = new Bahmni.ConceptSet.BooleanObservation({concept: {name: "ABC"}}, {"ABC": {required: false}});

        expect(requiredObservation.isValid(true, true)).toBeTruthy();
        expect(requiredObservation.isValid(true, false)).toBeTruthy();
        expect(requiredObservation.isValid(false, false)).toBeTruthy();
        expect(requiredObservation.isValid(false, true)).toBeTruthy();
    });

    it("should hide notes button when configured to not show", function() {
        var requiredObservation = new Bahmni.ConceptSet.BooleanObservation({concept: {name: "ABC"}},{"ABC":{"disableAddNotes" : true}})
        expect(requiredObservation.canHaveComment()).toBeFalsy();
    });

    it("should by default show notes button when nothing configured", function() {
        var requiredObservation = new Bahmni.ConceptSet.BooleanObservation({concept: {name: "ABC"}},{})
        expect(requiredObservation.canHaveComment()).toBeTruthy();
    });
});
