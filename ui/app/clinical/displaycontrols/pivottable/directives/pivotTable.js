'use strict';
angular.module('bahmni.clinical').directive('pivotTable', ['$filter','spinner','pivotTableService','clinicalAppConfigService',
    function ($filter,spinner,pivotTableService,clinicalAppConfigService) {

        return {
            scope: {
                patientUuid: "=",
                diseaseName: "=",
                displayName: "=",
                section: "="
            },
            link: function (scope) {
                
                var diseaseSummaryConfig = scope.section["pivotTable"];
                if(!diseaseSummaryConfig) return;

                var patientUuid = scope.patientUuid;
                
                scope.groupBy = diseaseSummaryConfig.groupBy || "visits";
                scope.groupByEncounters = scope.groupBy === "encounters";
                
                scope.convertDate = function(startdate) {
                    return moment(startdate).format("DD MMM YY hh:mm A");
                }

                var pivotDataPromise = pivotTableService.getPivotTableFor(patientUuid,diseaseSummaryConfig);
                spinner.forPromise(pivotDataPromise);
                pivotDataPromise.success(function (data) {
                    scope.result = data;
                    scope.hasData = !_.isEmpty(scope.result.tabularData);
                })
            },
            templateUrl: 'displaycontrols/pivottable/views/pivotTable.html'
        }
}]);