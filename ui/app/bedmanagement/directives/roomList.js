'use strict';

angular.module('bahmni.ipd')
    .directive('roomList', [function () {
        return {
            restrict: 'E',
            controller: 'RoomListController',
            scope: {
                room: "="
            },
            templateUrl: "../bedmanagement/views/roomList.html"
        };
    }]);
