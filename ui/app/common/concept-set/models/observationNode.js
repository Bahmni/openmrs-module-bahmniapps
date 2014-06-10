Bahmni.ConceptSet.ObservationNode = function (observation, savedObs, conceptUIConfig) {
    angular.extend(this, observation);
    Object.defineProperty(this, 'value', {
        get: function () {
            return this.primaryObs ? this.primaryObs.value : null;
        },
        set: function (newValue) {
            this.primaryObs.value = newValue;
            this.onValueChanged();
        }
    });
 
    this.conceptUIConfig = conceptUIConfig;
    this.isObservationNode = true;
    this.observationDateTime = Bahmni.Common.Util.DateUtil.now();
    if (savedObs) {
        this.uuid = savedObs.uuid;
        this.observationDateTime = savedObs.observationDateTime;
    }
    this.duration = this.getDuration();
    this.abnormal = this.getAbnormal();
    this.primaryObs = this.getPrimaryObs();
};

Bahmni.ConceptSet.ObservationNode.prototype = {

    getPossibleAnswers: function () {
        return this.primaryObs.concept.answers;
    },

    _getGroupMemberWithClass: function(className) {
        return this.groupMembers.filter(function (member) {
            return (member.concept.conceptClass.name === className) || (member.concept.conceptClass === className);
        })[0];
    },

    getAbnormal: function () {
        return this._getGroupMemberWithClass(Bahmni.Common.Constants.abnormalConceptClassName);
    },

    getDuration: function () {
        return this._getGroupMemberWithClass(Bahmni.Common.Constants.durationConceptClassName);
    },

    getPrimaryObs: function () {
        return this._getGroupMemberWithClass(Bahmni.Common.Constants.miscConceptClassName);
    },

    onValueChanged: function () {
        if (!this.primaryObs.hasValue() && this.getAbnormal()) {
            this.getAbnormal().value = undefined;
        }
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

    getConceptUIConfig: function () {
        return this.conceptUIConfig[this.primaryObs.concept.name] || [];
    },

    getControlType: function () {
        if (this.getConceptUIConfig().freeTextAutocomplete) return "freeTextAutocomplete";
        if (this.isHtml5InputDataType()) return "html5InputDataType";
        if (this.primaryObs.isText()) return "text";
        if (this.primaryObs.isCoded()) return this._getCodedControlType();
        return "unknown";
    },

    _getCodedControlType: function () {
        var conceptUIConfig = this.getConceptUIConfig();
        if (conceptUIConfig.multiselect) return "multiselect";
        if (conceptUIConfig.autocomplete) return "autocomplete";
        return "dropdown";
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

    hasDuration: function () {
        if (!this.getDuration() || !this.getConceptUIConfig().durationRequired){
            return false;
        }
        else {
            if (!this.getDuration().value) {
                return true;
            }
            else if (this.getDuration().value < 0){
                return true;
            }
            else{
                return false;
            }
        }

    },

    isValid: function (checkRequiredFields, conceptSetRequired) {
        if (this.isGroup()) return this._hasValidChildren(checkRequiredFields, conceptSetRequired);
        if (conceptSetRequired && this.isRequired() && !this.getPrimaryObs().hasValue()) return false;
        if (checkRequiredFields && this.isRequired() && !this.getPrimaryObs().hasValue()) return false;
        if (this._isDateDataType()) return this.getPrimaryObs().isValidDate();
        if (this.getPrimaryObs().hasValue() && this.hasDuration()) return false;
        return true;
    },

    isRequired: function () {
        return this.getConceptUIConfig().required || false;
    },

    _hasValidChildren: function (checkRequiredFields, conceptSetRequired) {
        return this.groupMembers.every(function (member) {
            return member.isValid(checkRequiredFields, conceptSetRequired)
        });
    }
};