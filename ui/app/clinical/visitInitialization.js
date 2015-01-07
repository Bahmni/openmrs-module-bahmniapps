'use strict';

angular.module('bahmni.clinical').factory('visitInitialization',
    ['encounterService', 'clinicalAppConfigService', 'conceptSetUiConfigService', 'retrospectiveEntryService', 'configurations',
        function (encounterService, clinicalAppConfigService, conceptSetUiConfigService, retrospectiveEntryService, configurations) {

            return function (visitUuid) {
                var getVisit = function () {
                    return encounterService.search(visitUuid).then(function (encounterTransactionsResponse) {
                        var obsIgnoreList = clinicalAppConfigService.getObsIgnoreList();
                        return Bahmni.Clinical.Visit.create(encounterTransactionsResponse.data,
                            configurations.consultationNoteConcept(), configurations.labOrderNotesConcept(), configurations.encounterConfig(),
                            configurations.allTestsAndPanelsConcept(), obsIgnoreList, visitUuid, conceptSetUiConfigService.getConfig(), retrospectiveEntryService.getRetrospectiveEntry().encounterDate);
                    });
                };

                return getVisit();
            }
        }]
);
