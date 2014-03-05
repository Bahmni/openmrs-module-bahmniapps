'use strict';

angular.module('bahmni.common.controllers', ['bahmni.common.backlink'])
    .controller('CommonHeaderController', ['$scope','backlinkService', function ($scope,backlinkService) {

        $scope.backLinks = backlinkService.getAllUrls();

    }]);