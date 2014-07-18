angular.module('bahmni.clinical')
    .directive('visitPaginationLinks', ['$rootScope', '$state', function ($rootScope, $state) {
        var link = function($scope) {
            var visits = _.clone($rootScope.visits).reverse();

            var visitIndex = _.findIndex(visits, function(visitHistoryEntry) {
                return $scope.visit != null && visitHistoryEntry.uuid == $scope.visit.uuid;
            });

            $scope.visitHistoryEntry = visits[visitIndex];

            $scope.shouldBeShown = function() {
                return $state.is('patient.visit');
            }

            $scope.hasNext = function() {
                return visitIndex != -1 && visitIndex < (visits.length - 1);
            };

            $scope.hasPrevious = function() {
                return visitIndex > 0;
            };

            $scope.next = function() {
                if($scope.hasNext()) {
                    $state.go('patient.visit', {visitUuid: visits[visitIndex + 1].uuid});
                }
            };

            $scope.previous = function() {
                if($scope.hasPrevious()) {
                    $state.go('patient.visit', {visitUuid: visits[visitIndex - 1].uuid});
                }
            };
        };

        return {
            restrict: 'EA',
            scope: {
                visit: "=",
            },
            link: link,
            templateUrl: 'views/visitPagination.html'
        }
    }])
;