'use strict';

(function(){    
    var findPrimaryObservation = function(observations, compoundObservationConcept) {
        var compundObservationMemberUuids = compoundObservationConcept.setMembers.map(function(member) { return member.uuid; });
        return observations.filter(function(observation) {
            return compundObservationMemberUuids.indexOf(observation.concept.uuid) === -1; 
        })[0];
    };

    var newAbnormalityObservation = function(compoundObservationConcept) {
        var abnormalityConcept = findConcept(compoundObservationConcept.setMembers, Bahmni.Common.Constants.abnormalObservationConceptName);
        return {concept: mapConcept(abnormalityConcept), groupMembers: []};
    };

    var mapConcept = function(openMRSConcept) {
        return new Bahmni.ConceptSet.ConceptMapper().map(openMRSConcept);
    }

    var findConcept = function(concepts, name) {
        return concepts.filter(function(member) { return member.name.name === name; })[0];
    };

    var CompundObservation = function(compoundObservation, primaryConcept, compoundObservationConcept) {
        this.abnormalityObservation = compoundObservation.groupMembers.filter(function(observation) { return observation.concept.name === Bahmni.Common.Constants.abnormalObservationConceptName; })[0];
        if(!this.abnormalityObservation) {
            this.abnormalityObservation = newAbnormalityObservation(compoundObservationConcept);
            compoundObservation.groupMembers.push(this.abnormalityObservation);
        }
    }

    var SingleValueCompundObservation = function(compoundObservation, primaryConcept, compoundObservationConcept) {
        this.primaryObservation = findPrimaryObservation(compoundObservation.groupMembers, compoundObservationConcept);
        if(!this.primaryObservation) {
            this.primaryObservation =  { concept: primaryConcept, groupMembers: []};
            compoundObservation.groupMembers.push(this.primaryObservation);
        }

        angular.extend(this, new CompundObservation(compoundObservation, primaryConcept, compoundObservationConcept));

        this.getValue = function() {
          return this.primaryObservation.value;  
        }

        this.setValue = function(value) {
            this.primaryObservation.value = value;
            this.primaryObservation.observationDateTime = new Date();
        }
    }
    
    var MultiValueCompundObservation = function(compoundObservation, primaryConcept, compoundObservationConcept) {
        var ArrayUtil = Bahmni.Common.Util.ArrayUtil;
        angular.extend(this, new CompundObservation(compoundObservation, primaryConcept, compoundObservationConcept));
        
        var removeObservation = function(observation) {
                if(observation.uuid) { observation.voided = true; }
                else { ArrayUtil.removeItem(compoundObservation.groupMembers, observation); }
            },

            getPrimaryObservations = function() {
                var existingObservations = compoundObservation.groupMembers.filter(function(member) { return !member.voided });
                return existingObservations.filter(function(observation){ return observation.concept.uuid === primaryConcept.uuid });
            },

            getPrimaryObservationWithValue = function(answerConcept) {
                return compoundObservation.groupMembers.filter(function(member){ 
                    return member.concept.uuid === primaryConcept.uuid && member.value.uuid === answerConcept.uuid;
                })[0];
            },

            createObservation = function(concept, value) {
                return { concept: concept, value: value, groupMembers: []};
            },
            
            addPrimaryObservationWithValue = function(answerConcept) {
                var existingObservation = getPrimaryObservationWithValue(answerConcept);
                if(existingObservation) {
                    existingObservation.voided = false;
                } 
                else {
                    compoundObservation.groupMembers.push(createObservation(primaryConcept, answerConcept));
                }
            }; 

        this.getValue = function() {
            return getPrimaryObservations().map(function(concept){ return concept.value; });
        }

        this.setValue = function(answerConcepts) {
            answerConcepts.forEach(addPrimaryObservationWithValue);
            var observationsWithDeletdValues = getPrimaryObservations().filter(function(member){
                return !answerConcepts.some(function(answerConcept){ return member.value.uuid === answerConcept.uuid; });
            });
            observationsWithDeletdValues.forEach(removeObservation);
        }
    }

    Bahmni.ConceptSet.CompundObservationNode = function(compoundObservation, primaryMRSConcept, compoundObservationConcept, conceptConfig) {
        var conceptName = primaryMRSConcept.name.name;
        this.primaryConcept = mapConcept(primaryMRSConcept);
        this.compoundObservation = compoundObservation;
        this.conceptConfig = conceptConfig || {};
        this.showAbnormalIndicator =  this.conceptConfig.showAbnormalIndicator;
        this.isRequired = this.conceptConfig.required;
        this.label = conceptName;
        this.units = primaryMRSConcept.units;
        this.dataTypeName = primaryMRSConcept.datatype.name;
        this.hiAbsolute = primaryMRSConcept.hiAbsolute;
        this.lowAbsolute = primaryMRSConcept.lowAbsolute;
        this.possibleAnswers = primaryMRSConcept.answers;
        this.children = [];

        var compoundObservationWrapperClass = this.conceptConfig.multiselect ? MultiValueCompundObservation : SingleValueCompundObservation;
        this.compoundObservationWrapper = new compoundObservationWrapperClass(compoundObservation, this.primaryConcept, compoundObservationConcept);
        
        //TODO: Get rid of these properties
        this.primaryObservation = this.compoundObservationWrapper.primaryObservation;
        this.abnormalityObservation = this.compoundObservationWrapper.abnormalityObservation;

        var _value = this.compoundObservationWrapper.getValue();
        Object.defineProperty(this, 'value', {
            get: function() { return _value; },
            set: function(newValue) {
                _value = newValue;
                this.compoundObservationWrapper.setValue(newValue);                    
                this.onValueChanged();
            }
        });
    };

    Bahmni.ConceptSet.CompundObservationNode.create = function(compoundObservation, primaryConcept, compoundObservationConcept, conceptConfig) {
        return new this(compoundObservation, primaryConcept, compoundObservationConcept, conceptConfig);
    }

    //TODO: Remove this
    Bahmni.ConceptSet.CompundObservationNode.createNew = function(primaryConcept, compoundObservationConcept, conceptConfig) {
        var compoundObservation = {concept: mapConcept(compoundObservationConcept), groupMembers: []};
        return this.create(compoundObservation, primaryConcept, compoundObservationConcept, conceptConfig);
    }
})();


