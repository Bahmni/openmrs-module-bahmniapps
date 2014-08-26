'use strict';

angular.module('bahmni.common.uiHelper')
    .controller('DashboardController', ['$scope', '$state', 'appService', function ($scope, $state, appService) {
        $scope.appExtensions = appService.getAppDescriptor().getExtensions($state.current.data.extensionPointId, "link") || [];
    }]);