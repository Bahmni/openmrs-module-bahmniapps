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
                        'defaultEncounterType'
                    ]).then(function () {
                        $rootScope.genderMap = configurations.genderMap();
                        $rootScope.relationshipTypeMap = configurations.relationshipTypeMap();
                        $rootScope.diagnosisStatus = (appService.getAppDescriptor().getConfig("diagnosisStatus") && appService.getAppDescriptor().getConfig("diagnosisStatus").value || "RULED OUT");
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

                var getLocationDetails = function () {
                    locationService.getAllByTag("Visit Location").then(function (response) {
                        $rootScope.locationName = response.data.results[0].name;
                        $rootScope.locationAddress = response.data.results[0].attributes[0] ? response.data.results[0].attributes[0].display.split(":")[1].trim() : null;
                    });
                };

                var mergeFormConditions = function () {
                    var formConditions = Bahmni.ConceptSet.FormConditions;
                    if (formConditions) {
                        formConditions.rules = mergeService.merge(formConditions.rules, formConditions.rulesOverride);
                    }
                };

                return spinner.forPromise(authenticator.authenticateUser()
                    .then(initApp)
                    .then(checkPrivilege)
                    .then(loadConfigPromise)
                    .then(getLocationDetails)
                    .then(mergeFormConditions)
                    .then(orderTypeService.loadAll));
            };
        }
    ]
);
