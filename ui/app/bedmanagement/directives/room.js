'use strict';

angular.module('bahmni.ipd')
    .directive('room', [function () {
        return {
            restrict: 'E',
            controller: "RoomController",
            scope: {
                room: "="
            },
            templateUrl: "../bedmanagement/views/room.html"
        };
    }]);
