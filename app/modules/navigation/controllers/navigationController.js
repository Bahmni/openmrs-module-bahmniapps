'use strict';

angular.module('opd.navigation', [])
    .controller('NavigationController', ['$scope', '$location','$route', function ($scope, $location, $route) {
        $scope.blank = function() {
            return $location.url("/blank");
        }

        $scope.treatment= function() {
            $scope.uuid = $route.current.params.patientUuid;
            return $location.url("/patient/"+$scope.uuid+"/treatment");
        }

        $scope.instruction = function() {
            $scope.uuid = $route.current.params.patientUuid;
            return $location.url("/patient/"+$scope.uuid+"/instruction");
        }

        $scope.diagnosis = function() {
            $scope.uuid = $route.current.params.patientUuid;
            return $location.url("/patient/"+$scope.uuid+"/diagnosis");
        }

        $scope.templates = function() {
            $scope.uuid = $route.current.params.patientUuid;
            return $location.url("/patient/"+$scope.uuid+"/templates");
        }

        $scope.consultation = function() {
            $scope.uuid = $route.current.params.patientUuid;
            return $location.url("/patient/"+$scope.uuid+"/consultation");
        }
    }]);
