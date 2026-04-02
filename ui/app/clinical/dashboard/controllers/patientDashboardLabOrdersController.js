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
    .controller('PatientDashboardLabOrdersController', ['$scope', '$stateParams', '$rootScope', '$q', 'visitActionsService', 'allergyService', 'observationsService', 'orderService', 'treatmentService',
        function ($scope, $stateParams, $rootScope, $q, visitActionsService, allergyService, observationsService, orderService, treatmentService) {
            var labOrdersConfigParams = $scope.dashboard.getSectionByType("labOrders") || {};
            var patientParams = {"patientUuid": $scope.patient.uuid};
            $scope.dashboardConfig = {};
            $scope.expandedViewConfig = {};
            _.extend($scope.dashboardConfig, labOrdersConfigParams.dashboardConfig || {}, patientParams);
            _.extend($scope.expandedViewConfig, labOrdersConfigParams.expandedViewConfig || {}, patientParams);
            $scope.dialogData = {
                "patient": $scope.patient,
                "expandedViewConfig": $scope.expandedViewConfig
            };

            var enhancedPatient = angular.copy($scope.patient);

            // Fetch patient allergies
            allergyService.fetchAndProcessAllergies($scope.patient.uuid).then(function (allergies) {
                enhancedPatient.allergies = allergies;
            }).catch(function () {
                enhancedPatient.allergies = '';
            });

            // Fetch latest patient weight across all visits
            var weightPromise = observationsService.fetch(
                $scope.patient.uuid,
                [Bahmni.Common.Constants.weightConceptName],
                'latest',
                null,
                null, null, null, null
            ).then(function (response) {
                if (response.data && response.data.length > 0) {
                    enhancedPatient.weight = response.data[0].value;
                }
            }).catch(function () {});

            // Build print config from facility location and config
            var labResultsPrintConfig = labOrdersConfigParams.labResultsPrint || {};
            labResultsPrintConfig.locationAddress = $rootScope.facilityLocation.address5;

            // Fetch ordering provider details from Order API
            var fetchProvider = function (orderUuid) {
                return orderService.getOrderByUuid(orderUuid, 'custom:(orderer:(uuid,display,attributes:(value,attributeType:(display))))').then(function (response) {
                    var orderer = response.data.orderer;
                    if (orderer && orderer.uuid) {
                        var providerAttributesForPrint = labResultsPrintConfig.providerAttributesForPrint || [];
                        orderer.attributes = treatmentService.getOrderedProviderAttributesForPrint(
                            orderer.attributes, providerAttributesForPrint
                        ) || [];
                        return orderer;
                    }
                    return $rootScope.currentProvider || {};
                }).catch(function () {
                    return $rootScope.currentProvider || {};
                });
            };

            // Wait for weight and provider, then trigger PDF download
            $scope.$on("event:downloadLabResultsFromDashboard", function (event, labOrderResults, accessionDateTime, accessionUuid) {
                var firstResult = labOrderResults[0].isPanel ? labOrderResults[0].tests[0] : labOrderResults[0];
                var orderUuid = firstResult.orderUuid;
                var providerPromise = orderUuid ? fetchProvider(orderUuid) : $q.when($rootScope.currentProvider || {});
                $q.all([weightPromise, providerPromise]).then(function (results) {
                    var printConfig = angular.copy(labResultsPrintConfig);
                    printConfig.orderer = results[1];
                    visitActionsService.downloadLabResults(enhancedPatient, labOrderResults, accessionDateTime, accessionUuid, printConfig);
                });
            });
        }]);
