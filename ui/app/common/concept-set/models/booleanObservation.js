Bahmni.ConceptSet.BooleanObservation = function(observation, conceptUIConfig) {
    angular.extend(this, observation);

    this.isBoolean = true;
    this.conceptUIConfig = conceptUIConfig || {};

    this.cloneNew = function() {
        var clone = new Bahmni.ConceptSet.BooleanObservation(angular.copy(observation), conceptUIConfig);
        clone.comment = undefined;
        clone.uuid = null;
        return clone;
    };

    var possibleAnswers = [
        {displayString: "Yes", value: true},
        {displayString: "No", value: false}
    ];

    this.getPossibleAnswers = function() {
        return possibleAnswers;
    };

    this.hasValueOf = function (answer) {
        return this.value === answer.value;
    };

    this.toggleSelection = function(answer) {
        if(this.value === answer.value){
            this.value = null;
        } else{
            this.value = answer.value;
        }
    };

    this.isFormElement = function(){
        return true;
    };

    this.getControlType = function(){
        return "buttonselect";
    };

    this.isRequired = function () {
        return this.getConceptUIConfig().required;
    };

    this.isComputedAndEditable = function() {
        return this.concept.conceptClass === "Computed/Editable";
    };

    this.atLeastOneValueSet = function() {
        return this.value;
    };
    this.isValid = function(checkRequiredFields, conceptSetRequired) {
        if(this.error) return false;
        var notYetSet = function(value) {
            return (typeof value == 'undefined'  || value == null);
        };
        if(checkRequiredFields){
            if (conceptSetRequired && this.isRequired() && notYetSet(this.value)) return false;
            if (this.isRequired() && notYetSet(this.value)) return false;
        }
        return true;
    };

    this.canHaveComment = function() {
        return this.getConceptUIConfig().disableAddNotes ?  !this.getConceptUIConfig().disableAddNotes : true;
    };

    this.getConceptUIConfig = function() {
        return this.conceptUIConfig[this.concept.name] || {};
    };

    this.canAddMore = function() {
        return this.getConceptUIConfig().allowAddMore == true;
    };
};
