'use strict';

angular.module('bahmni.home')
    .controller('ErrorLogController', ['$q', 'spinner', 'offlineService', 'offlineDbService', 'androidDbService', '$scope',
        function ($q, spinner, offlineService, offlineDbService, androidDbService, $scope) {
            if (offlineService.isOfflineApp()) {
                if (offlineService.isAndroidApp()) {
                    offlineDbService = androidDbService;
                }

                offlineDbService.getAllLogs().then(function (response) {
                    $scope.errorLogs = response;
                    _.each($scope.errorLogs, function(errorLog){
                        try {
                            var value = JSON.parse(errorLog.stackTrace);
                            errorLog.stackTrace = value;
                        }catch(ex){}
                    })
                });

            }
        }]);

