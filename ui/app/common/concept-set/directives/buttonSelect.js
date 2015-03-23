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
        template:'<div ng-class="{\'multi-select-widget\'' +
        ': observation.isMultiSelect}" class="multi-select-button-group">' +
        '<button type="button" class="grid-row-element" ng-class="{active: isSet(answer)}"'+
        'ng-click="select(answer)" ng-repeat="answer in ::observation.getPossibleAnswers()"><i class="icon-ok"></i>{{::getAnswerDisplayName(answer)}}'+
            '</button></div>'
    };
});