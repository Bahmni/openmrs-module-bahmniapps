'use strict';

angular.module('bahmnihome')
    .controller('DashboardController', ['$scope', '$window', 'appService', function ($scope, $window, appService) {
        $scope.openApp = function (appName) {
            $window.location = "/" + appName;
        }

        $scope.appExtensions = [];

        var loadAppExtensions = function() {
            $scope.appExtensions = appService.allowedApps();
        }

        loadAppExtensions();
    }]);
