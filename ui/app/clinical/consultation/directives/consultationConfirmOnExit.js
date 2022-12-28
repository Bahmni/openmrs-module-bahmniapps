'use strict';

angular.module('bahmni.clinical')
    .directive('consultationConfirmOnExit', ['clinicalAppConfigService', 'messagingService', 'spinner',
        function (clinicalAppConfigService, messagingService, spinner) {
        return {
            link: function ($scope, elem, attrs) {
                window.onbeforeunload = function () {
                    console.log("change");
                };
                $scope.$on('$stateChangeStart', function (event, next, current) {
                    var navigating = next.url.split("/")[1];
                    var allConsultationBoards = clinicalAppConfigService.getAllConsultationBoards();
                    var outOfConsultationBoard = true;
                    allConsultationBoards.map(function (board) {
                        var consultationLink = board.url.split("/")[0];
                        if (navigating.includes(consultationLink)) {
                            outOfConsultationBoard = false;
                        }
                    });
                    var noOfOrders = $scope.consultation.orders.length;
                    var noOfObservations = $scope.consultation.observations.length;
                    if (outOfConsultationBoard && (noOfOrders > 0 || noOfObservations > 0 || ($scope[attrs.name] && $scope[attrs.name].$dirty))) {
                        messagingService.showMessage('error', "{{'OBSERVATION_ERROR ' | translate }}");
                        event.preventDefault();
                        spinner.hide(next.spinnerToken);
                    }
                });
            }
        };
    }]);
