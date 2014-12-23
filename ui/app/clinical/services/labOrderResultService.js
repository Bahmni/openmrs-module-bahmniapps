'use strict';

angular.module('bahmni.clinical')
    .factory('LabOrderResultService', ['$http', '$q','configurationService', function ($http, $q,configurationService) {

    var allTestsAndPanelsConcept = {};
    configurationService.getConfigurations(['allTestsAndPanelsConcept']).then(function (configurations) {
        allTestsAndPanelsConcept = configurations.allTestsAndPanelsConcept.results[0];
    });
    var sanitizeData = function(labOrderResults) {
        labOrderResults.forEach(function(result) {
            result.accessionDateTime = Bahmni.Common.Util.DateUtil.parse(result.accessionDateTime);
            result.hasRange = result.minNormal && result.maxNormal;
        });
    };

    var transformGroupSort = function(results) {
        var labOrderResults = results.results;
        sanitizeData(labOrderResults);

        var tabularResult = new Bahmni.Clinical.TabularLabOrderResults(results.tabularResult);
        var accessions = _.groupBy(labOrderResults, function(labOrderResult) {
            return labOrderResult.accessionUuid;
        });
        accessions = _.sortBy(accessions, function(accession) {
            return accession[0].accessionDateTime;
        }).reverse();

        return {accessions: groupByPanel(accessions), tabularResult: tabularResult};
    };

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
    };

    var flattened = function (accessions) {
        return accessions.map(function (results) {
            return _.flatten(results, function (result) {
                return result.isPanel == true ? [result, result.tests] : result;
            });
        });
    };

    var getAllForPatient = function (patientUuid, numberOfVisits, visitUuids) {
        var deferred = $q.defer();
        if (!patientUuid) {
            deferred.reject('patient uuid is mandatory');
        };

        var params = {};
        if (visitUuids) {
            params.visitUuids = visitUuids;
        } else {
            params.patientUuid = patientUuid;
            if (numberOfVisits !== 0) {
                params.numberOfVisits = numberOfVisits;
            }
        };

        $http.get(Bahmni.Common.Constants.bahmniLabOrderResultsUrl, {
            method: "GET",
            params: params,
            withCredentials: true
        }).then(function (response) {
            var results = transformGroupSort(response.data);
            var sortedConceptSet = new Bahmni.Clinical.ConceptWeightBasedSorter(allTestsAndPanelsConcept);
            var resultObject = {
                labAccessions: flattened(results.accessions.map(sortedConceptSet.sortTestResults)),
                tabular: results.tabularResult
            };
            resultObject.tabular.tabularResult.orders = sortedConceptSet.sortTestResults(resultObject.tabular.tabularResult.orders);
            deferred.resolve(resultObject);
        });

        return deferred.promise;

    };

    return {
        getAllForPatient: getAllForPatient
    };
}]);