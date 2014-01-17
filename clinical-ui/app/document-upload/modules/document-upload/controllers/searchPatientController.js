'use strict';

angular.module('opd.documentupload')
    .controller('SearchPatientController', ['$rootScope', '$scope', '$route', '$location', '$window','spinner',  'patientService', 'appService', function ($rootScope, $scope, $route, $location, $window,spinner,  patientService, appService) {
        $scope.results = [];

        $scope.resultsPresent = function () {
           return $scope.results.length > 1;
        }

        $scope.gotoDocumentUpload = function(patientUuid) {
            $location.path("/patient/" + patientUuid + '/document');
        }

        var searchPromise = function(patientIdentifier) {
            return patientService.search(patientIdentifier).success(function (data) {
                $scope.results = data.results;
                if (data.results.length > 0) {
                    var patient = data.results[0];
                    $rootScope.patient = patient;
                    if(data.results.length == 1)
                        $scope.gotoDocumentUpload(patient.uuid);

                } else {
                    spinner.hide();
                    $scope.noResultsMessage = "Could not find patient with identifier " + patientIdentifier + ". Please verify the patient ID entered "
                }
            }).error(spinner.hide);
        }

        $scope.searchById = function () {
            if(!$scope.patientIdentifier) return;
            $scope.results = [];
            var patientIdentifier = $scope.patientIdentifier
            spinner.forPromise(searchPromise(patientIdentifier));
        };

}]);
