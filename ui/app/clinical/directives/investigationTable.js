'use strict';

angular.module('bahmni.clinical')
    .directive('investigationTable', function () {
        var controller = function ($scope) {
            var defaultParams = {
                    noLabOrdersMessage: "No Lab Orders for this patient.",
                    showNormalLabResults: true,
                    showAccessionNotes: true,
                    title: "Lab Investigations"
                },
                hasAbnormalTests = function (labOrderResult) {
                    if (labOrderResult.isPanel) {
                        var hasAbnormal = false;
                        labOrderResult.tests.forEach(function (test) {
                            if (test.abnormal) {
                                hasAbnormal = true;
                                return;
                            }
                        });
                        return hasAbnormal;
                    }
                    return labOrderResult.abnormal;
                };

            $scope.params = angular.extend(defaultParams, $scope.params);

            $scope.hasLabOrders = function () {
                return $scope.accessions && $scope.accessions.length > 0;
            };

            $scope.shouldShowResults = function (labOrderResult) {
                return $scope.params.showNormalLabResults || hasAbnormalTests(labOrderResult)
            };

            $scope.toggle = function (item) {
                item.show = !item.show
            };

            $scope.getAccessionDetailsFrom = function(labOrderResults){
                var labResultLine = labOrderResults[0].isPanel?labOrderResults[0].tests[0]:labOrderResults[0];
                return {
                    accessionUuid:labResultLine.accessionUuid,
                    accessionDateTime : labResultLine.accessionDateTime,
                    accessionNotes:labResultLine.accessionNotes
                }
            };

            $scope.showAccessionNotes = function(labOrderResults) {
                return $scope.getAccessionDetailsFrom(labOrderResults).accessionNotes && $scope.params.showAccessionNotes;
            };
        };
        return {
            restrict: 'E',
            controller: controller,
            scope: {
                accessions: "=",
                params: "="
            },
            templateUrl: "views/displayControls/investigationTable.html"
        };
    });