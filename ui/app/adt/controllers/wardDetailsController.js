'use strict';

angular.module('bahmni.adt')
    .controller('WardDetailsController', ['$scope', 'WardService',
        function ($scope, wardService) {
            $scope.wards = null;
            $scope.ward = null;
            var params = {
                q: "emrapi.sqlGet.wardsListDetails",
                v: "full"
            };
            var init = function () {
                loadAllWards();
            };

            var loadAllWards = function () {
                wardService.getWardsList().success(function (wardsList) {
                    $scope.wards = wardsList.results;
                });
            };

            $scope.toggle = function (ward) {
                $scope.ward = ward;
                ward.showDetails = !ward.showDetails && $scope.showDetailsButton(ward);
            };
            $scope.showDetailsButton = function (ward) {
                return ward.occupiedBeds > 0;
            };
            $scope.getParams = function (ward) {
                params.location_name = $scope.ward.ward.childLocations[0].display;
                return params;
            };

            init();

        }]);
