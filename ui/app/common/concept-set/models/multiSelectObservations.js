'use strict';

Bahmni.ConceptSet.MultiSelectObservations = function (conceptSetConfig) {
    var self = this;
    this.multiSelectObservationsMap = {};

    this.map = function (memberOfCollection) {
        memberOfCollection.forEach(function (member) {
            if (isMultiSelectable(member.concept, conceptSetConfig)) {
                add(member.concept, member, memberOfCollection);
            }
        });
        insertMultiSelectObsInExistingOrder(memberOfCollection);
    };

    var isMultiSelectable = function (concept, conceptSetConfig) {
        return conceptSetConfig[concept.name] && conceptSetConfig[concept.name].multiSelect;
    };

    var insertMultiSelectObsInExistingOrder = function (memberOfCollection) {
        getAll().forEach(function (multiObs) {
            var index = _.findIndex(memberOfCollection, function (member) {
                return member.concept.name === multiObs.concept.name;
            });
            memberOfCollection.splice(index, 0, multiObs);
        });
    };

    var add = function (concept, obs, memberOfCollection) {
        var conceptName = concept.name.name || concept.name;
        self.multiSelectObservationsMap[conceptName] = self.multiSelectObservationsMap[conceptName] || new Bahmni.ConceptSet.MultiSelectObservation(concept, memberOfCollection, conceptSetConfig);
        self.multiSelectObservationsMap[conceptName].add(obs);
    };

    var getAll = function () {
        return _.values(self.multiSelectObservationsMap);
    };
};

Bahmni.ConceptSet.MultiSelectObservation = function (concept, memberOfCollection, conceptSetConfig) {
    var self = this;
    this.label = concept.shortName || concept.name;
    this.isMultiSelect = true;
    this.selectedObs = {};
    this.concept = concept;
    this.concept.answers = this.concept.answers || [];
    this.groupMembers = [];
    this.provider = null;
    this.observationDateTime = "";
    this.conceptUIConfig = conceptSetConfig[this.concept.name] || {};

    this.possibleAnswers = self.concept.answers.map(function (answer) {
        var cloned = _.cloneDeep(answer);
        if (answer.name.name) {
            cloned.name = answer.name.name;
        }
        return cloned;
    });

    this.getPossibleAnswers = function () {
        return this.possibleAnswers;
    };

    this.cloneNew = function () {
        var clone = new Bahmni.ConceptSet.MultiSelectObservation(concept, memberOfCollection, conceptSetConfig);
        clone.disabled = this.disabled;
        return clone;
    };

    this.add = function (obs) {
        if (obs.value) {
            self.selectedObs[obs.value.name] = obs;

            if (!self.provider) {
                self.provider = self.selectedObs[obs.value.name].provider;
            }
            var currentObservationDateTime = self.selectedObs[obs.value.name].observationDateTime;
            if (self.observationDateTime < currentObservationDateTime) {
                self.observationDateTime = currentObservationDateTime;
            }
        }
        obs.hidden = true;
    };

    this.isComputedAndEditable = function () {
        return this.concept.conceptClass === "Computed/Editable";
    };

    this.hasValueOf = function (answer) {
        return self.selectedObs[answer.name] && !self.selectedObs[answer.name].voided;
    };

    this.toggleSelection = function (answer) {
        if (self.hasValueOf(answer)) {
            unselectAnswer(answer);
        } else {
            self.selectAnswer(answer);
        }
    };

    this.isFormElement = function () {
        return true;
    };

    this.getControlType = function () {
        var conceptConfig = this.getConceptUIConfig();
        if (this.isCoded() && conceptConfig.autocomplete == true && conceptConfig.multiSelect == true) { return "autocompleteMultiSelect"; } else if (conceptConfig.autocomplete == true) {
            return "autocomplete";
        }
        return "buttonselect";
    };

    this.atLeastOneValueSet = function () {
        var obsValue = _.filter(this.selectedObs, function (obs) {
            return obs.value;
        });
        return !_.isEmpty(obsValue);
    };

    this.hasValue = function () {
        return !_.isEmpty(this.selectedObs);
    };

    this.hasNonVoidedValue = function () {
        var hasNonVoidedValue = false;
        if (this.hasValue()) {
            angular.forEach(this.selectedObs, function (obs) {
                if (!obs.voided) {
                    hasNonVoidedValue = true;
                }
            });
        }
        return hasNonVoidedValue;
    };

    this.isValid = function (checkRequiredFields, conceptSetRequired) {
        if (this.error) {
            return false;
        }
        if (checkRequiredFields) {
            if (conceptSetRequired && this.isRequired() && !this.hasNonVoidedValue()) {
                return false;
            }
            if (this.isRequired() && !this.hasNonVoidedValue()) {
                return false;
            }
        }
        return true;
    };

    this.canHaveComment = function () {
        return false;
    };

    this.getConceptUIConfig = function () {
        return this.conceptUIConfig || {};
    };

    this.canAddMore = function () {
        return this.getConceptUIConfig().allowAddMore == true;
    };

    this.isRequired = function () {
        this.disabled = this.disabled ? this.disabled : false;
        return this.getConceptUIConfig().required === true && this.disabled === false;
    };

    var createObsFrom = function (answer) {
        var obs = newObservation(concept, answer, conceptSetConfig);
        memberOfCollection.push(obs);
        return obs;
    };

    var removeObsFrom = function (answer) {
        var obs = newObservation(concept, answer, conceptSetConfig);
        _.remove(memberOfCollection, function (member) {
            if (member.value) {
                return obs.value.displayString == member.value.displayString;
            }
            return false;
        });
    };

    this.selectAnswer = function (answer) {
        var obs = self.selectedObs[answer.name];
        if (obs) {
            obs.value = answer;
            obs.voided = false;
        } else {
            obs = createObsFrom((answer));
            self.add(obs);
        }
    };

    var unselectAnswer = function (answer) {
        var obs = self.selectedObs[answer.name];
        if (obs && obs.uuid) {
            obs.value = null;
            obs.voided = true;
        } else {
            removeObsFrom(answer);
            delete self.selectedObs[answer.name];
        }
    };

    var newObservation = function (concept, value, conceptSetConfig) {
        var observation = buildObservation(concept);
        return new Bahmni.ConceptSet.Observation(observation, {value: value}, conceptSetConfig, []);
    };

    var buildObservation = function (concept) {
        return { concept: concept, units: concept.units, label: concept.shortName || concept.name, possibleAnswers: self.concept.answers, groupMembers: [], comment: null};
    };

    this.getValues = function () {
        var values = [];
        _.values(self.selectedObs).forEach(function (obs) {
            if (obs.value) {
                values.push(obs.value.shortName || obs.value.name);
            }
        });
        return values;
    };

    this.isComputed = function () {
        return this.concept.conceptClass === "Computed";
    };

    this.getDataTypeName = function () {
        return this.concept.dataType;
    };

    this._isDateTimeDataType = function () {
        return this.getDataTypeName() === "Datetime";
    };

    this.isNumeric = function () {
        return this.getDataTypeName() === "Numeric";
    };

    this.isText = function () {
        return this.getDataTypeName() === "Text";
    };

    this.isCoded = function () {
        return this.getDataTypeName() === "Coded";
    };
};
