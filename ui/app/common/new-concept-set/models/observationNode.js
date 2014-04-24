Bahmni.ConceptSet.ObservationNode = function (observation, abnormal, primaryObs, savedObsNode, conceptSetUIConfig) {
    angular.extend(this, observation);
    angular.extend(this, Bahmni.ConceptSet.Observation);
    
    if (savedObsNode) this.uuid = savedObsNode.uuid;
    this.abnormal = abnormal;
    this.primaryObs = primaryObs;

    this.conceptUIConfig = conceptSetUIConfig;
    
    Object.defineProperty(this, 'value', {
        get: function () {
            if (this.primaryObs) {
                return this.primaryObs.value;
            }
            return null;
        },
        set: function (newValue) {
            this.primaryObs.value = newValue;
            if (!this.primaryObs.hasValue()) {
                this.abnormal.value = undefined;
            }
            this.onValueChanged();
        }
    });

};

Bahmni.ConceptSet.Observation.prototype = {

    onValueChanged: function () {
        if (this.primaryObs.isNumeric()) {
            this.setAbnormal();
        }
    },

    setAbnormal: function () {
        if (this.hasValue()) {
            var valueInRange = this.value < (this.primaryObs.concept.hiNormal || Infinity) && this.value > (this.primaryObs.concept.lowNormal || 0);
            this.abnormal.value = !valueInRange;
        } else {
            this.abnormal.value = undefined;
        }
    },


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
        return false;
    },

    getControlType: function () {
        if (this.isHtml5InputDataType()) return "html5InputDataType";
        if (this.primaryObs.isText()) return "text";
        if (this.primaryObs.isCoded()) return this.conceptUIConfig.autocomplete ? "autocomplete" : "dropdown";
        return "unknown";
    },

    isHtml5InputDataType: function () {
        return ['Date', 'Numeric'].indexOf(this.primaryObs.getDataTypeName()) != -1;
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

    isValid: function (checkRequiredFields) {
        if (this.isGroup()) return this._hasValidChildren(checkRequiredFields);
        if (checkRequiredFields && this.isRequired && !this.hasValue()) return false;
        if (this.isDateDataType()) return this._isValidDate();
        return true;
    },

    _hasValidChildren: function (checkRequiredFields) {
        return this.children.every(function (childNode) {
            return childNode.isValid(checkRequiredFields)
        });
    },

    _isValidDate: function () {
        if (!this.hasValue()) return true;
        var date = new Date(this.value);
        return date.getUTCFullYear() && date.getUTCFullYear().toString().length <= 4;
    },

    hasValue: function () {
        var value = this.value;
        if (value === '' || value === null || value === undefined) return false;
        if (value instanceof Array) return value.length > 0;
        return true;
    }
};