'use strict';

angular.module('bahmni.clinical')
    .directive('diseaseTemplate', function () {

        var controller = function ($scope) {
            $scope.isDateNeeded = function (obsTemplate) {
                if (obsTemplate.conceptClass === Bahmni.Clinical.Constants.caseIntakeConceptClass) {
                    if (!$scope.dateFlag) {
                        return Bahmni.Clinical.Constants.dashboard;
                    }
                    return Bahmni.Clinical.Constants.dialog;
                }
                return Bahmni.Clinical.Constants.default;
            };

            $scope.isIntakeTemplate = function (obsTemplate) {
                return obsTemplate.conceptClass === Bahmni.Clinical.Constants.caseIntakeConceptClass;
            }
        };

        return {
            restrict: 'E',
            controller: controller,
            scope: {
                diseaseTemplate: "=template",
                patient: "=",
                dateFlag: "="
            },
            templateUrl: "dashboard/views/diseaseTemplate.html"
        };
    });