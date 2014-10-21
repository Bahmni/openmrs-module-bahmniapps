'use strict';

angular.module('bahmni.clinical')
    .controller('LatestPrescriptionPrintController', ['$scope', '$rootScope', '$stateParams', 'visitActionsService', 
        'visitInitialization', 'messagingService',
        function ($scope, $rootScope, $stateParams, visitActionsService, visitInitialization, messagingService) {
            var print = function(visit, startDate) {
                visitActionsService.printPrescription($rootScope.patient, visit, visit.startDate);
                messagingService.showMessage("info", "Please close this tab.");
            };

            if($rootScope.visit) {
                print($rootScope.visit);
            } else if($rootScope.visits.length > 0) {
                visitInitialization($rootScope.patient.uuid, $rootScope.visits[0].uuid).then(function() {
                    print($rootScope.visit);
                })
            } else {
                messagingService.showMessage("error", "No Active visit found for this patient.");
            }
        }]);
