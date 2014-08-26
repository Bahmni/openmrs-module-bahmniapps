'use strict';

angular.module('bahmni.common.uiHelper')
    .controller('DashboardController', ['$scope', '$location', 'appService', function ($scope, $location, appService) {
        $scope.appExtensions = appService.getAppDescriptor().getExtensions("org.bahmni.home.dashboard", "link") || [];
    }]);