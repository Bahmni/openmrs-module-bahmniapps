'use strict';

/* Controllers */


function SearchPatientController($scope, $http) {

    var search = function() {
        delete $http.defaults.headers.common['X-Requested-With'];
        $http({
            url: "http://localhost:8080/openmrs/ws/rest/v1/patient?q="+$scope.query+"&v=full",
            method: "GET",
            withCredentials: true
        }).success(function(data) {
                $scope.results=data.results;
            });
    }
    $scope.search = search;

    var resultsPresent = function() {
        return angular.isDefined($scope.results) && $scope.results.length > 0;
    }

    $scope.resultsPresent = resultsPresent;
}
