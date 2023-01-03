'use strict';

angular.module('bahmni.clinical')
    .directive('consultationConfirmOnExit', ['clinicalAppConfigService', 'messagingService', 'spinner', '$state',
        function (clinicalAppConfigService, messagingService, spinner, $state) {
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
                        var noOfMedications = 0;
                        if ($scope.consultation.newlyAddedTabTreatments && $scope.tabConfigName) {
                            noOfMedications = $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName].treatments.length;
                        }
                        var isConsultationFormDirty = noOfOrders > 0 || noOfMedications > 0 || ($scope[attrs.name] && $scope[attrs.name].$dirty);
                        if (isConsultationFormDirty) {
                            $state.dirtyConsultationForm = true;
                        }
                        if (outOfConsultationBoard && $state.dirtyConsultationForm) {
                            messagingService.showMessage('error', "{{'CONSULTATION_TAB_OBSERVATION_ERROR ' | translate }}");
                            event.preventDefault();
                            spinner.hide(next.spinnerToken);
                            $scope.$parent.$parent.$broadcast("event:changes-not-saved");
                        }
                    });
                }
            };
        }]);
