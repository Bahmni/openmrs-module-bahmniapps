'use strict';

angular.module('bahmni.common.logging')
    .service('loggingService', ['$http', 'offlineDbService', function ($http, offlineDbService) {

        var log = function(errorDetails){
            return offlineDbService.insertLog(errorDetails.errorUrl, null, angular.toJson(errorDetails));
        };

        return {
            log: log
        }

    }]);
