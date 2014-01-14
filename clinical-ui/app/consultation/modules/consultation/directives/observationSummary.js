angular.module('opd.consultation')
.directive('observationSummary',function () {
    return {
        restrict:'E',
        scope:{
            observation:"=",
            patientUuid:"=",
            showTrends:"="
        },
        template: "<ng-include src=\"'observationSummaryTemplate'\"/>" ,
        link: function(scope,element,attrs){
            if(scope.showTrends != "false"){
                scope.isNumeric = function(value){
                    return $.isNumeric(value);
                }
            }
        }

    }
});