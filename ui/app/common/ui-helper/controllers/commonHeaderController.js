'use strict';

angular.module('bahmni.common.uiHelper')
    .controller('CommonHeaderController', ['$scope','backlinkService', function ($scope,backlinkService) {
        $scope.$on('$stateChangeSuccess', function(event, state, params, fromState, fromParams){ 
            backlinkService.setUrls(state.data.backLinks);
            $scope.backLinks = backlinkService.getAllUrls();
         });
    }]);