'use strict';

angular.module('bahmni.adt')
    .controller('WardDetailsController', ['$scope', 'WardService',
        function ($scope, wardService) {
            $scope.wards = null;
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
                ward.showDetails = !ward.showDetails;
            };
            $scope.showDetailsButton = function (ward) {
                return ward.occupiedBeds > 0;
            };
            $scope.getParams = function (ward) {
                params.location_name = ward.ward.childLocations[0].display;
                return params;
            };

            init();

        }]);
