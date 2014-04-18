angular.module('bahmni.clinical')
.directive('visitActions', [function () {
    var controller = function($scope) {
        $scope.dischargeSummary = new Bahmni.Clinical.DischargeSummary($scope.patient, $scope.visit);

        $scope.printDischrageSummary = function() {
            alert('Print coming soon!');
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