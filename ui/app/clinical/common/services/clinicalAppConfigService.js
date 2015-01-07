'use strict';

angular.module('bahmni.clinical')
    .service('clinicalAppConfigService', ['appService', 'urlHelper', function (appService, urlHelper) {

        this.getTreatmentActionLink = function () {
            return appService.getAppDescriptor().getExtensions("org.bahmni.clinical.treatment.links", "link") || [];
        };

        this.getDrugOrderConfig = function () {
            return appService.getAppDescriptor().getConfigValue("drugOrder") || {};
        };

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

        this.getPatientDashBoardSectionByName = function (name) {
            return _.find(this.getAllPatientDashboardSections(), function (section) {
                return section.name === name;
            });
        };

        this.getDiseaseTemplateConfig = function () {
            return appService.getAppDescriptor().getConfigValue("templateSections") || [];
        };

        this.getVisitPageConfig = function () {
            return appService.getAppDescriptor().getConfigValue("visitPage") || {};
        };

        this.getPrintConfig = function () {
            return appService.getAppDescriptor().getConfigValue("printConfig") || {};
        };

        this.getConsultationBoardLink = function () {
            var allBoards = this.getAllConsultationBoards();
            var defaultBoard = _.find(allBoards, 'default');
            if (defaultBoard) {
                return urlHelper.getPatientUrl() + "/" + defaultBoard.url
            }
            return urlHelper.getConsultationUrl();
        };
    }]);