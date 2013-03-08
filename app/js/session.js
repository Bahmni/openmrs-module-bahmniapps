'use strict';

angular.module('registration.session', [])
    .controller('SessionController', ['$rootScope', '$scope', '$http', '$location', function ($rootScope, $scope, $http, $location) {
        $scope.login = function () {
            $scope.errorMessage = null
            return $http.get($rootScope.BaseUrl + '/ws/rest/v1/session', {
                headers: {'Authorization': 'Basic ' + window.btoa($scope.username + ':' + $scope.password)},
                cache: false
            }).success(function (data) {
                if (data.authenticated) {
                    $location.path("/search");
                } else {
                    $scope.errorMessage = "Authentication failed. Please try again."
                    $scope.resetForm();
                }
            });
        }

        $scope.logout = function () {
            $rootScope.errorMessage = null;
            $http.delete('/openmrs/ws/rest/v1/session');
            $location.path("/login");
        }

        $scope.resetForm = function () {
            $scope.password = "";
        }
    }]);
