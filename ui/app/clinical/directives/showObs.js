angular.module('bahmni.clinical')
.directive('showObs', [function () {
    var controller = function($scope) {
        var hasGroupMembers = function(observation) {
            return observation.groupMembers && observation.groupMembers.length;
        }

        var hasValue = function(observation) {
            return observation.value;
        }

        var hasValueOrMembers = function(observation) {
            return hasValue(observation) || (hasGroupMembers(observation) && observation.groupMembers.some(hasValueOrMembers)); 
        }

        $scope.showObservation = function(){
            return Bahmni.Clinical.Constants.groupObservations.indexOf($scope.observation.concept.name) < 0 && hasValueOrMembers($scope.observation);
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