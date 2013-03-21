'use strict';

angular.module('registration.search', ['resources.patientService'])

    .controller('SearchPatientController', ['$scope', 'patientService', '$location', function ($scope, patientService, $location) {
        var search = function () {
            patientService.search($scope.query).success(function (data) {
                $scope.results = data.results;
            });
        }
        $scope.search = search;

        var resultsPresent = function () {
            return angular.isDefined($scope.results) && $scope.results.length > 0;
        }
        $scope.resultsPresent = resultsPresent;

        $scope.createNew = function() {
            $location.path("/create");
        }
    }]);
