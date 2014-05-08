'use strict';

angular.module('bahmni.clinical').factory('visitInitialization',
    ['$rootScope', '$q', 'encounterService', 'appService', 'initialization', 'spinner',
    function ($rootScope, $q, encounterService, appService, initialization, spinner) {
        return function(patientUuid, visitUuid) {

            var getVisit = function() {
                return encounterService.search(visitUuid).success(function (encounterTransactions) {
                    var obsIgnoreList = appService.getAppDescriptor().getConfig("obsIgnoreList").value || {};
                    $rootScope.visit = Bahmni.Clinical.Visit.create(encounterTransactions, $rootScope.consultationNoteConcept, $rootScope.labOrderNotesConcept, $rootScope.encounterConfig, $rootScope.allTestsAndPanelsConcept, obsIgnoreList, visitUuid);
                });
            }

            return spinner.forPromise(initialization.then(getVisit));
        }
    }]
);
