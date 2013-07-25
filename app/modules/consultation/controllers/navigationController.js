'use strict';

angular.module('opd.consultation.controllers')
    .controller('ConsultationNavigationController', ['$scope', '$rootScope', '$location', '$route', function ($scope, $rootScope, $location, $route) {
    $scope.mainButtonText = "Consultation";
    $scope.patient = $rootScope.currentPatient;

    $scope.blank = function () {
        return $location.url("/blank");
    }

    $scope.treatment = function () {
        return buttonClickAction("treatment");
    }

    $scope.investigation = function () {
        return buttonClickAction("investigation");
    }

    $scope.diagnosis = function () {
        return buttonClickAction("diagnosis");
    }

    $scope.templates = function () {
        return buttonClickAction("templates");
    }

    $scope.consultation = function (patient) {
        return buttonClickAction("consultation");
    }

    $scope.notes = function () {
        return buttonClickAction("notes");
    }

    var buttonClickAction = function (url) {
        return $location.url("/patient/" + $route.current.params.patientUuid + "/" + url);
    }
}]);
