'use strict';

angular.module('bahmni.common.uiHelper')
    .controller('CommonHeaderController', ['$scope', 'backlinkService', function ($scope, backlinkService) {
        $scope.backLinks = backlinkService.getAllUrls();
        $scope.$on('$stateChangeSuccess', function (event, state, params, fromState, fromParams) {
            if (state.data && state.data.backLinks) {
                backlinkService.setUrls(state.data.backLinks);
                $scope.backLinks = backlinkService.getAllUrls();
            }
        });
    }]);