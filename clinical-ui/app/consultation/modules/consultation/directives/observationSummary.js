angular.module('opd.consultation')
.directive('observationSummary',function () {
    return {
        restrict:'E',
        scope:{
            observation:"=",
            patientUuid:"="
        },
        template: "<ng-include src=\"'observationSummaryTemplate'\"/>" ,
        link: function(scope,element,attrs){
            scope.isNumeric = function(value){
                return $.isNumeric(value);
            }
        }

    }
});