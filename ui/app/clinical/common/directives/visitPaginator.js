'use strict';

angular.module('bahmni.clinical')
    .directive('visitPaginator', ['$state', function ($state) {
        var link = function ($scope) {
            var visits = _.clone($scope.visits).reverse();
            
            var visitIndex = _.findIndex(visits, function(visitHistoryEntry) {
                return $scope.currentVisitUuid != null && visitHistoryEntry.uuid === $scope.currentVisitUuid;
            });

            $scope.visitHistoryEntry = visits[visitIndex];

            $scope.shouldBeShown = function () {
                return $state.is('patient.dashboard.visit');
            };

            $scope.hasNext = function () {
                return visitIndex != -1 && visitIndex < (visits.length - 1);
            };

            $scope.hasPrevious = function () {
                return visitIndex > 0;
            };

            $scope.next = function () {
                if ($scope.hasNext() && $scope.nextFn) {
                    $scope.nextFn()(visits[visitIndex+1].uuid);
                }
            };

            $scope.previous = function () {
                if ($scope.hasPrevious() && $scope.previousFn) {
                    $scope.previousFn()(visits[visitIndex-1].uuid);
                }
            };
        };

        return {
            restrict: 'EA',
            scope: {
                currentVisitUuid: "=",
                visits: "=",
                nextFn: "&",
                previousFn: "&",
                visitSummary: "="
            },
            link: link,
            templateUrl: 'common/views/visitPagination.html'
        }
    }])
;