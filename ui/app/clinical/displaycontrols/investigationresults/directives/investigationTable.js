'use strict';

angular.module('bahmni.clinical')
    .directive('investigationTable', function () {
        var controller = function ($scope) {
            var defaultParams = {
                    noLabOrdersMessage: "NO_LAB_ORDERS_FOR_PATIENT_MESSAGE_KEY",
                    showNormalLabResults: true,
                    showAccessionNotes: true,
                    title: "Lab Investigations",
                    translationKey: "LAB_INVESTIGATIONS_KEY"
                },
                hasAbnormalTests = function (labOrderResult) {
                    if (labOrderResult.isPanel) {
                        var hasAbnormal = false;
                        labOrderResult.tests.forEach(function (test) {
                            if (test.abnormal) {
                                hasAbnormal = true;
                            }
                        });
                        return hasAbnormal;
                    }
                    return labOrderResult.abnormal;
                };

            $scope.params = angular.extend(defaultParams, $scope.params);

            $scope.hasLabOrders = function () {
                if ($scope.accessions && $scope.accessions.length > 0) return true;
                return $scope.$emit("no-data-present-event") && false;
            };

            $scope.shouldShowResults = function (labOrderResult) {
                return $scope.params.showNormalLabResults || hasAbnormalTests(labOrderResult);
            };

            $scope.toggle = function (item) {
                event.stopPropagation();
                item.show = !item.show;
            };

            $scope.getAccessionDetailsFrom = function (labOrderResults) {
                var labResultLine = labOrderResults[0].isPanel ? labOrderResults[0].tests[0] : labOrderResults[0];
                return {
                    accessionUuid: labResultLine.accessionUuid,
                    accessionDateTime: labResultLine.accessionDateTime,
                    accessionNotes: labResultLine.accessionNotes
                };
            };

            $scope.toggleAccession = function (labOrderResults) {
                labOrderResults.isOpen = !labOrderResults.isOpen;
            };

            $scope.showAccessionNotes = function (labOrderResults) {
                return $scope.getAccessionDetailsFrom(labOrderResults).accessionNotes && $scope.params.showAccessionNotes;
            };

            $scope.$watch('accessions', function () {
                if ($scope.accessions && $scope.accessions[0]) {
                    $scope.accessions[0].isOpen = true;
                }
            });
        };
        return {
            restrict: 'E',
            controller: controller,
            scope: {
                accessions: "=",
                params: "="
            },
            templateUrl: "displaycontrols/investigationresults/views/investigationTable.html"
        };
    });
