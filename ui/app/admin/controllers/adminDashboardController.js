'use strict';

angular.module('bahmni.admin')
    .controller('AdminDashboardController', ['$scope', '$state', 'appService', function ($scope, $state, appService) {
        $scope.appExtensions = appService.getAppDescriptor().getExtensions($state.current.data.extensionPointId, "link") || [];
    }]);
