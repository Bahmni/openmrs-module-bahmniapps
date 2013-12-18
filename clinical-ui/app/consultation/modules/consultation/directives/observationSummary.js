angular.module('opd.consultation')
.directive('observationSummary',function () {
    return {
        restrict:'E',
        scope:{
            observation:"="
        },
        template: "<ng-include src=\"'observationSummaryTemplate'\"/>"
    }
});