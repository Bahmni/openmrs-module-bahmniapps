'use strict';

angular.module('bahmni.ipd')
    .directive('roomList', [function () {
        return {
            restrict: 'E',
            controller: 'RoomListController',
            scope: {
                room: "="
            },
            templateUrl: "../bed-management/views/roomList.html"
        };
    }]);
