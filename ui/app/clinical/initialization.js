'use strict';

angular.module('bahmni.clinical').factory('initialization',
    ['$rootScope', 'authenticator', 'appService', 'spinner', 'configurations', 'orderTypeService', 'offlineService', 'offlineDbService', 'androidDbService', 'mergeService', '$q', 'messagingService',
        function ($rootScope, authenticator, appService, spinner, configurations, orderTypeService, offlineService, offlineDbService, androidDbService, mergeService, $q, messagingService) {
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
                    if (appService.hasPrivilegeOf("app:clinical")) {
                        return $q.when(true);
                    }
                    messagingService.showMessage("error", Bahmni.Clinical.Constants.errorMessages.privilegeRequired);
                    return $q.reject();
                };

                var initApp = function () {
                    return appService.initApp('clinical', {
                        'app': true,
                        'extension': true
                    }, config, ["dashboard", "visit", "medication"]);
                };

                var loadFormConditionsIfOffline = function () {
                    var isOfflineApp = offlineService.isOfflineApp();
                    if (isOfflineApp) {
                        if (offlineService.isAndroidApp()) {
                            offlineDbService = androidDbService;
                        }
                        return offlineDbService.getConfig("clinical").then(function (config) {
                            var script = config.value['formConditions.js'];
                            eval(script); // eslint-disable-line no-eval
                        });
                    }
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
                    .then(loadFormConditionsIfOffline)
                    .then(mergeFormConditions)
                    .then(orderTypeService.loadAll));
            };
        }
    ]
);
