'use strict';

angular.module('bahmni.clinical')
    .service('pivotTableService', ['$http', function ($http) {

        this.getPivotTableFor = function (patientUuid, diseaseSummaryConfig, visitUuid){
            return $http.get(Bahmni.Common.Constants.diseaseSummaryPivotUrl, {
                params: {
                    patientUuid: patientUuid,
                    visit: visitUuid,
                    numberOfVisits: diseaseSummaryConfig["numberOfVisits"],
                    obsConcepts: diseaseSummaryConfig["obsConcepts"],
                    drugConcepts: diseaseSummaryConfig["drugConcepts"],
                    labConcepts: diseaseSummaryConfig["labConcepts"],
                    groupBy: diseaseSummaryConfig["groupBy"]
                }
            });
        }

    }]);