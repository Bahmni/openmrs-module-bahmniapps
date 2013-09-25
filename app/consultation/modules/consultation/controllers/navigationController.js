'use strict';

angular.module('opd.consultation.controllers')
    .controller('ConsultationNavigationController', ['$scope', '$rootScope', '$location', '$route', function ($scope, $rootScope, $location, $route) {
    $scope.mainButtonText = "Consultation";
    $scope.selectedContext = '';

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

    var initialize = function() {
        var currentPath = $location.path();
        var pathInfo = currentPath.substr(currentPath.lastIndexOf('/') + 1);
        $scope.selectedContext = pathInfo;
    }

    var buttonClickAction = function (ctx) {
        if ($scope.selectedContext) {
            if ($scope.selectedContext === ctx) {
                return;
            }
        }

        if ($rootScope.beforeContextChange) {
            var changeCtx = $rootScope.beforeContextChange();
            if (!changeCtx) {
                return;
            }
        }
        $rootScope.beforeContextChange = null;
        $scope.selectedContext = ctx;
        return $location.url("/visit/" + $rootScope.visit.uuid + "/" + ctx);
    }

    initialize();

}]);
