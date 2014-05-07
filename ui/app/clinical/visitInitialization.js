'use strict';

angular.module('bahmni.clinical').factory('visitInitialization',
    ['$rootScope', '$q', 'encounterService', 'initialization', 'spinner',
    function ($rootScope, $q, encounterService, initialization, spinner) {
        return function(patientUuid, visitUuid) {

            var getVisit = function() {
                return encounterService.search(visitUuid).success(function (encounterTransactions) {
                    $rootScope.visit = Bahmni.Clinical.Visit.create(encounterTransactions, $rootScope.consultationNoteConcept, $rootScope.labOrderNotesConcept, $rootScope.encounterConfig, $rootScope.allTestsAndPanelsConcept);
                });
            }

            return spinner.forPromise(initialization.then(getVisit));
        }
    }]
);
