'use strict';

angular.module('bahmni.ipd')
    .controller('RoomListController', ['$scope', 'QueryService', 'appService',
        function ($scope, queryService, appService) {
            var getRoomListDetails = function (roomName) {
                var params = {
                    q: "emrapi.sqlGet.wardsListDetails",
                    v: "full",
                    location_name: roomName
                };

                return queryService.getResponseFromQuery(params).then(function (response) {
                    var listViewBedLayoutConfig = appService.getAppDescriptor().getConfigValue("ListViewBedLayout");
                    $scope.tableDetails = Bahmni.IPD.WardDetails.create(response.data, listViewBedLayoutConfig);
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
