'use strict';

angular.module('bahmni.common.patient')
    .directive('patientSummary', ['$translate', '$sce', function ($translate, $sce) {
        var link = function ($scope) {
            $scope.showPatientDetails = false;
            $scope.togglePatientDetails = function () {
                $scope.showPatientDetails = !$scope.showPatientDetails;
            };
            $scope.onImageClick = function () {
                if ($scope.onImageClickHandler) {
                    $scope.onImageClickHandler();
                }
            };

            $scope.calculateAge = function (birthDate) {
                if (!birthDate) return "";

                var DateUtil = Bahmni.Common.Util.DateUtil;
                var age = DateUtil.diffInYearsMonthsDays(birthDate, DateUtil.now());

                var ageInString = "";
                if (age.years) {
                    ageInString += age.years + " <span> " + $translate.instant("CLINICAL_YEARS_TRANSLATION_KEY") + " </span>";
                }
                if (age.months) {
                    // Only include months when the value is greater than 0
                    ageInString += " " + age.months + " <span> " + $translate.instant("CLINICAL_MONTHS_TRANSLATION_KEY") + " </span>";
                } else if (age.years && age.days) {
                    ageInString += " 0 <span> " + $translate.instant("CLINICAL_MONTHS_TRANSLATION_KEY") + " </span>";
                }
                if (age.days) {
                    ageInString += " " + age.days + " <span> " + $translate.instant("CLINICAL_DAYS_TRANSLATION_KEY") + " </span>";
                }

                return ageInString.trim();
            };

            $scope.computeAgeDisplay = function () {
                if (!$scope.patient || !$scope.patient.birthdate) return;
                $scope.displayAge = $sce.trustAsHtml($scope.calculateAge($scope.patient.birthdate));
            };

            // Initialize with current patient if available
            $scope.computeAgeDisplay();

            // Watch for future changes
            $scope.$watch('patient', function () {
                $scope.computeAgeDisplay();
            }, true);
        };

        return {
            restrict: 'E',
            templateUrl: '../common/patient/header/views/patientSummary.html',
            link: link,
            required: 'patient',
            scope: {
                patient: "=",
                bedDetails: "=",
                onImageClickHandler: "&"
            }
        };
    }]);
