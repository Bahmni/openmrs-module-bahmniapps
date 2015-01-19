'use strict';

angular.module('bahmni.clinical')
    .directive('treatmentTable', function () {

        var controller = function ($scope) {
            $scope.getDate = function (dateString) {
                var date = Bahmni.Common.Util.DateUtil.parse(dateString);
                return isNaN(date) ? dateString : date;
            }
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