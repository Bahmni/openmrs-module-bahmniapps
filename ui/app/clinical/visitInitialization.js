'use strict';

angular.module('bahmni.clinical').factory('visitInitialization',
    ['$rootScope', '$q', 'encounterService', 'clinicalConfigService', 'initialization', 'spinner', 'conceptSetUiConfigService',
    function ($rootScope, $q, encounterService, clinicalConfigService, initialization, spinner, conceptSetUiConfigService) {
        return function(patientUuid, visitUuid) {

            var getVisit = function() {
                return encounterService.search(visitUuid).then(function (encounterTransactionsResponse) {
                    var obsIgnoreList = clinicalConfigService.getObsIgnoreList();
                    $rootScope.visit = Bahmni.Clinical.Visit.create(encounterTransactionsResponse.data, $rootScope.consultationNoteConcept, $rootScope.labOrderNotesConcept, $rootScope.encounterConfig, $rootScope.allTestsAndPanelsConcept, obsIgnoreList, visitUuid, conceptSetUiConfigService.getConfig());
                });
            };

            return spinner.forPromise(initialization.then(getVisit));
        }
    }]
);
