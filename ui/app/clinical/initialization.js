'use strict';

angular.module('bahmni.clinical').factory('initialization',
    ['authenticator', 'appService', 'spinner', 'configurations',
        function (authenticator, appService, spinner, configurations) {

            var loadConfigPromise = function() {
                return configurations.load([
                    'patientConfig',
                    'encounterConfig',
                    'consultationNoteConfig',
                    'labOrderNotesConfig',
                    'radiologyImpressionConfig',
                    'allTestsAndPanelsConcept',
                    'dosageFrequencyConfig',
                    'dosageInstructionConfig'
                ]);
            };

            var initApp = function () {
                return appService.initApp('clinical', {'app': true, 'extension': true });
            };

            return spinner.forPromise(authenticator.authenticateUser().then(initApp).then(loadConfigPromise));
        }
    ]
);
