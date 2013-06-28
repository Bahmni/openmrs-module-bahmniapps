'use strict';

angular.module('registration.patient.controllers')
    .controller('SearchPatientController', ['$scope', 'patientService', '$location', '$window', 'spinner', function ($scope, patientService, $location, $window, spinner) {
        $scope.centers = constants.centers;
        $scope.centerId = defaults.centerId;
        $scope.moreResultsPresent = false;

        var searchBasedOnQueryParameters = function() {
            $scope.village = $location.search().village;
            $scope.name = $location.search().name || '';
            $scope.centerId = $location.search().centerId || defaults.centerId;
            $scope.registrationNumber = $location.search().registrationNumber || "";
            if ($scope.name.trim().length > 0) {
                var searchPromise = patientService.search($scope.name, $scope.village).success(function (data) {
                    $scope.results = data.results;
                    $scope.moreResultsPresent = (data.links ? true : false);
                    $scope.noResultsMessage = $scope.results.length == 0 ?  "No results found" : null;
                });
                spinner.forPromise(searchPromise);
            }
        };

        $scope.$watch(function(){ return $location.search(); }, searchBasedOnQueryParameters);

        $scope.searchById = function () {
            if(!$scope.registrationNumber) return;
            $scope.results = [];
            var patientIdentifier = $scope.centerId + $scope.registrationNumber;
            $location.search({centerId: $scope.centerId, registrationNumber: $scope.registrationNumber});
            spinner.show();
            var searchPromise = patientService.search(patientIdentifier).success(function (data) {
                if (data.results.length > 0) {
                    var patient = data.results[0];
                    $scope.editPatient(patient.uuid);
                } else {
                    spinner.hide();
                    $scope.noResultsMessage = "Could not find patient with identifier " + patientIdentifier + ". Please verify the patient ID entered or create a new patient record with this ID."
                }
            }).error(spinner.hide);
        };

        $scope.searchByName = function () {
            var queryParams = {name: $scope.name}
            if ($scope.village) {
                queryParams.village = $scope.village;
            }
            $location.search(queryParams);
        };

        $scope.resultsPresent = function () {
            return angular.isDefined($scope.results) && $scope.results.length > 0;
        };

        $scope.editPatient = function (patientUuid) {
            $location.url("/patient/" + patientUuid)
        };
    }]);
