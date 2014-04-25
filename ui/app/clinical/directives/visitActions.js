angular.module('bahmni.clinical')
.directive('visitActions', [function () {
    var controller = function($scope, printer) {
        $scope.printDischargeSummary = function() {
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
        template:'<button type="button" ng-if="visit.hasAdmissionEncounter()" ng-click="printDischargeSummary()">Print Discharge Summary</button>'
    }
}]);