'use strict';

angular.module('registration.search', ['resources.patientService'])
    .controller('SearchPatientController', ['$scope', 'patientService', '$location', '$window', function ($scope, patientService, $location, $window) {
        var query = $location.search().q || '';
        $scope.name = query;
        $scope.centers = constants.centers;
        $scope.centerId = defaults.centerId;
        if (query && query.trim().length > 0) {
            patientService.search(query).success(function (data) {
                $scope.results = data.results;
            });
        }

        $scope.searchById = function() {
            var patientidentifier = $scope.centerId + $scope.registrationNumber;
            patientService.search(patientidentifier).success(function (data) {
                var patient = data.results[0];
                if(patient){
                    $scope.editPatient(patient.uuid)
                }
                else {
                    $window.alert('Could not find patient with identifier ' + patientidentifier);
                }
            });
        };


        $scope.searchByName = function() {
            $location.search('q', $scope.name);
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
