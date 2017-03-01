'use strict';

angular.module('bahmni.ipd')
    .controller('RoomListController', ['$scope', 'QueryService',
        function ($scope, queryService) {
            var getRoomListDetails = function (roomName) {
                var params = {
                    q: "emrapi.sqlGet.wardsListDetails",
                    v: "full",
                    location_name: roomName
                };

                return queryService.getResponseFromQuery(params).then(function (response) {
                    $scope.tableDetails = Bahmni.IPD.WardDetails.create(response.data);
                    $scope.tableHeadings = $scope.tableDetails.length > 0 ? Object.keys($scope.tableDetails[0]) : [];
                });
            };

            $scope.$on("event:changeBedList", function (event, roomName) {
                getRoomListDetails(roomName);
            });

            var init = function () {
                return getRoomListDetails($scope.room.name);
            };
            init();
        }]);
