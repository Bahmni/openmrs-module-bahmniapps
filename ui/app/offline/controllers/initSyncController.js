"use strict";

angular.module('bahmni.common.offline')
    .controller('InitSyncController', ['$scope', 'ngDialog', '$state', 'offlineService', 'offlinePush', 'offlinePull', 'spinner', 'sessionService', '$q',
        function ($scope, ngDialog, $state, offlineService, offlinePush, offlinePull, spinner, sessionService, $q) {
            var init = function () {
                var deferred = $q.defer();
                offlinePull().then(function () {
                    offlineService.setItem("initialSyncStatus", "complete");
                    deferred.resolve();
                },
                    function () {
                        offlineService.setItem("initialSyncStatus", "notComplete");
                        deferred.reject();
                    });
                return deferred.promise;
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

            if (offlineService.getItem("initialSyncStatus") == "complete") {
                $state.go('dashboard');
            } else {
                init().then(syncSuccessCallBack, syncFailureCallBack);
            }
        }]);
