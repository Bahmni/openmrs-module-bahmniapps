'use strict';

angular.module('bahmni.common.offline')
    .factory('eventLogService', ['$http', function ($http) {
        var getEventsFor = function (catchmentNumber, lastReadUuid) {
            return $http.get('/event-log-service/rest/eventlog/getevents', {
                params: {filterBy: catchmentNumber, uuid: lastReadUuid}
            })
        };

        var getDataForUrl = function (url) {
            return $http.get(url);
        };

        return {
            getEventsFor: getEventsFor,
            getDataForUrl: getDataForUrl
        };
    }]);