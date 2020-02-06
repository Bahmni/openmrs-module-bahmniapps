'use strict';

angular.module('bahmni.ipd')
    .controller('RoomListController', ['$scope', 'queryService', 'appService',
        function ($scope, queryService, appService) {
            var getRoomListDetails = function (roomName) {
                var wardListSqlSearchHandler = appService.getAppDescriptor().getConfigValue("wardListSqlSearchHandler");

                var params = {
                    q: wardListSqlSearchHandler,
                    v: "full",
                    location_name: roomName
                };

                return queryService.getResponseFromQuery(params).then(function (response) {
                    $scope.tableDetails = response.data;
                    $scope.tableHeadings = $scope.tableDetails.length > 0 ? Object.keys($scope.tableDetails[0]) : [];
                    $scope.$emit("event:getTableData", {
                        tableData: $scope.tableDetails,
                        tableHeader: $scope.tableHeadings
                    });
                });
            };

            $scope.$on("event:changeBedList", function (event, roomName) {
                getRoomListDetails(roomName);
            });

            $scope.sortTableDataBy = function (sortColumn) {
                var nonEmptyObjects = _.filter($scope.tableDetails, function (entry) {
                    return entry[sortColumn];
                });
                var emptyObjects = _.difference($scope.tableDetails, nonEmptyObjects);
                var sortedNonEmptyObjects = _.sortBy(nonEmptyObjects, sortColumn);
                if ($scope.reverseSort) {
                    sortedNonEmptyObjects.reverse();
                }
                $scope.tableDetails = sortedNonEmptyObjects.concat(emptyObjects);
                $scope.sortColumn = sortColumn;
                $scope.reverseSort = !$scope.reverseSort;
            };

            var init = function () {
                $scope.reverseSort = false;
                return getRoomListDetails($scope.room.name);
            };
            init();
        }]);
