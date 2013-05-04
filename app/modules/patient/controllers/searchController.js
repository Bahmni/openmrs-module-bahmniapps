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
                $scope.noResultsMessage = $scope.results.length == 0 ?  "No results found" : null;
            });
            spinner.forPromise(searchPromise);
        }

        $scope.searchById = function () {
            $scope.results = [];
            var patientIdentifier = $scope.centerId + $scope.registrationNumber;
            var searchPromise = patientService.search(patientIdentifier).success(function (data) {
                if (data.results.length > 0) {
                    var patient = data.results[0];
                    $scope.editPatient(patient.uuid);
                } else {
                    $scope.noResultsMessage = "Could not find patient with identifier " + patientIdentifier + ". Please verify the patient ID entered or create a new patient record with this ID."
                }
            });
            spinner.forPromise(searchPromise);
        };

        $scope.searchByName = function () {
            $location.search({});
            $location.search('name', $scope.name);
            if ($scope.village) {
                $location.search('village', $scope.village);
            }
            $location.search('_time_', new Date().getTime());
        };

        $scope.resultsPresent = function () {
            return angular.isDefined($scope.results) && $scope.results.length > 0;
        };

        $scope.editPatient = function (patientUuid) {
            $location.url("/patient/" + patientUuid)
        };
    }]);
