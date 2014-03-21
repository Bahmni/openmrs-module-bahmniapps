'use strict';

angular.module('bahmni.home')
    .controller('DashboardController', ['$scope', '$location', 'appService', '$q', 'sessionService', 'spinner', '$window', function ($scope, $location, appService, $q, sessionService, spinner, $window) {
        $scope.openApp = function (appName) {
            $window.location = "/" + appName;
        }

        $scope.appExtensions = [];

        var initializeExtenstions = function() {
            $scope.appExtensions = appService.getAppDescriptor().getExtensions("org.bahmni.home.dashboard", "link");
        }

        var initialize = function() {
            return appService.initApp('home').then(initializeExtenstions);
        };

        spinner.forPromise(initialize());
    }]);