'use strict';

angular.module('registration.search', ['resources.patient'])

    .controller('SearchPatientController', ['$scope', 'patient', function ($scope, patient) {

        var search = function () {
            patient.search($scope.query).success(function (data) {
                $scope.results = data.results;
            });
        }
        $scope.search = search;

        var resultsPresent = function () {
            return angular.isDefined($scope.results) && $scope.results.length > 0;
        }
        $scope.resultsPresent = resultsPresent;
    }]);
