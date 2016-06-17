'use strict';

angular.module('bahmni.common.logging')
    .service('loggingService', ['$http', 'androidDbService', function ($http, androidDbService) {

        var log = function(errorDetails){
            return androidDbService.insertLog(errorDetails.errorUrl, null, angular.toJson(errorDetails));
        };

        return {
            log: log
        }

    }]);
