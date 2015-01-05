'use strict';

angular.module('bahmni.clinical').factory('visitInitialization',
    ['$rootScope', '$q', 'encounterService', 'clinicalAppConfigService', 'spinner', 'conceptSetUiConfigService', 'retrospectiveEntryService', 'configurations',
    function ($rootScope, $q, encounterService, clinicalAppConfigService, spinner, conceptSetUiConfigService, retrospectiveEntryService, configurations) {

        return function(patientUuid, visitUuid) {
            var getVisit = function() {
                return encounterService.search(visitUuid).then(function (encounterTransactionsResponse) {
                    var obsIgnoreList = clinicalAppConfigService.getObsIgnoreList();
                    $rootScope.visit = Bahmni.Clinical.Visit.create(encounterTransactionsResponse.data, 
                        configurations.consultationNoteConcept(), configurations.labOrderNotesConcept(), configurations.encounterConfig(),
                        configurations.allTestsAndPanelsConcept(), obsIgnoreList, visitUuid, conceptSetUiConfigService.getConfig(), retrospectiveEntryService.getRetrospectiveEntry().encounterDate);
                });
            };

            return getVisit();
        }
    }]
);
