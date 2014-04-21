angular.module('bahmni.clinical')
.directive('visitActions', [function () {
    var controller = function($scope, printer, $compile) {
        $scope.printDischrageSummary = function() {
            printer.print('views/dischargeSummary.html', new Bahmni.Clinical.DischargeSummary($scope.patient, $scope.visit));
        }
    };
    return {
        restrict:'EA',
        scope:{
            visit:"=",
            patient:"="
        },
        controller: controller,
        template:'<button type="button" ng-click="printDischrageSummary()">Print Discharge Summary</button>'
    }
}]);