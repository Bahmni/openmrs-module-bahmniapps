'use strict';

angular.module('opd.consultation.controllers')
    .controller('ConsultationNavigationController', ['$scope', '$location', '$route', 'ConfigurationService', function ($scope, $location, $route, configurationService) {
    $scope.mainButtonText = "Consultation";

    (function () {
        configurationService.init();
        $scope.patient = Bahmni.Opd.currentPatient;
    })();

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

    $scope.onLists = function () {
        var url = $location.url();
        if (url.search(Bahmni.Opd.Constants.activePatientsListUrl) !== -1) {
            return true;
        }
        return false;
    }

    var buttonClickAction = function (url) {
        return $location.url("/patient/" + $route.current.params.patientUuid + "/" + url);
    }
}]);
