Bahmni.ConceptSet.PreviousEncounterObservation = function(observation, conceptSetConfig) {

    angular.extend(this, observation);

    this.isFormElement = function(){
        return false;
    };

    this.isObservationNode = function(){
        return observation.isObservationNode();
    };

    this.canHaveComment = function() {
        return false;
    };

    this.canAddMore = function() {
        return this.getConceptUIConfig().allowAddMore == true;
    };

    this.onEdit = function(rootObs) {
        this.hidden = true;
        var newObs = observation.cloneNew();
        newObs.belongsToPreviousEncounter = false;
        rootObs.groupMembers.push(newObs);
    }

    this.getConceptUIConfig = function() {
        return conceptSetConfig[this.concept.name] || {};
    };

    this.getControlType = function(){
        return "readOnly";
    };

    this.showTitle = function() {
        return observation.showTitle();
    }

    this.isComputed = function() {
        return observation.isComputed();
    }
};