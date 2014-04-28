angular.module('bahmni.clinical')
    .directive('visitActions', [function () {
        var controller = function ($scope, printer) {
            var actions = {
                printDischargeSummary: function () {
                    $scope.title = "Print Discharge Summary";
                    $scope.act = function () {
                        var dischargeSummary = new Bahmni.Clinical.DischargeSummary($scope.patient, $scope.visit);
                        printer.print('views/dischargeSummary.html', {dischargeSummary: dischargeSummary, visit: $scope.visit, patient: $scope.patient});
                    };
                },
                printVisitSummary: function () {
                    $scope.title = "Print Visit Summary";
                    $scope.act = function () {
                        var showLabInvestigations = $scope.visit.admissionDate ? false: true;
                        printer.print('views/visitSummaryPrint.html', {visit: $scope.visit, patient: $scope.patient, showLabInvestigations: showLabInvestigations});
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
                patient: "="
            },
            controller: controller,
            template: '<button type="button" ng-click="act()"><i class="icon-print"></i>{{title}}</button>'
        }
    }])
;