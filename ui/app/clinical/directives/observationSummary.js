angular.module('bahmni.clinical')
.directive('observationSummary',function () {
    var controller = function($scope) {
        $scope.hideObservation = function () {
            return $scope.obsIgnoreList.indexOf($scope.observation.concept.name) > -1;
        };

        $scope.showXCompoundObservation = function() {
            for(var i in $scope.observation.groupMembers) {
                var member = $scope.observation.groupMembers[i];
                if($scope.obsIgnoreList.indexOf(member.concept.name) > -1) {
                    return false;
                }
            }
            return true;
        };
    };
    return {
        controller : controller,
        restrict:'E',
        scope:{
            observation:"=",
            patientUuid:"=",
            showTrends:"=",
            hideParentObsName:"@",
            fullDate:"@",
            obsIgnoreList: "="
        },
        //not able to use templateUrl, because of recurssive use of directive. Not sure what the error is.
        template: '<ng-include src="\'../clinical/views/observationSummaryTemplate.html\'" />',
        link: function(scope,element,attrs){
            if(scope.showTrends){
                scope.isNumeric = function(value){
                    return $.isNumeric(value);
                }
            }
            if(!scope.hideParentObsName) {
                scope.hideParentObsName = false;
            }
            if(!scope.fullDate) {
                scope.fullDate = false;
            }
            scope.toggle = function(items) {
                angular.forEach(items, function(item) {
                    item.show = !item.show;
                })
            }
        }
    }
});