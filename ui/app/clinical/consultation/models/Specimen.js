'use strict';

Bahmni.Clinical.Specimen = function (specimen, allSamples) {
    var self = this;
    self.uuid = specimen && specimen.uuid;
    self.dateCollected = specimen && Bahmni.Common.Util.DateUtil.getDateWithoutTime(specimen.dateCollected);
    self.type = specimen && specimen.type;
    self.typeFreeText = specimen && specimen.typeFreeText;
    self.identifier = specimen && specimen.identifier;
    self.sample = specimen && specimen.sample && specimen.sample.additionalAttributes ? specimen.sample : {additionalAttributes: []};
    self.report = specimen && specimen.report && specimen.report.results ? specimen.report : {results: []};
    self.existingObs = specimen && specimen.existingObs;
    self.typeObservation = new Bahmni.ConceptSet.SpecimenTypeObservation(self, allSamples);

    var isDirtyRuleForFreeText = function () {
        return (self.type && self.type.name === "Other" && !self.typeFreeText);
    };

    var clearObservations = function (obs) {
        angular.forEach(obs, function (ob) {
            ob.value = undefined;
            clearObservations(ob.groupMembers);
        });
    };

    self.isDirty = function () {
        return (self.dateCollected && !self.type) ||
        (!self.dateCollected && !self.type && self.isAdditionalAttriburtesFilled()) ||
        (!self.dateCollected && self.type) ||
        (!self.dateCollected && !self.type && self.identifier) || isDirtyRuleForFreeText() ? true : false;
    };

    self.isEmpty = function () {
        return !self.dateCollected && !self.identifier && !self.type && !self.typeFreeText;
    };

    function hasResults () {
        return self && self.report && self.report.results && self.report.results.length > 0;
    }

    self.atLeastOneResult = function () {
        return hasResults() && !!self.report.results[0].value;
    };

    self.isDateCollectedDirty = function () {
        return !self.dateCollected && self.hasIllegalDateCollected;
    };

    self.isTypeDirty = function () {
        return !self.type && self.hasIllegalType;
    };

    self.isTypeFreeTextDirty = function () {
        return !self.typeFreeText && self.hasIllegalTypeFreeText;
    };

    self.isAdditionalAttriburtesFilled = function () {
        var additionalAttributes = self.sample && self.sample.additionalAttributes[0] && self.sample.additionalAttributes[0].groupMembers;
        for (var i in additionalAttributes) {
            if (additionalAttributes[i].value) {
                return true;
            }
        }
        return false;
    };

    self.isExistingSpecimen = function () {
        return self.uuid;
    };

    self.voidIfEmpty = function () {
        if (self.isEmpty() && self.isExistingSpecimen()) {
            self.setMandatoryFieldsBeforeSavingVoidedSpecimen();
            return true;
        }
        return false;
    };

    self.setMandatoryFieldsBeforeSavingVoidedSpecimen = function () {
        self.voided = true;
        self.dateCollected = self.typeObservation.dateCollected;
        self.type = self.typeObservation.type;
        clearObservations(self.sample.additionalAttributes);
        clearObservations(self.report.results);
    };
};
