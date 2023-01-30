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
                        var noOfOrders = 0;
                        var noOfMedications = 0;
                        var navigating = next.url.split("/")[1];
                        var allConsultationBoards = clinicalAppConfigService.getAllConsultationBoards();
                        var outOfConsultationBoard = true;
                        if ($scope.consultation) {
                            if ($scope.consultation.orders) {
                                noOfOrders = $scope.consultation.orders.length;
                            }
                            if ($scope.consultation.newlyAddedTabTreatments && $scope.tabConfigName) {
                                noOfMedications = $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName].treatments.length;
                            }
                        }

                        var isConsultationFormDirty = noOfOrders > 0 || noOfMedications > 0 || ($scope[attrs.name] && $scope[attrs.name].$dirty);
                        if (isConsultationFormDirty) {
                            $state.dirtyConsultationForm = true;
                        }
                        allConsultationBoards.map(function (board) {
                            var consultationLink = board.url.split("/")[0];
                            if (navigating.includes(consultationLink)) {
                                outOfConsultationBoard = false;
                            }
                        });

                        if (next.url.includes("/dashboard") && $state.params.patientUuid === current.patientUuid) {
                            outOfConsultationBoard = false;
                        }

                        if (outOfConsultationBoard && $state.dirtyConsultationForm) {
                            messagingService.showMessage('error', "{{'CONSULTATION_TAB_OBSERVATION_ERROR ' | translate }}");
                            event.preventDefault();
                            spinner.hide(next.spinnerToken);
                        }
                    });
                }
            };
        }]);
