'use strict';
angular.module('bahmni.common.displaycontrol.pivottable').directive('pivotTable', ['$rootScope', '$filter', '$stateParams' ,'spinner', 'pivotTableService', 'appService',
    function ($rootScope, $filter, $stateParams, spinner, pivotTableService, appService) {

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

                if(!scope.config) return;

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

                scope.getColumnValue = function(value){
                    return scope.isLonger(value) ? value.substring(0,10)+"..." : value;
                };

                var programConfig = appService.getAppDescriptor().getConfigValue("program") || {};

                var startDate = null, endDate = null, getOtherActive;
                if (programConfig.showDashBoardWithinDateRange) {
                    startDate = $stateParams.dateEnrolled;
                    endDate = $stateParams.dateCompleted;
                }

                var pivotDataPromise = pivotTableService.getPivotTableFor(scope.patientUuid, scope.config, scope.visitUuid, startDate, endDate);
                spinner.forPromise(pivotDataPromise);
                pivotDataPromise.success(function (data) {
                    scope.result = data;
                    scope.hasData = !_.isEmpty(scope.result.tabularData);
                    scope.status = scope.status || {};
                    scope.status.data = scope.hasData;
                });
                scope.showOnPrint = !$rootScope.isBeingPrinted
            },
            templateUrl: '../common/displaycontrols/pivottable/views/pivotTable.html'
        }
}]);