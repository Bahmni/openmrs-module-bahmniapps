Bahmni.ConceptSet.ObservationNode = function (observation, savedObs, conceptSetUIConfig) {

    angular.extend(this, observation);
    angular.extend(this, Bahmni.ConceptSet.Observation);
    Object.defineProperty(this, 'value', {
        get: function () {
            if (this.primaryObs) {
                return this.primaryObs.value;
            }
            return null;
        },
        set: function (newValue) {
            this.primaryObs.value = newValue;
            this.onValueChanged();
        }
    });

    Object.defineProperty(this, 'duration', {
        get: function () {
            return this.getDuration();
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

    this.conceptSetUIConfig = conceptSetUIConfig;
    this.isObservationNode = true;
    if (savedObs) {
        this.uuid = savedObs.uuid;
    }

};

Bahmni.ConceptSet.ObservationNode.prototype = {

    getPossibleAnswers: function () {
        return this.getPrimaryObs().concept.answers;
    },

    getAbnormal: function () {
        var abnormalAsArray = this.groupMembers.filter(function (member) {
            return (member.concept.conceptClass.name === Bahmni.Common.Constants.abnormalConceptClassName);
        });
        return abnormalAsArray[0];
    },

    getDuration: function () {
        var abnormalAsArray = this.groupMembers.filter(function (member) {
            return (member.concept.conceptClass.name === Bahmni.Common.Constants.durationConceptClassName);
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
        if (!this.getPrimaryObs().hasValue() && this.getAbnormal()) {
            this.getAbnormal().value = undefined;
        }
        if (this.getPrimaryObs().isNumeric()) {
            this.setAbnormal();
        }
//        this.observationDateTime = new Date();
    },

    setAbnormal: function () {
        if (this.getPrimaryObs().hasValue()) {
            var valueInRange = this.value <= (this.getPrimaryObs().concept.hiNormal || Infinity) && this.value >= (this.getPrimaryObs().concept.lowNormal || 0);
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

    getConceptUIConfig: function () {
        return this.conceptSetUIConfig[this.getPrimaryObs().concept.name] || [];
    },

    getControlType: function () {
        if (this.getConceptUIConfig().freeTextAutocomplete) return "freeTextAutocomplete";
        if (this.isHtml5InputDataType()) return "html5InputDataType";
        if (this.getPrimaryObs().isText()) return "text";
        if (this.getPrimaryObs().isCoded()) return this._getCodedControlType();
        return "unknown";
    },

    _getCodedControlType: function () {
        var conceptUIConfig = this.getConceptUIConfig();
        if (conceptUIConfig.multiselect) return "multiselect";
        if (conceptUIConfig.autocomplete) return "autocomplete";
        return "dropdown";
    },

    isHtml5InputDataType: function () {
        return ['Date', 'Numeric'].indexOf(this.getPrimaryObs().getDataTypeName()) != -1;
    },

    _isDateDataType: function () {
        return 'Date'.indexOf(this.getPrimaryObs().getDataTypeName()) != -1;
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
            return this.getPrimaryObs().hasValue();
        }
    },

    isValid: function (checkRequiredFields) {
        if (this.isGroup()) return this._hasValidChildren(checkRequiredFields);
        if (checkRequiredFields && this.isRequired() && !this.getPrimaryObs().hasValue()) return false;
        if (this._isDateDataType()) return this.getPrimaryObs().isValidDate();
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