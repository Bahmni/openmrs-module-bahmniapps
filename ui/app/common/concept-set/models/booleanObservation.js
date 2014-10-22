Bahmni.ConceptSet.BooleanObservation = function(observation) {
    var self = this;
    angular.extend(this, observation);

    this.isBoolean = true;

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

    this.atLeastOneValueSet = function() {
        return true;
    };

    this.isValid = function(a,b) {
        return true;
    };

    this.canHaveComment = function() {
        return true;
    };
};
