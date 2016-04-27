'use strict';

angular.module('bahmni.common.offline')
    .factory('eventLogService', ['$http', function ($http) {
        var getEventsFor = function (catchmentNumber, lastReadUuid) {
            return $http.get(Bahmni.Common.Constants.eventLogServiceUrl, {
                params: {filterBy: catchmentNumber, uuid: lastReadUuid}
            })
        };

        var getAddressEventsFor = function (catchmentNumber, lastReadUuid) {
            return $http.get(Bahmni.Common.Constants.addressEventLogServiceUrl, {
                params: {filterBy: catchmentNumber, uuid: lastReadUuid}
            })
        };

        var getConceptEventsFor = function (lastReadUuid) {
            return $http.get(Bahmni.Common.Constants.eventLogServiceConceptUrl, {
                params: {uuid: lastReadUuid}
            })
        };

        var getDataForUrl = function (url) {
            return $http.get(url);
        };

        var getAddressForLoginLocation = function(params){
            var url = Bahmni.Common.Constants.openmrsUrl +
                "/module/addresshierarchy/ajax/getPossibleAddressHierarchyEntriesWithParents.form";
            return $http.get(url, { method: "GET", params: params, withCredentials: true});
        };


        return {
            getEventsFor: getEventsFor,
            getConceptEventsFor: getConceptEventsFor,
            getDataForUrl: getDataForUrl,
            getAddressForLoginLocation: getAddressForLoginLocation,
            getAddressEventsFor: getAddressEventsFor
        };
    }]);