'use strict';

angular.module('bahmni.offline')
    .controller('DashboardController', ['$scope', 'eventLogService',
        function ($scope, eventLogService) {

            $scope.sync = function(){
                eventLogService.getEventsFor($scope.catchmentNumber);
            };
        }
    ]);