'use strict';

angular.module('bahmni.clinical')
    .directive('diseaseTemplate', function () {

        var controller = function ($scope) {

            $scope.dateTimeDisplayConfig = function (obsTemplate) {
                var showDate = false;
                var showTime = false;
                if (obsTemplate.conceptClass === Bahmni.Clinical.Constants.caseIntakeConceptClass) {
                    if ($scope.showDateTimeForIntake) {
                        showDate = true;
                        showTime = true;
                    }
                } else {
                    if ($scope.showTimeForProgress)
                        showTime = true;
                }
                console.log("date", showDate)
                console.log("time", showTime)
                return {
                    showDate: showDate,
                    showTime: showTime
                }
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
                config: "=",
                patient: "=",
                showDateTimeForIntake: "=",
                showTimeForProgress: "="
            },
            templateUrl: "dashboard/views/diseaseTemplate.html"
        };
    });