'use strict';

angular.module('registration.search', ['resources.patientService', 'infrastructure.spinner'])
    .controller('SearchPatientController', ['$scope', 'patientService', '$location', '$window', 'spinner', function ($scope, patientService, $location, $window, spinner) {
        var query = $location.search().name || '';
        window.asd = $location;
        $scope.name = query;
        $scope.village = $location.search().village;
        $scope.centers = constants.centers;
        $scope.centerId = defaults.centerId;
        $scope.moreResultsPresent = false;

        if (query && query.trim().length > 0) {
            var searchPromise = patientService.search(query, $scope.village).success(function (data) {
                $scope.results = data.results;
                $scope.moreResultsPresent = (data.links ? true : false);
            });
            spinner.forPromise(searchPromise);
        }

        $scope.searchById = function () {
            var searchPromise = patientService.search($scope.centerId + $scope.registrationNumber).success(function (data) {
                if (data.results.length > 0) {
                    var patient = data.results[0];
                    $scope.editPatient(patient.uuid);
                } else {
                    $scope.clearParameters();
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
            $scope.clearParameters();
            $location.path("/patient/new");
        };

        $scope.editPatient = function (patientUuid) {
            $scope.clearParameters();
            $location.path("/patient/" + patientUuid)
        };
    }]);
