/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardTreatmentController', ['$scope', '$rootScope', 'ngDialog', 'visitActionsService', 'treatmentService',
        function ($scope, $rootScope, ngDialog, visitActionsService, treatmentService) {
            var treatmentConfigParams = $scope.dashboard.getSectionByType("treatment") || {};
            $scope.isEmailPresent = $scope.patient.email ? true : false;
            var patientParams = {"patientUuid": $scope.patient.uuid, "isEmailPresent": $scope.isEmailPresent};
            var sharePrescriptionToggles = {"prescriptionEmailToggle": $rootScope.prescriptionEmailToggle};
            var printParams = treatmentConfigParams.prescriptionPrint || {};
            printParams.locationName = $rootScope.facilityLocation.name;

            const printHeaderAttributes = $rootScope.facilityLocation.attributes.filter(function (attribute) {
                return attribute.display.includes('Print Header') && !attribute.voided;
            });
            printParams.locationAddress = printHeaderAttributes[0] ? printHeaderAttributes[0].display.split(":")[1].trim() : null;

            $scope.dashboardConfig = {};
            $scope.expandedViewConfig = {};
            _.extend($scope.dashboardConfig, treatmentConfigParams.dashboardConfig || {}, patientParams, sharePrescriptionToggles);
            _.extend($scope.expandedViewConfig, treatmentConfigParams.expandedViewConfig || {}, patientParams, sharePrescriptionToggles);

            $scope.openSummaryDialog = function () {
                ngDialog.open({
                    template: 'dashboard/views/dashboardSections/treatmentSummary.html',
                    params: $scope.expandedViewConfig,
                    className: "ngdialog-theme-default ng-dialog-all-details-page",
                    scope: $scope
                });
            };

            $scope.$on("event:sharePrescriptionsViaEmail", function (event, visitStartDate, visitUuid) {
                treatmentService.sharePrescriptions({patient: $scope.patient, visitDate: visitStartDate, visitUuid: visitUuid, printParams: printParams});
            });

            $scope.$on("event:downloadPrescriptionFromDashboard", function (event, visitStartDate, visitUuid) {
                visitActionsService.printPrescription($scope.patient, visitStartDate, visitUuid, printParams);
            });

            var cleanUpListener = $scope.$on('ngDialog.closing', function () {
                $("body").removeClass('ngdialog-open');
            });

            $scope.$on("$destroy", cleanUpListener);
        }]);

