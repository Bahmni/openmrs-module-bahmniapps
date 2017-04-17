"use strict";

angular.module('bahmni.common.offline')
    .controller('InitSyncController', ['$scope', 'ngDialog', '$state', 'offlineService', 'offlinePush', 'offlinePull', 'spinner', 'sessionService', '$q', 'offlineLocationInitialization', 'dbNameService',
        function ($scope, ngDialog, $state, offlineService, offlinePush, offlinePull, spinner, sessionService, $q, offlineLocationInitialization, dbNameService) {
            var loginLocationUuid = offlineService.getItem('LoginInformation') ? offlineService.getItem('LoginInformation').currentLocation.uuid : undefined;
            var loginInformation = offlineService.getItem('LoginInformation');
            var location = loginInformation ? loginInformation.currentLocation.display : null;
            var username = offlineService.getItem("userData").results[0].username;
            var dbName;
            var init = function () {
                var deferred = $q.defer();
                dbNameService.getDbName(username, location).then(function (dbName) {
                    return dbName;
                }).then(function (dbName) {
                    offlinePull(true).then(function () {
                        setInitialStatus("complete", dbName);
                        deferred.resolve();
                    }, function () {
                        setInitialStatus("notComplete", dbName);
                        deferred.reject();
                    });
                });
                return deferred.promise;
            };

            var setInitialStatus = function (status, dbName) {
                if (loginLocationUuid) {
                    var initialSyncStatus = offlineService.getItem("initialSyncStatus") || {};
                    initialSyncStatus[dbName] = initialSyncStatus[dbName] || {};
                    initialSyncStatus[dbName][loginLocationUuid] = status;
                    offlineService.setItem("initialSyncStatus", initialSyncStatus);
                }
            };

            var syncSuccessCallBack = function () {
                $scope.showSyncInfo = false;
                ngDialog.open({
                    template: 'views/offlineSyncConfirm.html',
                    class: 'ngdialog-theme-default',
                    closeByEscape: false,
                    closeByDocument: false,
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
                    closeByDocument: false,
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
            dbNameService.getDbName(username, location).then(function (name) {
                dbName = name;
                return dbName;
            }).then(function (dbName) {
                if (syncStatus && syncStatus[dbName] && syncStatus[dbName][loginLocationUuid] === "complete") {
                    $state.go('dashboard');
                } else if (syncStatus && syncStatus[dbName] && !syncStatus[dbName][loginLocationUuid]) {
                    offlineLocationInitialization().then(function () {
                        init().then(syncSuccessCallBack, syncFailureCallBack);
                    });
                } else {
                    init().then(syncSuccessCallBack, syncFailureCallBack);
                }
            });
        }]
    );
