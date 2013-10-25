'use strict';

angular.module('bahmnihome')
    .controller('DashboardController', ['$scope', '$window', function ($scope, $window) {
        $scope.openApp = function (appName) {
            $window.location = "/" + appName;
        }
    }]);
