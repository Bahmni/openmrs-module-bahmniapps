'use strict';

describe("Tabular Observations", function() {
    it("should have rows", function() {
        var tabularObservations = new Bahmni.ConceptSet.TabularObservations(obsGroups, parentObs, {});
        expect(tabularObservations.label).toEqual("DST Result");
        expect(tabularObservations.concept).not.toBeNull();
        expect(tabularObservations.rows.length).toBe(2);
        expect(tabularObservations.isFormElement()).toBeFalsy();
        expect(tabularObservations.isValid()).toBeTruthy();
        expect(tabularObservations.getControlType()).toBe("tabular");
    });

    it("should have columns", function() {
        var tabularObservations = new Bahmni.ConceptSet.TabularObservations(obsGroups, parentObs, {});
        expect(tabularObservations.columns[0].shortName).toEqual("Drugs");
        expect(tabularObservations.columns[1].shortName).toEqual("Concentration");
    });

    it("should add new row in the table", function() {
        var tabularObservations = new Bahmni.ConceptSet.TabularObservations(obsGroups, parentObs, {});
        tabularObservations.addNew(tabularObservations.rows[0]);

        expect(tabularObservations.rows.length).toBe(3);
    });

    it("should remove row in the table", function() {
        var tabularObservations = new Bahmni.ConceptSet.TabularObservations(obsGroups, parentObs, {});
        tabularObservations.remove(tabularObservations.rows[0]);

        expect(tabularObservations.rows.length).toBe(1);
        expect(tabularObservations.rows[0].cells[0].value).toEqual("Drug2");
        expect(tabularObservations.rows[0].cells[1].value).toEqual("100mg");
    });

    it("should remove last row in the table and add a new empty row", function() {
        var tabularObservations = new Bahmni.ConceptSet.TabularObservations(obsGroups, parentObs, {});

        tabularObservations.remove(tabularObservations.rows[0]);
        expect(tabularObservations.rows.length).toBe(1);

        tabularObservations.remove(tabularObservations.rows[0]);
        expect(tabularObservations.rows.length).toBe(1);
        expect(tabularObservations.rows[0].cells[0].value).toEqual(undefined);
        expect(tabularObservations.rows[0].cells[1].value).toEqual(undefined);
    });

    it("canAddMore, should return true if configured to show", function() {
        var tabularObservations = new Bahmni.ConceptSet.TabularObservations(obsGroups, parentObs, {"DST Result":{"allowAddMore": true}});
        expect(tabularObservations.canAddMore()).toBeTruthy();
    });

    var obsGroups = [{
        concept: {name:"DST Result", shortName: "DST"},
        label: "DST Result",
        groupMembers: [{
            concept: {shortName: "Drugs"},
            value: "Drug1"
        }, {
            concept: {shortName: "Concentration"},
            value: "500mg"
        }],
        cloneNew: function() {
            return {concept: {shortName: "DST"}, label: "DST Result", groupMembers: [{concept: {shortName: "Drugs"}}, {concept: {shortName: "Concentration"}}]}
        }
    }, {
        concept: {shortName: "DST"},
        label: "DST Result",
        groupMembers: [{
            concept: {shortName: "Drugs"},
            value: "Drug2"
        }, {
            concept: {shortName: "Concentration"},
            value: "100mg"
        }],
        cloneNew: function() {
            return {concept: {shortName: "DST"}, label: "DST Result", groupMembers: [{concept: {shortName: "Drugs"}}, {concept: {shortName: "Concentration"}}]}
        }
    }];

    var parentObs = {
        concept: {shortName: "DST"},
        groupMembers: []
    };
});
