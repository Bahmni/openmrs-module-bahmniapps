(function () {
    'use strict';

    Bahmni = Bahmni || {};
    Bahmni.Clinical = Bahmni.Clinical || {};

    Bahmni.Clinical.ObservationGraphConfig = function (config) {
        angular.extend(this, config);
        if(this.hasReferenceData()) {
            this.xAxisConcept = Bahmni.Clinical.Constants.concepts.age;
        }
    };

    var OBSERVATION_DATETIME = "observationdatetime",
        configPrototype = Bahmni.Clinical.ObservationGraphConfig.prototype;

    configPrototype.isValid = function() {
        if (!this.xAxisConcept) {
            console.error("x axis not defined for graph");
            return false;
        }
        if (!this.yAxisConcepts || this.yAxisConcepts.length === 0) {
            console.error ("y axis not defined for graph");
            return false;
        }
        return true;
    };

    configPrototype.displayForConcept = function() {
        return !(this.displayForAge() || this.displayForObservationDateTime());
    };

    configPrototype.displayForAge = function() {
        return this.xAxisConcept.toLowerCase() === Bahmni.Clinical.Constants.concepts.age.toLowerCase();
    };

    configPrototype.displayForObservationDateTime = function() {
        return this.xAxisConcept.toLowerCase() === OBSERVATION_DATETIME;
    };

    configPrototype.getAllConcepts = function() {
        var concepts = this.yAxisConcepts.slice(0);

        if (this.displayForConcept()) {
            concepts.push(this.xAxisConcept);
        }

        return concepts;
    };

    configPrototype.hasReferenceData = function() {
      return this.referenceData != undefined;
    };

    configPrototype.getReferenceDataFileName = function() {
        return this.referenceData;
    };

})();