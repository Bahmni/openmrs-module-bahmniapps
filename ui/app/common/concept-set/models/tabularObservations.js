'use strict';

Bahmni.ConceptSet.TabularObservations = function(obsGroups, parentObs, conceptUIConfig) {
    this.parentObs = parentObs;
    this.concept = obsGroups[0] && obsGroups[0].concept;
    this.label = obsGroups[0] && obsGroups[0].label;
    this.conceptUIConfig = conceptUIConfig[this.concept.name] || {};

    this.rows = _.map(obsGroups, function(group) {
        return new Bahmni.ConceptSet.ObservationRow(group, conceptUIConfig);
    });

    this.columns = _.map(obsGroups[0].groupMembers, function(group) {
        return group.concept;
    });

    this.cloneNew = function() {
        var old = this;
        var clone = new Bahmni.ConceptSet.TabularObservations(angular.copy(obsGroups), parentObs, conceptUIConfig);
        clone.rows = _.map(old.rows, function(row){
            return row.cloneNew();
        });
        return clone;
    };

    this.addNew = function(row) {
        var newRow = row.cloneNew();
        this.rows.push(newRow);
        this.parentObs.groupMembers.push(newRow.obsGroup);
    };

    this.remove = function(row) {
        row.void();
        this.rows.splice(this.rows.indexOf(row), 1);
        if(this.rows.length == 0) {
            this.addNew(row);
        }
    };

    this.isFormElement = function(){
        return false;
    };

    this.getControlType = function(){
        return "tabular";
    };

    this.isValid = function() {
        return true;
    };

    this.getConceptUIConfig = function() {
        return this.conceptUIConfig || {};
    };

    this.canAddMore = function() {
        return this.getConceptUIConfig().allowAddMore == true;
    };

    this.atLeastOneValueSet = function(){
        return this.rows.some(function (childNode) {
            return childNode.obsGroup.value;
        })
    };
};


Bahmni.ConceptSet.ObservationRow = function(obsGroup, conceptUIConfig) {
    this.obsGroup = obsGroup;
    this.concept = obsGroup.concept;
    this.cells = obsGroup.groupMembers;
    this.void = function() {
        this.obsGroup.voided = true;
    };

    this.cloneNew = function() {
        var newObsGroup = this.obsGroup.cloneNew();
        newObsGroup.hidden = true;
        return new Bahmni.ConceptSet.ObservationRow(newObsGroup, conceptUIConfig);
    };
};
