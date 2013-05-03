'use strict';

angular.module('registration.search', ['resources.patientService', 'infrastructure.spinner'])
    .controller('SearchPatientController', ['$scope', 'patientService', '$location', '$window', 'spinner', function ($scope, patientService, $location, $window, spinner) {
        var query = $location.search().name || '';
        $scope.name = $location.search().name;
        $scope.village = $location.search().village;
        $scope.centers = constants.centers;
        $scope.centerId = defaults.centerId;

        var successfulSearchPromise = function (data) {
            $scope.results = data.results;
        };

        if (query && query.trim().length > 0) {
            var searchPromise = patientService.search(query, $scope.village).success(successfulSearchPromise);
            spinner.forPromise(searchPromise);
        }

        $scope.searchById = function () {
            $window.history.pushState(null, null, $location.absUrl().split("?")[0]);
            var searchPromise = patientService.search($scope.centerId + $scope.registrationNumber).success(function (data) {
                if (data.results.length > 0) {
                    var patient = data.results[0];
                    $scope.editPatient(patient.uuid);
                } else {
                    $scope.results = data.results;
                }
            });
            spinner.forPromise(searchPromise);
        };

        $scope.clearParameters = function () {
            $location.search({});
        }

        $scope.searchByName = function () {
            $scope.clearParameters();
            $location.search('name', $scope.name);
            if ($scope.village) {
                $location.search('village', $scope.village);
            }
        };

        $scope.resultsPresent = function () {
            return angular.isDefined($scope.results) && $scope.results.length > 0;
        };

        $scope.noResultsFound = function () {
            return angular.isDefined($scope.results) && $scope.results.length === 0;
        };

        $scope.createNew = function () {
            $location.path("/patient/new");
        };

        $scope.editPatient = function (patientUuid) {
            $location.path("/patient/" + patientUuid)
        };
    }]);
