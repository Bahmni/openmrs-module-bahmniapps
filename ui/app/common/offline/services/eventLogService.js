'use strict';

angular.module('bahmni.common.offline')
    .factory('eventLogService', ['$http', function ($http) {
        var getEventsFor = function (catchmentNumber, lastReadUuid) {
            return $http.get(Bahmni.Common.Constants.eventLogServiceUrl, {
                params: {filterBy: catchmentNumber, uuid: lastReadUuid}
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

        var getParentAddressHierarchyEntriesForLoginLocation = function(uuids){
            var params = {"uuids" :uuids};
            var url =  Bahmni.Common.Constants.hostURL + "/openmrs/ws/rest/v1/addressHierarchy";
            return $http.get(url, { method: "GET", params: params, withCredentials: true});
        };

        return {
            getEventsFor: getEventsFor,
            getDataForUrl: getDataForUrl,
            getAddressForLoginLocation: getAddressForLoginLocation,
            getParentAddressHierarchyEntriesForLoginLocation: getParentAddressHierarchyEntriesForLoginLocation
        };
    }]);