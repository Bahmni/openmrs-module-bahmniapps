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
                        'prescriptionEmailToggle',
                        'quickLogoutComboKey',
                        'contextCookieExpirationTimeInMinutes'
                    ]).then(function () {
                        $rootScope.genderMap = configurations.genderMap();
                        $rootScope.relationshipTypeMap = configurations.relationshipTypeMap();
                        $rootScope.diagnosisStatus = (appService.getAppDescriptor().getConfig("diagnosisStatus") && appService.getAppDescriptor().getConfig("diagnosisStatus").value || "RULED OUT");
                        $rootScope.prescriptionEmailToggle = configurations.prescriptionEmailToggle();
                        $rootScope.quickLogoutComboKey = configurations.quickLogoutComboKey() || 'Escape';
                        $rootScope.cookieExpiryTime = configurations.contextCookieExpirationTimeInMinutes() || 0;
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

                var facilityLocation = function () {
                    return locationService.getFacilityVisitLocation().then(function (response) {
                        if (response.uuid) {
                            locationService.getByUuid(response.uuid).then(function (location) {
                                $rootScope.facilityLocation = location;
                            });
                        } else {
                            locationService.getLoggedInLocation().then(function (location) {
                                $rootScope.facilityLocation = location;
                            });
                        }
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
                    .then(facilityLocation)
                    .then(mergeFormConditions)
                    .then(orderTypeService.loadAll));
            };
        }
    ]
);
