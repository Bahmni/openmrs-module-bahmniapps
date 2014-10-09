'use strict';

angular.module('bahmni.clinical')
    .controller('LatestVisitSummaryPrintController', ['$scope', '$rootScope', '$stateParams', 'visitActionsService', 'patientService', 'consultationInitialization', 'visitInitialization', 'messagingService',
        function ($scope, $rootScope, $stateParams, visitActionsService, patientService, consultationInitialization, visitInitialization, messagingService) {
            var printVisitSummary = function(patient) {
                consultationInitialization(patient.uuid).then(function() {
                    if($rootScope.visit) {
                        print($rootScope.visit);
                    } else if($rootScope.visits.length > 0) {
                        visitInitialization($rootScope.patient.uuid, $rootScope.visits[0].uuid).then(function() {
                            print($rootScope.visit);
                        })
                    } else {
                        messagingService.showMessage("error", "No Active visit found for this patient.");
                    }
                });
            };

            var print = function(visit, startDate) {
                visitActionsService.printVisitSummary($rootScope.patient, visit, visit.startDate);
                messagingService.showMessage("info", "Please close this tab.");
            };

            patientService.search($stateParams.patientId).then(function(response) {
                var results = response.data.pageOfResults;
                var patient = results.length > 0 ? results[0] : null;
                if(patient != null) {
                    printVisitSummary(patient);
                } else {
                    messagingService.showMessage("error", "No patient found for ID : " + $stateParams.patientId);
                }
            });
        }]);
