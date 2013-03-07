'use strict';

angular.module('registration.session', [])

    .controller('SessionController', ['$scope', '$http', '$location', function ($scope, $http, $location) {
        $scope.login = function () {
            $scope.errorMessage = null
            return $http.get('/openmrs/ws/rest/v1/session', {
                headers: {'Authorization': 'Basic ' + window.btoa($scope.username + ':' + $scope.password)},
                cache: false
            }).success(function (data) {
                    var authenticationSuccess = data.authenticated;
                    if (authenticationSuccess) {
                        $location.path("/search");
                    } else {
                        $scope.errorMessage = "Authentication failed. Please try again."
                        $scope.resetForm();
                    }
                });
        }

        $scope.logout = function () {
            $http.delete('/openmrs/ws/rest/v1/session');
            $location.path("/login");
        }

        $scope.resetForm = function () {
            $scope.password = "";
        }
    }]);
