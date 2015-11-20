'use strict';

angular.module('bahmni.clinical').factory('initialization',
    ['$rootScope','authenticator', 'appService', 'spinner', 'configurations', 'orderTypeService',
        function ($rootScope, authenticator, appService, spinner, configurations, orderTypeService) {
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

                var initApp = function () {
                    return appService.initApp('clinical', {
                        'app': true,
                        'extension': true
                    }, config, ["dashboard", "visit"]);
                };

                var loadFormConditions = function () {
                    var baseUrl = appService.configBaseUrl();
                    Bahmni.Common.Util.DynamicResourceLoader.includeJs(baseUrl + 'clinical/formConditions.js');
                };

                return spinner.forPromise(authenticator.authenticateUser()
                    .then(initApp)
                    .then(loadConfigPromise)
                    .then(loadFormConditions)
                    .then(orderTypeService.loadAll()));
            };
        }
    ]
);
