"use strict";

angular.module('bahmni.common.offline')
    .controller('InitSyncController', ['$scope', 'ngDialog', '$state', 'offlineService', 'offlinePush', 'offlinePull', 'spinner', 'sessionService', '$q', 'offlineLocationInitialization',
        function ($scope, ngDialog, $state, offlineService, offlinePush, offlinePull, spinner, sessionService, $q, offlineLocationInitialization) {
            var loginLocationUuid = offlineService.getItem('LoginInformation') ? offlineService.getItem('LoginInformation').currentLocation.uuid : undefined;
            var init = function () {
                var deferred = $q.defer();
                offlinePull().then(function () {
                    setInitialStatus("complete");
                    deferred.resolve();
                }, function () {
                    setInitialStatus("notComplete");
                    deferred.reject();
                });
                return deferred.promise;
            };

            var setInitialStatus = function (status) {
                var locationSyncStatus = {};
                if (loginLocationUuid) {
                    var initialSyncStatus = offlineService.getItem("initialSyncStatus");
                    locationSyncStatus[loginLocationUuid] = status;
                    initialSyncStatus = initialSyncStatus ? _.extend(initialSyncStatus, locationSyncStatus) : locationSyncStatus;
                    offlineService.setItem("initialSyncStatus", initialSyncStatus);
                }
            };

            var syncSuccessCallBack = function () {
                $scope.showSyncInfo = false;
                ngDialog.open({
                    template: 'views/offlineSyncConfirm.html',
                    class: 'ngdialog-theme-default',
                    closeByEscape: false,
                    showClose: false,
                    scope: $scope

                });
            };

            var syncFailureCallBack = function () {
                $scope.showSyncInfo = false;
                ngDialog.open({
                    template: 'views/offlineSyncFailure.html',
                    class: 'ngdialog-theme-default',
                    closeByEscape: false,
                    showClose: false,
                    scope: $scope

                });
            };

            $scope.dashboard = function () {
                $state.go('dashboard');
            };

            $scope.logout = function () {
                sessionService.destroy().then(
                  function () {
                      $state.go('login');
                  }
                );
            };

            var syncStatus = offlineService.getItem("initialSyncStatus");
            if (syncStatus && syncStatus[loginLocationUuid] === "complete") {
                $state.go('dashboard');
            } else if (syncStatus && !syncStatus[loginLocationUuid]) {
                offlineLocationInitialization().then(function () {
                    init().then(syncSuccessCallBack, syncFailureCallBack);
                });
            } else {
                init().then(syncSuccessCallBack, syncFailureCallBack);
            }
        }]
    );
