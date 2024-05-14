'use strict';
angular.module('bahmni.common.displaycontrol.pivottable').directive('pivotTable', ['$rootScope', '$filter', '$stateParams', 'spinner', 'pivotTableService', 'appService', 'conceptSetUiConfigService', '$interval',
    function ($rootScope, $filter, $stateParams, spinner, pivotTableService, appService, conceptSetUiConfigService, $interval) {
        return {
            scope: {
                patientUuid: "=",
                diseaseName: "=",
                displayName: "=",
                config: "=",
                visitUuid: "=",
                status: "=?"
            },
            link: function (scope, element) {
                var tablescroll;
                if (!scope.config) {
                    return;
                }

                scope.groupBy = scope.config.groupBy || "visits";
                scope.heading = scope.config.rowHeading || scope.groupBy;
                scope.groupByEncounters = scope.groupBy === "encounters";
                scope.groupByVisits = scope.groupBy === "visits";

                scope.getOnlyDate = function (startdate) {
                    return Bahmni.Common.Util.DateUtil.formatDateWithoutTime(startdate);
                };

                scope.getOnlyTime = function (startDate) {
                    return Bahmni.Common.Util.DateUtil.formatTime(startDate);
                };

                scope.isLonger = function (value) {
                    return value ? value.length > 13 : false;
                };

                scope.getColumnValue = function (value, conceptName) {
                    if (conceptName && conceptSetUiConfigService.getConfig()[conceptName] && conceptSetUiConfigService.getConfig()[conceptName].displayMonthAndYear == true) {
                        return Bahmni.Common.Util.DateUtil.getDateInMonthsAndYears(value);
                    }
                    const number = Number.parseFloat(value);
                    return number ? number : scope.isLonger(value) ? value.substring(0, 10) + "..." : value;
                };

                scope.scrollLeft = function () {
                    $('table.pivot-table tbody').animate({
                        scrollLeft: 0});
                    return false;
                };
                scope.scrollRight = function () {
                    $('table.pivot-table tbody').animate({
                        scrollLeft: tablescroll});
                    return false;
                };

                var programConfig = appService.getAppDescriptor().getConfigValue("program") || {};

                var startDate = null, endDate = null;
                if (programConfig.showDetailsWithinDateRange) {
                    startDate = $stateParams.dateEnrolled;
                    endDate = $stateParams.dateCompleted;
                }

                var checkIfPivotTableLoaded = $interval(function () {
                    if ($('table.pivot-table tbody tr').length > 11) {
                        $('table.pivot-table tbody').animate({
                            scrollLeft: '20000px' }, 500);
                        tablescroll = $('table.pivot-table tbody').scrollLeft();
                        clearInterval(checkIfPivotTableLoaded);
                    }
                    else if ($('table.pivot-table tbody tr').length < 12) {
                        $('.btn-scroll-right, .btn-scroll-left').attr("disabled", true);
                        clearInterval(checkIfPivotTableLoaded);
                    }
                }, 1000, 2);

                var pivotDataPromise = pivotTableService.getPivotTableFor(scope.patientUuid, scope.config, scope.visitUuid, startDate, endDate);
                spinner.forPromise(pivotDataPromise, element);
                pivotDataPromise.then(function (response) {
                    var concepts = _.map(response.data.conceptDetails, function (conceptDetail) {
                        return {
                            name: conceptDetail.fullName,
                            shortName: conceptDetail.name,
                            lowNormal: conceptDetail.lowNormal,
                            hiNormal: conceptDetail.hiNormal,
                            units: conceptDetail.units
                        };
                    });
                    if (scope.config.obsConcepts) {
                        concepts.sort(function (a, b) {
                            const indexOfA = scope.config.obsConcepts.indexOf(a.name);
                            const indexOfB = scope.config.obsConcepts.indexOf(b.name);
                            return indexOfA - indexOfB;
                        });
                    }
                    var tabluarDataInAscOrderByDate = _(response.data.tabularData).toPairs().sortBy(0).fromPairs().value();
                    scope.result = {concepts: concepts, tabularData: tabluarDataInAscOrderByDate};
                    scope.hasData = !_.isEmpty(scope.result.tabularData);
                    scope.status = scope.status || {};
                    scope.status.data = scope.hasData;
                });
                scope.showOnPrint = !$rootScope.isBeingPrinted;
            },

            templateUrl: '../common/displaycontrols/pivottable/views/pivotTable.html'
        };
    }]);
