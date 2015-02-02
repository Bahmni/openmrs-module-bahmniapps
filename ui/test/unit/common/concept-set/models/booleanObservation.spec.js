'use strict';

describe("Boolean Observation", function() {
    it("toggleSelection should toggle selection for true and false value", function() {
        var obs = new Bahmni.ConceptSet.BooleanObservation({}, {allowAddMore: true});

        obs.toggleSelection({value: true});
        expect(obs.value).toBeTruthy();

        obs.toggleSelection({value: false});
        expect(obs.value).toBeFalsy();
    });

    it("toggleSelection should set null value if toggled twice", function() {
        var obs = new Bahmni.ConceptSet.BooleanObservation({}, {allowAddMore: true});
        obs.toggleSelection({value: true});
        obs.toggleSelection({value: true});

        expect(obs.value).toBeNull();
    });

    it("should clone new with null values", function() {
        var obs = new Bahmni.ConceptSet.BooleanObservation({}, {allowAddMore: true});
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
        expect(new Bahmni.ConceptSet.BooleanObservation({concept: {name: "ABC"}}).isRequired()).toBeFalsy();
    });

    it("should be valid if it is required and present", function() {
        var requiredObservation = new Bahmni.ConceptSet.BooleanObservation({concept: {name: "ABC"}}, {"ABC": {required: true}});
        requiredObservation.value = {displayString: "Yes", value: true};
        expect(requiredObservation.isValid(true, true)).toBeTruthy();

        requiredObservation.value = {displayString: "No", value: false};
        expect(requiredObservation.isValid(true, true)).toBeTruthy();

        requiredObservation.value = undefined;
        expect(requiredObservation.isValid(true, false)).toBeFalsy();
    });

    it("should always be valid when it is not required", function() {
        var requiredObservation = new Bahmni.ConceptSet.BooleanObservation({concept: {name: "ABC"}}, {"ABC": {required: false}});

        expect(requiredObservation.isValid(true, true)).toBeTruthy();
        expect(requiredObservation.isValid(true, false)).toBeTruthy();
        expect(requiredObservation.isValid(false, false)).toBeTruthy();
        expect(requiredObservation.isValid(false, true)).toBeTruthy();
    });
});
