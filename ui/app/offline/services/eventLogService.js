'use strict';

angular.module('bahmni.offline')
    .factory('eventLogService', ['$http', function ($http) {
        var getEventsFor = function (catchmentNumber) {
            return $http.get('eventlogservice/getevents', {
                params: {filterBy: catchmentNumber}
            });
        };

        return {
            getEventsFor: getEventsFor
        };
    }]);