angular.module('bahmni.clinical')
.directive('showObs', [function () {
    return {
        restrict:'E',
        scope:{
            observation:"="
        },
        template:'<ng-include src="\'views/showObservation.html\'" />'
    }
}]);