'use strict';

angular.module('bahmni.clinical')
    .service('clinicalConfigService', ['appService', function (appService) {

        this.getAllConceptsConfig = function () {
            return appService.getAppDescriptor().getConfigValue("conceptSetUI") || {};
        };

        this.getConceptConfig = function (name) {
            var config = appService.getAppDescriptor().getConfigValue("conceptSetUI") || {};
            return config[name];
        };

        this.getObsIgnoreList = function () {
            var baseObsIgnoreList = [Bahmni.Common.Constants.impressionConcept]
            var configuredObsIgnoreList = appService.getAppDescriptor().getConfigValue("obsIgnoreList") || [];
            return baseObsIgnoreList.concat(configuredObsIgnoreList);
        };

        this.getAllConsultationBoards = function () {
            return appService.getAppDescriptor().getExtensions("org.bahmni.clinical.consultation.board", "link");
        };

        this.getAllConceptSetExtensions = function (conceptSetGroupName) {
            return appService.getAppDescriptor().getExtensions("org.bahmni.clinical.conceptSetGroup." + conceptSetGroupName, "config")
        };

        this.getAllPatientDashboardSections = function () {
            return appService.getAppDescriptor().getConfigValue("patientDashboardSections") || {};
        };
        
        this.getOtherInvestigationsMap = function () {
            return appService.getAppDescriptor().getConfig("otherInvestigationsMap");  
        };

    }]);