Bahmni.ConceptSet.CompundObservationNode.prototype = {
    getPossibleAnswers: function(){
        return this.possibleAnswers;
    },

    getConceptConfig: function() {
        return this.conceptConfig;
    },

    addChild: function(child) {
        return this.children.push(child);
    },

    isGroup: function () {
        return this.children.length > 0;
    },

    getControlType: function () {
        if (this.getConceptConfig().freeTextAutocomplete) return "freeTextAutocomplete";
        if (this._isHtml5InputDataType()) return "html5InputDataType";
        if (this._isText()) return "text";
        if (this._isCoded()) return this._getCodedControlType();
        return "unknown";
    },

    _getCodedControlType: function() {
        var conceptConfig = this.getConceptConfig();
        if(conceptConfig.autocomplete) return "autocomplete";
        if(conceptConfig.multiselect) return "multiselect";
        return "dropdown";
    },

    _isNumeric: function () {
        return this.dataTypeName === "Numeric";
    },

    _isText: function () {
        return this.dataTypeName === "Text";
    },

    _isCoded: function () {
        return this.dataTypeName === "Coded";
    },

    _isHtml5InputDataType: function () {
        return ['Date', 'Numeric'].indexOf(this.dataTypeName) != -1;
    },

    _isDateDataType: function () {
        return 'Date'.indexOf(this.dataTypeName) != -1;
    },

    validateNumericValue: function(){
        if(this.value) {
            var valueInRange = this.value < (this.hiAbsolute|| Infinity) && this.value > (this.lowAbsolute|| 0);
            this.abnormalityObservation.value = !valueInRange;
        } else {
            this.abnormalityObservation.value = undefined;
        }
    },

    onValueChanged: function () {
        if(this._isNumeric()){
            this.validateNumericValue();
        }
    },

    hasValue: function() {
        return this.value ? true : false;
    },

    atLeastOneValueSet: function() {
        if(this.isGroup()) {
            return this.children.some(function(childNode){ return childNode.atLeastOneValueSet(); })
        } else {
            return this.hasValue();
        }
    },

    isValid: function(checkRequiredFields) {
        if(this.isGroup()) return this._hasValidChildren(checkRequiredFields);
        if(checkRequiredFields && this.isRequired && !this.hasValue()) return false;
        if(this._isDateDataType()) return this._isValidDate();
        return true;
    },

    _hasValidChildren: function(checkRequiredFields) {
        return this.children.every(function(childNode){ return childNode.isValid(checkRequiredFields) });
    },

    _isValidDate: function () {
        if (!this.hasValue()) return true;
        var date = new Date(this.value);
        return date.getUTCFullYear() && date.getUTCFullYear().toString().length <= 4;
    }
};