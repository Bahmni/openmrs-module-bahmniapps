Bahmni.ConceptSet.Observation = function (observation, conceptUIConfig) {
    angular.extend(this, observation);
    this.conceptUIConfig = conceptUIConfig;
};

Bahmni.ConceptSet.Observation.prototype = {
    displayValue: function () {
        if (this.possibleAnswers.length > 0) {
            for (var i = 0; i < this.possibleAnswers.length; i++) {
                if (this.possibleAnswers[i].uuid === this.value) {
                    return this.possibleAnswers[i].display;
                }
            }
        }
        else {
            return this.value;
        }
    },

    isGroup: function () {
        if (this.groupMembers)
            return this.groupMembers.length > 0;
        return false;
    },

    getControlType: function() {
        if(this.isHtml5InputDataType()) return "html5InputDataType";
        if(this.isText()) return "text";
        if(this.isCoded()) return this.conceptUIConfig.autocomplete ? "autocomplete" : "dropdown";
        return "unknown";
    },

    isNumeric: function() {
        return this.getDataTypeName() === "Numeric";
    },

    isText: function() {
        return this.getDataTypeName() === "Text";
    },

    isCoded: function() {
        return this.getDataTypeName() === "Coded";
    },

    getDataTypeName: function(){
        return this.concept.dataType;
    },

    isHtml5InputDataType: function(){
        return ['Date', 'Numeric'].indexOf(this.getDataTypeName()) != -1;
    },

    hasSupportedDataType: function(){
        return ['Text', 'Date', 'Numeric', 'Coded'].indexOf(this.getDataTypeName()) != -1;
    },

    getHighAbsolute: function() {
        return this.concept.hiAbsolute;
    },

    getLowAbsolute: function() {
        return this.concept.lowAbsolute;
    },

    onValueChanged: function() {
        this.observationDateTime = new Date();
    }
}