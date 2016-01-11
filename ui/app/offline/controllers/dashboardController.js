'use strict';

angular.module('bahmni.offline')
    .controller('DashboardController', ['$scope', 'eventLogService',
        function ($scope, eventLogService) {
            $scope.catchmentNumber = 202020;

            $scope.sync = function () {
                eventLogService.getEventsFor($scope.catchmentNumber).then(function (events) {
                    readEvent(events, 0);
                });
            };


            var readEvent = function (events, index) {
                if (events.length == index)
                    return;

                var event = events[index];
                eventLogService.getDataForUrl(event.object).then(function (data) {
                    switch (event.category) {
                        case 'patient':
                            break;
                        case 'Encounter':
                            break;
                    }
                    readEvent(events, ++index);
                });
            }
        }
    ]);