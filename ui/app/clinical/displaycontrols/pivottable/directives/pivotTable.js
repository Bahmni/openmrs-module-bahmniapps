'use strict';
angular.module('bahmni.clinical').directive('pivotTable', ['$filter','spinner','pivotTableService','clinicalAppConfigService',
    function ($filter,spinner,pivotTableService,clinicalAppConfigService) {

        return {
            scope: {
                patientUuid: "=",
                diseaseName: "=",
                displayName: "=",
                config: "=",
                visitUuid:"="
            },
            link: function (scope) {

                if(!scope.config) return;

                scope.groupBy = scope.config.groupBy || "visits";
                scope.groupByEncounters = scope.groupBy === "encounters";
                
                scope.convertDate = function(startdate) {
                    return moment(startdate).format("DD MMM YY hh:mm A");
                }

                var pivotDataPromise = pivotTableService.getPivotTableFor(scope.patientUuid,scope.config, scope.visitUuid );
                spinner.forPromise(pivotDataPromise);
                pivotDataPromise.success(function (data) {
                    scope.result = data;
                    scope.hasData = !_.isEmpty(scope.result.tabularData);
                })
            },
            templateUrl: 'displaycontrols/pivottable/views/pivotTable.html'
        }
}]);