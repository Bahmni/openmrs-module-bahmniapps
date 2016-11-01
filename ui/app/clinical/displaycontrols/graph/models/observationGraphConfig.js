(function () {
    'use strict';

    Bahmni = Bahmni || {};
    Bahmni.Clinical = Bahmni.Clinical || {};

    Bahmni.Clinical.ObservationGraphConfig = function (config) {
        angular.extend(this, config);
        if (this.shouldDrawReferenceLines()) {
            this.xAxisConcept = Bahmni.Clinical.Constants.concepts.age;
        }
    };

    var OBSERVATION_DATETIME = "observationdatetime",
        configPrototype = Bahmni.Clinical.ObservationGraphConfig.prototype;

    configPrototype.validate = function (title) {
        if (!this.yAxisConcepts || this.yAxisConcepts.length === 0) {
            throw new Error("y axis not defined for graph: " + title);
        }
        if (!this.xAxisConcept && !this.shouldDrawReferenceLines()) {
            throw new Error("x axis not defined for graph: " + title);
        }
    };

    configPrototype.displayForConcept = function () {
        return !(this.displayForAge() || this.displayForObservationDateTime());
    };

    configPrototype.displayForAge = function () {
        return this.xAxisConcept.toLowerCase() === Bahmni.Clinical.Constants.concepts.age.toLowerCase();
    };

    configPrototype.displayForObservationDateTime = function () {
        return this.xAxisConcept.toLowerCase() === OBSERVATION_DATETIME;
    };

    configPrototype.getAllConcepts = function () {
        var concepts = this.yAxisConcepts.slice(0);

        if (this.displayForConcept()) {
            concepts.push(this.xAxisConcept);
        }

        return concepts;
    };

    configPrototype.shouldDrawReferenceLines = function () {
        return this.referenceData !== undefined && this.yAxisConcepts && this.yAxisConcepts.length === 1;
    };

    configPrototype.getReferenceDataFileName = function () {
        return this.referenceData;
    };
})();
