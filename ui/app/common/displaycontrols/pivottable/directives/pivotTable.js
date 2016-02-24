'use strict';
angular.module('bahmni.common.displaycontrol.pivottable').directive('pivotTable', ['$rootScope', '$filter', '$stateParams' ,'spinner', 'pivotTableService', 'appService','conceptSetUiConfigService',
    function ($rootScope, $filter, $stateParams, spinner, pivotTableService, appService, conceptSetUiConfigService) {

        return {
            scope: {
                patientUuid: "=",
                diseaseName: "=",
                displayName: "=",
                config: "=",
                visitUuid:"=",
                status:"=?"
            },
            link: function (scope) {

                if(!scope.config) {
                    return;
                }

                scope.groupBy = scope.config.groupBy || "visits";
                scope.groupByEncounters = scope.groupBy === "encounters";
                scope.groupByVisits = scope.groupBy === "visits";
                
                scope.getOnlyDate = function(startdate) {
                    return Bahmni.Common.Util.DateUtil.formatDateWithoutTime(startdate);
                };

                scope.getOnlyTime = function(startDate) {
                    return Bahmni.Common.Util.DateUtil.formatTime(startDate);
                };

                scope.isLonger = function(value){
                   return value ? value.length > 13 : false;
                };

                scope.getColumnValue = function(value, conceptName){
                    if(conceptName && conceptSetUiConfigService.getConfig()[conceptName] && conceptSetUiConfigService.getConfig()[conceptName].displayMonthAndYear == true) {
                        return Bahmni.Common.Util.DateUtil.getDateInMonthsAndYears(value);
                    }
                    return scope.isLonger(value) ? value.substring(0,10)+"..." : value;
                };

                var programConfig = appService.getAppDescriptor().getConfigValue("program") || {};

                var startDate = null, endDate = null;
                if (programConfig.showDetailsWithinDateRange) {
                    startDate = $stateParams.dateEnrolled;
                    endDate = $stateParams.dateCompleted;
                }

                var pivotDataPromise = pivotTableService.getPivotTableFor(scope.patientUuid, scope.config, scope.visitUuid, startDate, endDate);
                spinner.forPromise(pivotDataPromise);
                pivotDataPromise.then(function(response){
                    var concepts = _.map(response.data.conceptDetails,function(conceptDetail){
                        return {
                            name:conceptDetail.fullName,
                            shortName:conceptDetail.name,
                            lowNormal:conceptDetail.lowNormal,
                            hiNormal:conceptDetail.hiNormal,
                            units:conceptDetail.units
                        };
                    });
                    scope.result = {concepts:concepts,tabularData:response.data.tabularData};
                    scope.hasData = !_.isEmpty(scope.result.tabularData);
                    scope.status = scope.status || {};
                    scope.status.data = scope.hasData;
                });
                scope.showOnPrint = !$rootScope.isBeingPrinted;
            },
            templateUrl: '../common/displaycontrols/pivottable/views/pivotTable.html'
        }
}]);