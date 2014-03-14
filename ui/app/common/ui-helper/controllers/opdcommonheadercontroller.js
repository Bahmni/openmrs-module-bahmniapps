'use strict';

angular.module('bahmni.common.uiHelper')
    .controller('CommonHeaderController', ['$scope','backlinkService', function ($scope,backlinkService) {
        $scope.backLinks = backlinkService.getAllUrls();
    }]);