'use strict';

angular.module('bahmni.clinical')
    .factory('LabOrderResultService', ['$http', '$q', function ($http, $q) {

    var transformGroupSort = function(results) {
        var labOrderResults = results.results;
        labOrderResults.forEach(function(result) {
            result.accessionDateTime = Bahmni.Common.Util.DateUtil.parse(result.accessionDateTime);
            result.hasRange = result.minNormal && result.maxNormal;
        });
        var tabularResult = new Bahmni.Clinical.TabularLabOrderResults(results.tabularResult);
        var accessions = _.groupBy(labOrderResults, function(labOrderResult) {
            return labOrderResult.accessionUuid;
        });
        accessions = _.sortBy(accessions, function(accession) {
            return accession[0].accessionDateTime;
        }).reverse();

        return {accessions: groupByPanel(accessions), tabularResult: tabularResult};
    }

    var groupByPanel = function(accessions) {
        var grouped = [];
        accessions.forEach(function(labOrders) {
            var panels = {};
            var accessionGroup = [];
            labOrders.forEach(function(labOrder) {
                if(labOrder.panelName == null) {
                    labOrder.isPanel = false;
                    labOrder.orderName = labOrder.testName;
                    accessionGroup.push(labOrder);
                } else {
                    panels[labOrder.panelName] = panels[labOrder.panelName] || {accessionDateTime: labOrder.accessionDateTime, orderName: labOrder.panelName, tests: [], isPanel: true};
                    panels[labOrder.panelName].tests.push(labOrder);
                }
            });
            _.values(panels).forEach(function(val) { accessionGroup.push(val)});
            grouped.push(accessionGroup);
        });
        return grouped;
    }

    var getAllForPatient = function (patientUuid, numberOfVisits) {
        var deferred = $q.defer();
        $http.get(Bahmni.Common.Constants.bahmniLabOrderResultsUrl, {
            method:"GET",
            params: {patientUuid: patientUuid, numberOfVisits: numberOfVisits},
            withCredentials: true
        }).then(function(results) {
            deferred.resolve(transformGroupSort(results.data));
        });
        return deferred.promise;
    }

    return {
        getAllForPatient: getAllForPatient
    };
}]);