'use strict';

angular.module('bahmni.clinical')
    .directive('treatmentChart', function () {
        var controller = function ($scope) {
            $scope.atLeastOneDrugForDay = function (day) {
                var atLeastOneDrugForDay = false;
                $scope.ipdDrugOrders.getIPDDrugs().forEach(function (drug) {
                    if (drug.isActiveOnDate(day.date)) {
                        atLeastOneDrugForDay = true;
                    }
                });
                return atLeastOneDrugForDay;
            };

            $scope.getVisitStopDateTime = function () {
                return $scope.visitSummary.stopDateTime || Bahmni.Common.Util.DateUtil.now();
            };
        };

        return {
            templateUrl: "displaycontrols/treatmentData/views/treatmentChart.html",
            scope: {
                ipdDrugOrders: "=",
                visitSummary: "=",
                params: "="
            },
            controller: controller
        };
    });
