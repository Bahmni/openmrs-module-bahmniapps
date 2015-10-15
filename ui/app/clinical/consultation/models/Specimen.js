'use strict';

Bahmni.Clinical.Specimen = function (specimen) {
    var self = this;
    self.dateCollected = specimen && specimen.dateCollected;
    self.type = specimen && specimen.type;
    self.identifier = specimen && specimen.identifier;
    self.sample = specimen && specimen.sample || {additionalAttributes: []};
    self.report = specimen && specimen.report || {results: []};
    self.existingObs = specimen && specimen.existingObs;

    self.isDirty = function () {
        return (self.dateCollected && !self.type) || (!self.dateCollected && self.type) ? true : false
    };

    self.isEmpty = function () {
        return !self.dateCollected && ! self.identifier && !self.type;
    };

};