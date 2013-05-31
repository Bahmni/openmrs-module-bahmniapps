'use strict';

angular.module('opd.navigation', [])
    .controller('NavigationController', ['$scope', '$location', '$route', function ($scope, $location, $route) {
        $scope.mainDisplayText = "Consultation";
        $scope.buttonClass = "button"
        $scope.blank = function () {
            return $location.url("/blank");
        }

        $scope.treatment = function () {
            return buttonClickAction("treatment",false);
        }

        $scope.investigation = function () {
            return buttonClickAction("investigation",false);
        }

        $scope.diagnosis = function () {
            return buttonClickAction("diagnosis",false);
        }

        $scope.templates = function () {
            return buttonClickAction("templates",false);
        }

        $scope.consultation = function () {
            return buttonClickAction("consultation",true);
        }

        var buttonClickAction = function (url, isMainPage) {
            $scope.mainDisplayText = isMainPage == true ? "Consultation" : "Done";
            $scope.uuid = $route.current.params.patientUuid;
            return $location.url("/patient/" + $scope.uuid + "/" + url);
        }
    }]);
