'use strict';

angular.module('bahmni.clinical').factory('initialization',
    ['$rootScope', 'authenticator', 'appService', 'spinner', 'configurations', 'orderTypeService', 'mergeService', '$q', 'messagingService', 'locationService',
        function ($rootScope, authenticator, appService, spinner, configurations, orderTypeService, mergeService, $q, messagingService, locationService) {
            return function (config) {
                var loadConfigPromise = function () {
                    return configurations.load([
                        'patientConfig',
                        'encounterConfig',
                        'consultationNoteConfig',
                        'labOrderNotesConfig',
                        'radiologyImpressionConfig',
                        'allTestsAndPanelsConcept',
                        'dosageFrequencyConfig',
                        'dosageInstructionConfig',
                        'stoppedOrderReasonConfig',
                        'genderMap',
                        'relationshipTypeMap',
                        'defaultEncounterType',
                        'prescriptionSMSToggle',
                        'prescriptionEmailToggle'
                    ]).then(function () {
                        $rootScope.genderMap = configurations.genderMap();
                        $rootScope.relationshipTypeMap = configurations.relationshipTypeMap();
                        $rootScope.diagnosisStatus = (appService.getAppDescriptor().getConfig("diagnosisStatus") && appService.getAppDescriptor().getConfig("diagnosisStatus").value || "RULED OUT");
                        $rootScope.prescriptionSMSToggle = configurations.prescriptionSMSToggle();
                        $rootScope.prescriptionEmailToggle = configurations.prescriptionEmailToggle();
                    });
                };

                var checkPrivilege = function () {
                    return appService.checkPrivilege("app:clinical");
                };

                var initApp = function () {
                    return appService.initApp('clinical', {
                        'app': true,
                        'extension': true
                    }, config, ["dashboard", "visit", "medication"]);
                };

                var mergeFormConditions = function () {
                    var formConditions = Bahmni.ConceptSet.FormConditions;
                    if (formConditions) {
                        formConditions.rules = mergeService.merge(formConditions.rules, formConditions.rulesOverride);
                    }
                };

                var loggedInLocation = function () {
                    return locationService.getLoggedInLocation().then(function (location) {
                        $rootScope.loggedInLocation = location;
                    });
                };

                return spinner.forPromise(authenticator.authenticateUser()
                    .then(initApp)
                    .then(checkPrivilege)
                    .then(loadConfigPromise)
                    .then(mergeFormConditions)
                    .then(loggedInLocation)
                    .then(orderTypeService.loadAll));
            };
        }
    ]
);
