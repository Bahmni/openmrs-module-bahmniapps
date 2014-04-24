Bahmni.ConceptSet.Observation = function (observation) {
    angular.extend(this, observation);
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

    isNumeric: function () {
        return this.getDataTypeName() === "Numeric";
    },

    isText: function () {
        return this.getDataTypeName() === "Text";
    },

    isCoded: function () {
        return this.getDataTypeName() === "Coded";
    },

    getDataTypeName: function () {
        return this.concept.dataType;
    },
    
    isDateDataType: function () {
        return 'Date'.indexOf(this.getDataTypeName()) != -1;
    },

    getHighAbsolute: function () {
        return this.concept.hiAbsolute;
    },

    getLowAbsolute: function () {
        return this.concept.lowAbsolute;
    },

    onValueChanged: function () {
        this.observationDateTime = new Date();
    },

    getInputType: function () {
        return this.getDataTypeName();
    },

    atLeastOneValueSet: function () {
        if (this.isGroup()) {
            return this.children.some(function (childNode) {
                return childNode.atLeastOneValueSet();
            })
        } else {
            return this.hasValue();
        }
    },

    hasValue: function () {
        var value = this.value;
        if (value === '' || value === null || value === undefined) return false;
        if (value instanceof Array) return value.length > 0;
        return true;
    }
};