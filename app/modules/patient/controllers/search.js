'use strict';

angular.module('registration.search', ['resources.patientService', 'infrastructure.spinner'])
    .controller('SearchPatientController', ['$scope', 'patientService', '$location', '$window', 'spinner', function ($scope, patientService, $location, $window, spinner) {
        var query = $location.search().q || '';
        $scope.name = query;
        $scope.centers = constants.centers;
        $scope.centerId = defaults.centerId;
        if (query && query.trim().length > 0) {
            var searchPromise = patientService.search(query).success(function (data) {
                $scope.results = data.results;
            });
            spinner.forPromise(searchPromise);
        }


        var searchById = function() {
            var patientidentifier = $scope.centerId + $scope.registrationNumber;

            var searchPromise = patientService.search(patientidentifier).success(function (data) {
                var patient = data.results[0];
                if (patient) {
                    $scope.editPatient(patient.uuid)
                }
                else {
                    $window.alert('Could not find patient with identifier ' + patientidentifier);
                }
            });
            spinner.forPromise(searchPromise);
        };


        var searchByName = function() {
            $location.search('q', $scope.name);
        };

        $scope.search = function() {
            if($scope.registrationNumber){
                searchById();
            } else {
                searchByName();
            }
        };

        $scope.resultsPresent = function() {
            return angular.isDefined($scope.results) && $scope.results.length > 0;
        };


        $scope.noResultsFound = function(){
          return angular.isDefined($scope.results) && $scope.results.length == 0;
        };

        $scope.createNew = function() {
            $location.search({});
            $location.path("/patient/new");
        };

        $scope.editPatient = function(patientUuid) {
            $location.search({});
            $location.path("/patient/"+patientUuid)

        };
    }]);