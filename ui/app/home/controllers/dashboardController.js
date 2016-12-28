'use strict';

angular.module('bahmni.home')
    .controller('DashboardController', ['$scope', '$state', 'appService', 'locationService', 'spinner', '$bahmniCookieStore', '$window', '$q', 'offlineService', 'schedulerService', 'eventQueue', 'offlineDbService', 'androidDbService', 'networkStatusService', 'messagingService',
        function ($scope, $state, appService, locationService, spinner, $bahmniCookieStore, $window, $q, offlineService, schedulerService, eventQueue, offlineDbService, androidDbService, networkStatusService, messagingService) {
            $scope.appExtensions = appService.getAppDescriptor().getExtensions($state.current.data.extensionPointId, "link") || [];
            $scope.selectedLocationUuid = {};
            $scope.isOfflineApp = offlineService.isOfflineApp();

            $scope.isVisibleExtension = function (extension) {
                if (!$scope.isOfflineApp) {
                    return true;
                }
                return extension.exclusiveOnlineModule ? networkStatusService.isOnline() : extension.exclusiveOfflineModule ? !networkStatusService.isOnline() : true;
            };

            var getCurrentLocation = function () {
                return $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName) ? $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName) : null;
            };

            var init = function () {
                if ($scope.isOfflineApp) {
                    setWatchersForErrorStatus();
                }
                if (offlineService.isAndroidApp()) {
                    offlineDbService = androidDbService;
                }
                return locationService.getAllByTag("Login Location").then(function (response) {
                    $scope.locations = response.data.results;
                    $scope.selectedLocationUuid = getCurrentLocation().uuid;
                }
                );
            };

            var getLocationFor = function (uuid) {
                return _.find($scope.locations, function (location) {
                    return location.uuid === uuid;
                });
            };

            $scope.isCurrentLocation = function (location) {
                return getCurrentLocation().uuid === location.uuid;
            };

            $scope.onLocationChange = function () {
                var selectedLocation = getLocationFor($scope.selectedLocationUuid);
                $bahmniCookieStore.remove(Bahmni.Common.Constants.locationCookieName);
                $bahmniCookieStore.put(Bahmni.Common.Constants.locationCookieName, {
                    name: selectedLocation.display,
                    uuid: selectedLocation.uuid
                }, {path: '/', expires: 7});
                $window.location.reload();
            };

            $scope.sync = function () {
                schedulerService.sync(Bahmni.Common.Constants.syncButtonConfiguration);
            };

            var cleanUpListenerSchedulerStage = $scope.$on("schedulerStage", function (event, stage, restartSync) {
                $scope.isSyncing = (stage !== null);
                if (restartSync) {
                    schedulerService.stopSync();
                    schedulerService.sync();
                }
            });

            $scope.$on("$destroy", cleanUpListenerSchedulerStage);

            var getLastSyncTime = function () {
                var date = offlineService.getItem('lastSyncTime');
                var localeDate = Bahmni.Common.Util.DateUtil.parseServerDateToDate(date);
                $scope.lastSyncTime = Bahmni.Common.Util.DateUtil.getDateTimeInSpecifiedFormat(localeDate, "dddd, MMMM Do YYYY, HH:mm:ss");
            };

            var getErrorCount = function () {
                return eventQueue.getErrorCount().then(function (errorCount) {
                    return errorCount;
                });
            };

            var getEventCount = function () {
                return eventQueue.getCount().then(function (eventCount) {
                    return eventCount;
                });
            };

            var updateSyncStatusMessageBasedOnQueuesCount = function () {
                getErrorCount().then(function (errorCount) {
                    if (errorCount) {
                        $scope.syncStatusMessage = Bahmni.Common.Constants.syncStatusMessages.syncFailed;
                    } else {
                        getEventCount().then(function (eventCount) {
                            $scope.syncStatusMessage = eventCount ? Bahmni.Common.Constants.syncStatusMessages.syncPending : updateLastSyncTimeOnSuccessfullSyncAnReturnSuccessMessage();
                        });
                    }
                });
            };

            var getSyncStatusInfo = function () {
                getLastSyncTime();
                $scope.isSyncing ? $scope.syncStatusMessage = "Sync in Progress..." : updateSyncStatusMessageBasedOnQueuesCount();
            };

            var setErrorStatusOnErrorsInSync = function () {
                offlineDbService.getAllLogs().then(function (errors) {
                    $scope.errorsInSync = !!errors.length;
                });
            };

            getSyncStatusInfo();
            var setWatchersForErrorStatus = function () {
                $scope.$watch('isSyncing', function () {
                    getSyncStatusInfo();
                    setErrorStatusOnErrorsInSync();
                });
            };

            var updateLastSyncTimeOnSuccessfullSyncAnReturnSuccessMessage = function () {
                if ($scope.isSyncing !== undefined) {
                    offlineService.setItem('lastSyncTime', new Date());
                    getLastSyncTime();
                }
                return Bahmni.Common.Constants.syncStatusMessages.syncSuccess;
            };

            $scope.getStatusStyleCode = function () {
                return $scope.syncStatusMessage && ($scope.syncStatusMessage.match(/.*Success.*/i) ? 'success' : $scope.syncStatusMessage.match(/.*Pending.*/i) ? 'pending' : $scope.syncStatusMessage.match(/.*Failed.*/i) ? 'fail' : 'inProgress');
            };

            $scope.changePassword = function () {
                if ($scope.isOfflineApp) {
                    messagingService.showMessage("error", "CHANGE_PASSWORD_DOES_NOT_SUPPORT");
                    return;
                }
                $state.go('changePassword');
            };

            return spinner.forPromise($q.all(init()));
        }]);
