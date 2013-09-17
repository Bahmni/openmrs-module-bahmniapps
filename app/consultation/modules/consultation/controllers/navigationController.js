'use strict';

angular.module('opd.consultation.controllers')
    .controller('ConsultationNavigationController', ['$scope', '$rootScope', '$location', '$route', function ($scope, $rootScope, $location, $route) {
    $scope.mainButtonText = "Consultation";

    $scope.blank = function () {
        return $location.url("/blank");
    }

    $scope.dashboard = function () {
        return buttonClickAction("");
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

    $scope.disposition = function () {
        return buttonClickAction("disposition");
    }


    var buttonClickAction = function (url) {
        return $location.url("/visit/" + $rootScope.visit.uuid + "/" + url);
    }
}]);
