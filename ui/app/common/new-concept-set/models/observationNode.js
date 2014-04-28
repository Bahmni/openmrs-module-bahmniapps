Bahmni.ConceptSet.ObservationNode = function (observation, savedObs, conceptSetUIConfig) {

    this.isObservationNode = true;
    if (savedObs) {
        this.uuid = savedObs.uuid;
    }

    angular.extend(this, observation);
    angular.extend(this, Bahmni.ConceptSet.Observation);

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

    Object.defineProperty(this, 'abnormal', {
        get: function () {
            return this.getAbnormal();
        }
    }); 
    
    Object.defineProperty(this, 'primaryObs', {
        get: function () {
            return this.getPrimaryObs();
        }
    });
};


Bahmni.ConceptSet.ObservationNode.prototype = {

    getAbnormal: function () {
        var abnormalAsArray = this.groupMembers.filter(function (member) {
            return (member.concept.conceptClass.name === Bahmni.Common.Constants.abnormalConceptClassName);
        });
        return abnormalAsArray[0];
    },

    getPrimaryObs: function () {
        var abnormalAsArray = this.groupMembers.filter(function (member) {
            return (member.concept.conceptClass.name === Bahmni.Common.Constants.miscConceptClassName);
        });
        return abnormalAsArray[0];
    },

    onValueChanged: function () {
        if (this.primaryObs.isNumeric()) {
            this.setAbnormal();
        }
//        this.observationDateTime = new Date();
    },

    setAbnormal: function () {
        if (this.primaryObs.hasValue()) {
            var valueInRange = this.value <= (this.primaryObs.concept.hiNormal || Infinity) && this.value >= (this.primaryObs.concept.lowNormal || 0);
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

    _isDateDataType: function () {
        return 'Date'.indexOf(this.primaryObs.getDataTypeName()) != -1;
    },

    getHighAbsolute: function () {
        return this.concept.hiAbsolute;
    },

    getLowAbsolute: function () {
        return this.concept.lowAbsolute;
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
            return this.primaryObs.hasValue();
        }
    },

    isValid: function (checkRequiredFields) {
        if (this.isGroup()) return this._hasValidChildren(checkRequiredFields);
        if (checkRequiredFields && this.isRequired() && !this.primaryObs.hasValue()) return false;
        if (this._isDateDataType()) return this.primaryObs.isValidDate();
        return true;
    },

    isRequired: function () {
        return true;
    },

    _hasValidChildren: function (checkRequiredFields) {
        return this.groupMembers.every(function (member) {
            return member.isValid(checkRequiredFields)
        });
    }
};