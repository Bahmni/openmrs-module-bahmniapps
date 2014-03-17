angular.module('bahmni.clinical')
.directive('showObs', [function () {
    var controller = function($scope) {
        $scope.showObservation = function(){
            return Bahmni.Clinical.Constants.groupObservations.indexOf($scope.observation.concept.name) < 0;
        };
    };
    return {
        restrict:'E',
        scope:{
            observation:"="
        },
        controller: controller,
        template:'<ng-include src="\'views/showObservation.html\'" />'
    }
}]);