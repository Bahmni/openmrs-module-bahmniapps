'use strict';

angular.module('bahmni.clinical')
    .service('clinicalAppConfigService', ['appService', 'urlHelper', '$stateParams', function (appService, urlHelper, $stateParams) {
        this.getTreatmentActionLink = function () {
            return appService.getAppDescriptor().getExtensions("org.bahmni.clinical.treatment.links", "link") || [];
        };

        this.getAllConceptsConfig = function () {
            return appService.getAppDescriptor().getConfigValue("conceptSetUI") || {};
        };

        this.getConceptConfig = function (name) {
            var config = appService.getAppDescriptor().getConfigValue("conceptSetUI") || {};
            return config[name];
        };

        this.getObsIgnoreList = function () {
            var baseObsIgnoreList = [Bahmni.Common.Constants.impressionConcept];
            var configuredObsIgnoreList = appService.getAppDescriptor().getConfigValue("obsIgnoreList") || [];
            return baseObsIgnoreList.concat(configuredObsIgnoreList);
        };

        this.getAllConsultationBoards = function () {
            return appService.getAppDescriptor().getExtensions("org.bahmni.clinical.consultation.board", "link");
        };

        this.getAllConceptSetExtensions = function (conceptSetGroupName) {
            return appService.getAppDescriptor().getExtensions("org.bahmni.clinical.conceptSetGroup." + conceptSetGroupName, "config");
        };

        this.getOtherInvestigationsMap = function () {
            return appService.getAppDescriptor().getConfig("otherInvestigationsMap");
        };

        this.getVisitPageConfig = function (configSection) {
            var visitSection = appService.getAppDescriptor().getConfigValue("visitPage") || {};
            return configSection ? visitSection[configSection] : visitSection;
        };

        this.getVisitConfig = function () {
            return appService.getAppDescriptor().getConfigForPage("visit");
        };

        this.getMedicationConfig = function () {
            return appService.getAppDescriptor().getConfigForPage('medication') || {};
        };

        this.getPrintConfig = function () {
            return appService.getAppDescriptor().getConfigValue("printConfig") || {};
        };

        this.getConsultationBoardLink = function () {
            var allBoards = this.getAllConsultationBoards();
            var defaultBoard = _.find(allBoards, 'default');
            if ($stateParams.programUuid) {
                var programParams = "?programUuid=" + $stateParams.programUuid +
                    "&enrollment=" + $stateParams.enrollment +
                    "&dateEnrolled=" + $stateParams.dateEnrolled +
                    "&dateCompleted=" + $stateParams.dateCompleted;
                return "/" + $stateParams.configName + urlHelper.getPatientUrl() + "/" + defaultBoard.url + programParams;
            } else if (defaultBoard) {
                return "/" + $stateParams.configName + urlHelper.getPatientUrl() + "/" + defaultBoard.url + "?encounterUuid=active";
            }
            return urlHelper.getConsultationUrl();
        };

        this.getDefaultVisitType = function () {
            return appService.getAppDescriptor().getConfigValue("defaultVisitType");
        };

        this.getVisitTypeForRetrospectiveEntries = function () {
            return appService.getAppDescriptor().getConfigValue("visitTypeForRetrospectiveEntries");
        };
    }]);
