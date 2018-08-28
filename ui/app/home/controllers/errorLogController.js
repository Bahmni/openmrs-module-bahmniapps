'use strict';

angular.module('bahmni.home')
    .controller('ErrorLogController', ['$q', 'spinner', 'offlineService', 'offlineDbService', 'androidDbService', '$scope', 'appService',
        function ($q, spinner, offlineService, offlineDbService, androidDbService, $scope, appService) {
            $scope.displayNepaliDates = appService.getAppDescriptor().getConfigValue('displayNepaliDates');
            $scope.errorLogs = [];
            $scope.showErrorLog = true;
            if (offlineService.isOfflineApp()) {
                if (offlineService.isAndroidApp()) {
                    offlineDbService = androidDbService;
                }

                spinner.forPromise(offlineDbService.getAllLogs().then(function (response) {
                    $scope.errorLogs = response;
                    _.each($scope.errorLogs, function (errorLog) {
                        try {
                            var value = JSON.parse(errorLog.stackTrace);
                            errorLog.stackTrace = value;
                        } catch (ex) {}
                    });
                }));
            }
        }]);

