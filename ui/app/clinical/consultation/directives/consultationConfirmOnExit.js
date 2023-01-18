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
                        var noOfOrders = $scope.consultation.orders.length;
                        var noOfMedications = 0;
                        if ($scope.consultation.newlyAddedTabTreatments && $scope.tabConfigName) {
                            noOfMedications = $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName].treatments.length;
                        }
                        var isConsultationFormDirty = noOfOrders > 0 || noOfMedications > 0 || ($scope[attrs.name] && $scope[attrs.name].$dirty);
                        if (isConsultationFormDirty) {
                            $state.dirtyConsultationForm = true;
                        }
                    });
                }
            };
        }]);
