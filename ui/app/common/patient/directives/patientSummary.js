'use strict';

angular.module('bahmni.common.patient')
    .directive('patientSummary', ['$translate', function ($translate) {
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

            function calculateAge (birthDate) {
                if (!birthDate) return "";

                var DateUtil = Bahmni.Common.Util.DateUtil;
                var age = DateUtil.diffInYearsMonthsDays(birthDate, DateUtil.now());

                var ageInString = "";
                if (age.years) {
                    ageInString += age.years + " <span> " + $translate.instant("CLINICAL_YEARS_TRANSLATION_KEY") + " </span>";
                }
                if (age.months) {
                    ageInString += " " + age.months + " <span> " + $translate.instant("CLINICAL_MONTHS_TRANSLATION_KEY") + " </span>";
                }
                if (age.days) {
                    ageInString += " " + age.days + " <span> " + $translate.instant("CLINICAL_DAYS_TRANSLATION_KEY") + " </span>";
                }

                return ageInString.trim();
            }

            function computeAgeDisplay () {
                if (!$scope.patient || !$scope.patient.birthdate) return;
                $scope.displayAge = calculateAge($scope.patient.birthdate);
            }

            $scope.$watch('patient', computeAgeDisplay);
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
