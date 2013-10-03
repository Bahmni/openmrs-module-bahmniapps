'use strict';

angular.module('opd.bedManagement.controllers')
    .controller('WardsListController', ['$scope', '$rootScope', 'WardsListService', '$route', '$location', function ($scope, $rootScope, wardsListService, $route, $location) {
        $scope.wards = [];
        wardsListService.getWardsList().success(function(wardsList){
            $scope.wards = wardsList.results;
        });

        $scope.showWardLayout = function(ward){
            $location.url("wardLayout/" + ward.uuid);
        }
}]);
