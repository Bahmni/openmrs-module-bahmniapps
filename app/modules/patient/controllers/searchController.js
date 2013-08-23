'use strict';

angular.module('registration.patient.controllers')
    .controller('SearchPatientController', ['$scope', 'patientService', '$location', '$window', 'spinner', 'loader', function ($scope, patientService, $location, $window, spinner, loader) {
        $scope.centers = constants.centers;
        $scope.centerId = defaults.centerId;
        $scope.results = [];

        var searchBasedOnQueryParameters = function(offset) {
            $scope.village = $location.search().village || '';
            $scope.name = $location.search().name || '';
            $scope.centerId = $location.search().centerId || defaults.centerId;
            $scope.registrationNumber = $location.search().registrationNumber || "";
            if ($scope.name.trim().length > 0 || $scope.village.trim().length > 0) {
                var searchPromise = patientService.search($scope.name, $scope.village, offset);
                loader.forPromise(searchPromise);
                return searchPromise;
            }
        };

        var showSearchResults = function(searchPromise) {
            $scope.noMoreResultsPresent = false;
            if(searchPromise) {
                searchPromise.success(function(data) {
                    $scope.results = data.results;
                    $scope.noResultsMessage = $scope.results.length == 0 ?  "No results found" : null;
                });
            }
        };

        $scope.$watch(function(){ return $location.search(); }, function() { showSearchResults(searchBasedOnQueryParameters(0))} );

        $scope.searchById = function () {
            if(!$scope.registrationNumber) return;
            $scope.results = [];
            var patientIdentifier = $scope.centerId + $scope.registrationNumber;
            $location.search({centerId: $scope.centerId, registrationNumber: $scope.registrationNumber});
            spinner.show();
            var searchPromise = patientService.search(patientIdentifier).success(function (data) {
                if (data.results.length > 0) {
                    var patient = data.results[0];
                    $location.url($scope.editPatientUrl(patient.uuid));
                } else {
                    spinner.hide();
                    $scope.noResultsMessage = "Could not find patient with identifier " + patientIdentifier + ". Please verify the patient ID entered or create a new patient record with this ID."
                }
            }).error(spinner.hide);
        };

        $scope.searchByVillageAndName = function () {
            var queryParams = {};
            if($scope.name){
                queryParams.name = $scope.name;
            }
            if ($scope.village) {
                queryParams.village = $scope.village;
            }
            $location.search(queryParams);
        };

        $scope.resultsPresent = function () {
            return angular.isDefined($scope.results) && $scope.results.length > 0;
        };

        $scope.editPatientUrl = function (patientUuid) {
            return "/patient/" + patientUuid;
        };

        $scope.nextPage =  function() {
            if ($scope.nextPageLoading) {
                return;
            }
            $scope.nextPageLoading = true;
            var promise = searchBasedOnQueryParameters($scope.results.length);
            if(promise) {
                promise.success(function(data) {
                    data.results.forEach(function(result) {$scope.results.push(result)});
                    $scope.noMoreResultsPresent = (data.results.length == 0 ? true : false);
                    $scope.nextPageLoading = false;
                });
                promise.error(function(data) {
                    $scope.nextPageLoading = false;
                });
            }
        };
    }]);
