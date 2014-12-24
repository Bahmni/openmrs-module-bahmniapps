'use strict';

angular.module('bahmni.clinical').factory('visitInitialization',
    ['$rootScope', '$q', 'encounterService', 'clinicalAppConfigService', 'initialization', 'spinner', 'conceptSetUiConfigService', 
        'configurations',
    function ($rootScope, $q, encounterService, clinicalAppConfigService, initialization, spinner, conceptSetUiConfigService, configurations) {
        return function(patientUuid, visitUuid) {

            var getVisit = function() {
                return encounterService.search(visitUuid).then(function (encounterTransactionsResponse) {
                    var obsIgnoreList = clinicalAppConfigService.getObsIgnoreList();
                    $rootScope.visit = Bahmni.Clinical.Visit.create(encounterTransactionsResponse.data, 
                        configurations.consultationNoteConcept(), configurations.labOrderNotesConcept(), configurations.encounterConfig(),
                        configurations.allTestsAndPanelsConcept(), obsIgnoreList, visitUuid, conceptSetUiConfigService.getConfig());
                });
            };

            return spinner.forPromise(initialization.then(getVisit));
        }
    }]
);
