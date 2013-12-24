Bahmni.ConceptSet.Observation = function () {
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

    isNumeric: function() {
        return this.concept.datatype && this.concept.datatype.name == "Numeric";
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