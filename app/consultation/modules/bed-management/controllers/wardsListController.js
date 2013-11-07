'use strict';

angular.module('opd.bedManagement.controllers')
    .controller('WardsListController', ['$scope', '$rootScope', 'WardsListService', '$route', '$location', function ($scope, $rootScope, wardsListService, $route, $location) {
    $scope.wards = [];
    wardsListService.getWardsList().success(function (wardsList) {
        $scope.wards = wardsList.results;
    });

    $rootScope.showWardLayout = function (ward) {
        $location.url("/visit/" + $rootScope.visit.uuid + "/bed-management/wardLayout/" + ward.uuid);
    };

    if ($rootScope.bedDetails) {
        if ($rootScope.bedDetails.wardUuid) {
            var wardLayoutUrl = "/visit/" + $rootScope.visit.uuid + "/bed-management/wardLayout/" + $rootScope.bedDetails.wardUuid;
            return $location.url(wardLayoutUrl);
        }
    }

}]);
