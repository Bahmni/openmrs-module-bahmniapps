'use strict';

angular.module('bahmni.ipd')
    .directive('roomGrid', [function () {
        return {
            restrict: 'E',
            controller: 'RoomGridController',
            scope: {
                room: "="
            },
            templateUrl: "../bedmanagement/views/roomGrid.html"
        };
    }]);
