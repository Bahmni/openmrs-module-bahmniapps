'use strict';

angular.module('bahmni.common.config')
    .service('configurations', ['configurationService', function (configurationService) {

        this.configs = {};

        this.load = function (configNames) {
            var self = this;
            return configurationService.getConfigurations(_.difference(configNames, Object.keys(this.configs))).then(function (configurations) {
                angular.extend(self.configs, configurations);
            });
        };

        this.dosageInstructionConfig = function () {
            return this.configs.dosageInstructionConfig || [];
        };

        this.dosageFrequencyConfig = function () {
            return this.configs.dosageFrequencyConfig || [];
        };

        this.allTestsAndPanelsConcept = function () {
            return this.configs.allTestsAndPanelsConcept.results[0] || [];
        };

        this.impressionConcept = function () {
            return this.configs.radiologyImpressionConfig.results[0] || [];
        };

        this.labOrderNotesConcept = function () {
            return this.configs.labOrderNotesConfig.results[0] || [];
        };

        this.consultationNoteConcept = function () {
            return this.configs.consultationNoteConfig.results[0] || [];
        };

        this.patientConfig = function () {
            return this.configs.patientConfig || {};
        };

        this.encounterConfig = function () {
            return angular.extend(new EncounterConfig(), this.configs.encounterConfig || []);
        };

        this.patientAttributesConfig = function() {
            return this.configs.patientAttributesConfig.results;
        };

        this.identifierSourceConfig = function() {
            return this.configs.identifierSourceConfig;
        };

        this.genderMap = function() {
            return this.configs.genderMap;
        };

        this.addressLevels = function() {
            return this.configs.addressLevels;
        };

        this.relationshipTypes = function() {
            return this.configs.relationshipTypeConfig.results || [];
        };

        this.relationshipTypeMap = function() {
            return this.configs.relationshipTypeMap || {};
        };

        this.defaultEncounterType = function () {
            return this.configs.defaultEncounterType;
        };

    }]);