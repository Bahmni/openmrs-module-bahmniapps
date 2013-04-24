'use strict';

angular.module('registration.search', ['resources.patientService'])

    .controller('SearchPatientController', ['$scope', 'patientService', '$location', function ($scope, patientService, $location) {

        var init = function () {
            var query = $location.search().q || '';
            $scope.query = query;
            if (query && query.trim().length > 0) {
                patientService.search(query).success(function (data) {
                    $scope.results = data.results;
                });
            }
        }
        init();

        $scope.search = function () {
            $location.search('q', $scope.query);
        }

        $scope.resultsPresent = function () {
            return angular.isDefined($scope.results) && $scope.results.length > 0;
        }

        $scope.noResultsFound = function(){
          return angular.isDefined($scope.results) && $scope.results.length == 0;
        }

        $scope.createNew = function() {
            $location.search({});
            $location.path("/patient/new");
        }

        $scope.editPatient = function(patientUuid) {
            $location.search({});
            $location.path("/patient/"+patientUuid)

        }
    }]);
