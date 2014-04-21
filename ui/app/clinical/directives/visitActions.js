angular.module('bahmni.clinical')
.directive('visitActions', [function () {
    var controller = function($scope, printer, $compile) {
        $scope.printDischrageSummary = function() {
            var dischargeSummary = new Bahmni.Clinical.DischargeSummary($scope.patient, $scope.visit);
            printer.print('views/dischargeSummary.html', {dischargeSummary: dischargeSummary, visit: $scope.visit, patient: $scope.patient});
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