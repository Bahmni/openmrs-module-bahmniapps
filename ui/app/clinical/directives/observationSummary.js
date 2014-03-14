angular.module('bahmni.clinical')
.directive('observationSummary',function () {
    return {
        restrict:'E',
        scope:{
            observation:"=",
            patientUuid:"=",
            showTrends:"=",
            hideParentObsName:"@",
            fullDate:"@"
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