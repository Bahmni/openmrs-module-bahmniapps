angular.module('bahmni.common.conceptSet')
    .directive('buttonSelect', function () {
    return {
        restrict:'E',
        scope:{ observation:'='},

        link:function(scope, element, attrs){
            if(attrs.dirtyCheckFlag){
                scope.hasDirtyFlag = true;
            }
        },
        controller:function ($scope) {
            $scope.isSet = function(answer) {
                return $scope.observation.hasValueOf(answer);
            };

            $scope.select = function (answer) {
                $scope.observation.toggleSelection(answer);
            };

            $scope.getAnswerDisplayName = function(answer) {
                var shortName = answer.names ? _.first(answer.names.filter(function(name) {return name.conceptNameType === 'SHORT'})): null;
                return  shortName  ? shortName.name : answer.displayString;
            };
        },
        template:'<ng-include src="\'../common/concept-set/views/buttonselectObservation.html\'" />'
    };
});