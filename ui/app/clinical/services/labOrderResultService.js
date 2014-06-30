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

        return {accessions: accessions, tabularResult: tabularResult};
    }

    var getAllForPatient = function (patientUuid) {
        var deferred = $q.defer();
        $http.get(Bahmni.Common.Constants.bahmniLabOrderResultsUrl, {
            method:"GET",
            params: {patientUuid: patientUuid},
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