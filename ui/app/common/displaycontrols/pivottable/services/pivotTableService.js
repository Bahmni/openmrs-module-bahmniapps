'use strict';

angular.module('bahmni.common.displaycontrol.pivottable')
    .service('pivotTableService', ['$http', function ($http) {
        this.getPivotTableFor = function (patientUuid, diseaseSummaryConfig, visitUuid, startDate, endDate) {
            return $http.get(Bahmni.Common.Constants.diseaseSummaryPivotUrl, {
                params: {
                    patientUuid: patientUuid,
                    visit: visitUuid,
                    numberOfVisits: diseaseSummaryConfig["numberOfVisits"],
                    initialCount: diseaseSummaryConfig["initialCount"],
                    latestCount: diseaseSummaryConfig["latestCount"],
                    obsConcepts: diseaseSummaryConfig["obsConcepts"],
                    drugConcepts: diseaseSummaryConfig["drugConcepts"],
                    labConcepts: diseaseSummaryConfig["labConcepts"],
                    groupBy: diseaseSummaryConfig["groupBy"],
                    startDate: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(startDate),
                    endDate: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(endDate)
                }
            });
        };
    }]);
