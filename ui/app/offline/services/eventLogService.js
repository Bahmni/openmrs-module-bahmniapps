'use strict';

angular.module('bahmni.offline')
    .factory('eventLogService', ['$http', function ($http) {
        var getEventsFor = function (catchmentNumber) {
            return $http.get('/event-log-service/rest/eventlog/getevents', {
                params: {filterBy: catchmentNumber}
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