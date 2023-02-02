'use strict';

angular.module('bahmni.clinical')
    .directive('treatmentTable', function () {
        var controller = function ($scope, $rootScope, treatmentService, messagingService) {
            $scope.prescriptionEmailToggle = $rootScope.prescriptionEmailToggle;
            $scope.prescriptionSMSToggle = $rootScope.prescriptionSMSToggle;
            $scope.isOtherActiveSection = function (dateString) {
                return dateString === Bahmni.Clinical.Constants.otherActiveDrugOrders;
            };

            $scope.isDataPresent = function () {
                if ($scope.drugOrderSections && $scope.drugOrderSections.length == 0) {
                    return $scope.$emit("no-data-present-event") && false;
                }
                return true;
            };

            $scope.downloadPrescription = function (visitStartDate, visitUuid) {
                $rootScope.$broadcast("event:downloadPrescriptionFromDashboard", visitStartDate, visitUuid);
            };

            $scope.sendSMSForPrescription = function (visitUuid) {
                treatmentService.sendPrescriptionSMS(visitUuid).then(function (data) {
                    if (data.error) {
                        messagingService.showMessage("error", "MESSAGE_SENDING_SMS_FAILURE");
                    } else {
                        messagingService.showMessage("info", "MESSAGE_SENDING_SMS_SUCCESS");
                    }
                });
            };
        };

        return {
            templateUrl: "displaycontrols/treatmentData/views/treatmentTable.html",
            scope: {
                drugOrderSections: "=",
                params: "="
            },
            controller: controller
        };
    });
