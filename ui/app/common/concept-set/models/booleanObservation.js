Bahmni.ConceptSet.BooleanObservation = function(observation, conceptUIConfig) {
    var self = this;
    angular.extend(this, observation);

    this.isBoolean = true;
    this.conceptUIConfig = conceptUIConfig;

    this.cloneNew = function() {
        var clone = new Bahmni.ConceptSet.BooleanObservation(angular.copy(observation), conceptUIConfig);
        clone.comment = undefined;
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

    this.isComputedAndEditable = function() {
        return this.concept.conceptClass === "Computed/Editable";
    };

    this.atLeastOneValueSet = function() {
        return true;
    };

    this.isValid = function(a,b) {
        return true;
    };

    this.canHaveComment = function() {
        return true;
    };

    this.getConceptUIConfig = function() {
        return this.conceptUIConfig[this.concept.name] || {};
    };

    this.canAddMore = function() {
        return this.getConceptUIConfig().allowAddMore == true;
    };
};
