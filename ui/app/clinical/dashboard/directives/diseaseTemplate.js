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
                    if ($scope.showTimeForProgress) {
                        showTime = true;
                    }
                }
                return {
                    showDate: showDate,
                    showTime: showTime
                };
            };

            $scope.isIntakeTemplate = function (obsTemplate) {
                return obsTemplate.conceptClass === Bahmni.Clinical.Constants.caseIntakeConceptClass;
            };

            $scope.showGroupDateTime = $scope.config.showGroupDateTime !== false;
        };

        return {
            restrict: 'E',
            controller: controller,
            scope: {
                diseaseTemplate: "=template",
                config: "=",
                patient: "=",
                showDateTimeForIntake: "=",
                showTimeForProgress: "=",
                sectionId: "="
            },
            templateUrl: "dashboard/views/diseaseTemplate.html"
        };
    });
