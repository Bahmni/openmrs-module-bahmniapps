Bahmni.ConceptSet.TabularObservations = function(obsGroups, parentObs, conceptUIConfig) {
    this.parentObs = parentObs;
    this.concept = obsGroups[0] && obsGroups[0].concept;
    this.label = obsGroups[0] && obsGroups[0].label;

    this.rows = _.map(obsGroups, function(group) {
        return new Bahmni.ConceptSet.ObservationRow(group, conceptUIConfig);
    });

    this.columns = _.map(obsGroups[0].groupMembers, function(group) {
        return group.concept.shortName;
    });

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
