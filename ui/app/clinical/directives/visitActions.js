angular.module('bahmni.clinical')
    .directive('visitActions', [function () {
        var controller = function ($scope, printer) {
            var actions = {
                printDischargeSummary: function () {
                    $scope.title = "Discharge Summary";
                    $scope.act = function () {
                        var dischargeSummary = new Bahmni.Clinical.DischargeSummary($scope.patient, $scope.visit);
                        printer.print('views/dischargeSummary.html', {dischargeSummary: dischargeSummary, visit: $scope.visit, patient: $scope.patient});
                    };
                },
                printVisitSummary: function () {
                    $scope.title = "Visit Summary";
                    $scope.act = function () {
                        var showLabInvestigations = $scope.visit.admissionDate ? false: true;
                        printer.print('views/visitSummaryPrint.html', {visit: $scope.visit, patient: $scope.patient, showLabInvestigations: showLabInvestigations, visitDate: $scope.visitDate});
                    };
                },
                printVisit: function () {
                    $scope.title = "Visit";
                    $scope.act = function () {
                        var showLabInvestigations = $scope.visit.admissionDate ? false: true;
                        printer.print('views/visitPrint.html', {visit: $scope.visit, patient: $scope.patient, showLabInvestigations: showLabInvestigations});
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