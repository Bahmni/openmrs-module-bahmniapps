'use strict';

angular.module('bahmni.clinical')
    .directive('teleConsultation', function () {
        var controller = function ($rootScope, $scope, $state) {
            $scope.consultationActive = false;
            $scope.teleConsultationUrl = "";
            $scope.startTeleConsultation = function (url) {
                $scope.teleConsultationUrl = url;
                $scope.consultationActive = true;
            };
        };

        return {
            restrict: 'E',
            controller: controller,
            templateUrl: "dashboard/views/teleConsultation.html"
        };
    });
