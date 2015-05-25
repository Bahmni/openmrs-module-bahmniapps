'use strict';

angular.module('bahmni.clinical').factory('initialization',
    ['$rootScope','authenticator', 'appService', 'spinner', 'configurations',
        function ($rootScope, authenticator, appService, spinner, configurations) {

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
                    'genderMap'
                ]).then(function () {
                    $rootScope.genderMap = configurations.genderMap();
                });
            };

            var initApp = function () {
                return appService.initApp('clinical', {'app': true, 'extension': true },null,["dashboard","visit"]);
            };

            return spinner.forPromise(authenticator.authenticateUser().then(initApp).then(loadConfigPromise));
        }
    ]
);
