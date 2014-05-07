angular.module('bahmni.clinical')
    .directive('visitActions', [function () {
        var controller = function ($scope, visitActionsService) {
            var actions = {
                printDischargeSummary: function () {
                    $scope.title = "Discharge Summary";
                    $scope.act = function () {
                        visitActionsService.printDischargeSummary($scope.patient, $scope.visit);
                    };
                },
                printVisitSummary: function () {
                    $scope.title = "Visit Summary";
                    $scope.act = function () {
                        visitActionsService.printVisitSummary($scope.patient, $scope.visit, $scope.visitDate);
                    };
                },
                printVisit: function () {
                    $scope.title = "Visit";
                    $scope.act = function () {
                        visitActionsService.printVisit($scope.patient, $scope.visit);
                    };
                }
            };

            actions[$scope.action]();
        };
        return {
            restrict: 'EA',
            scope: {
                action: "=",
                visit: "=",
                patient: "=",
                visitDate: "="
            },
            controller: controller,
            template: '<button type="button" ng-click="act()"><i class="icon-print"></i>{{title}}</button>'
        }
    }])
;