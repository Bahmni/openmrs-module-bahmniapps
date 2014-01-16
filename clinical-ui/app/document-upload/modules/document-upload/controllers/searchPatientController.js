'use strict';

angular.module('documentupload')
    .controller('SearchPatientController', ['$rootScope', '$scope', '$route', '$location', '$window',  'patientService', 'appService', function ($rootScope, $scope, $route, $location, $window,  patientService, appService) {
        $scope.results = [];

        $scope.searchById = function () {
            if(!$scope.patientIdentifier) return;
            $scope.results = [];
            var patientIdentifier = $scope.patientIdentifier

            var searchPromise = patientService.search(patientIdentifier).success(function (data) {
                $scope.results = data.results;
                if (data.results.length > 0) {
                    var patient = data.results[0];
                    $rootScope.patient = patient;
                    $location.path("/documentUpload/"+$scope.patientIdentifier);
                } else {
                    $scope.noResultsMessage = "Could not find patient with identifier " + patientIdentifier + ". Please verify the patient ID entered "
                }
            }).error();
        };

}]);
