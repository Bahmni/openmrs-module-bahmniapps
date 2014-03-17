'use strict';

angular.module('opd.documentupload')
    .controller('SearchPatientController', ['$rootScope', '$scope', '$location', '$window','spinner',  'patientService',
        function ($rootScope, $scope, $location, $window,spinner,  patientService) {
        $scope.results = [];

        $scope.resultsPresent = function () {
           return $scope.results.length > 1;
        }

        $scope.gotoDocumentUpload = function(patientUuid) {
            $location.path("/patient/" + patientUuid + '/document');
        }

        var searchPromise = function(patientIdentifier) {
            return spinner.forPromise(patientService.search(patientIdentifier).success(function (data) {
                $scope.noResultsMessage = null;
                $scope.results = data.results;
                if (data.results.length > 0) {
                    var patient = data.results[0];
                    $rootScope.patient = patient;
                    if(data.results.length == 1)
                        $scope.gotoDocumentUpload(patient.uuid);

                } else {
                    $scope.noResultsMessage = "Could not find patient with identifier/name " + patientIdentifier + ". Please verify the patient ID entered "
                }
            }));
        }

        $scope.searchById = function () {
            if(!$scope.patientIdentifier) return;
            $scope.results = [];
            var patientIdentifier = $scope.patientIdentifier
            spinner.forPromise(searchPromise(patientIdentifier));
        };

}]);
