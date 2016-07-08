"use strict";

angular.module('bahmni.common.offline')
    .controller('InitSyncController', ['$scope', 'ngDialog', '$state', 'offlineService', 'offlinePush', 'offlinePull','spinner','sessionService','$q',
        function ($scope, ngDialog, $state, offlineService,  offlinePush, offlinePull, spinner, sessionService, $q) {

            var init = function () {
                var deferred = $q.defer();
                 offlinePull().then(function () {
                        offlineService.setItem("Initial Sync Status", "Complete");
                     deferred.resolve();
                    },
                    function () {
                        offlineService.setItem("Initial Sync Status", "Not Complete");
                        deferred.reject();
                    });
                return deferred.promise;
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

            if(offlineService.getItem("Initial Sync Status") == "Complete")
                $state.go('dashboard');
            else
            spinner.forPromise(init()).then(function () {
                ngDialog.open({
                    template: offlineService.getItem("Initial Sync Status") == "Complete" ? 'views/offlineSyncConfirm.html' : 'views/offlineSyncFailure.html',
                    class: 'ngdialog-theme-default',
                    closeByEscape:false,
                    showClose:false,
                    scope: $scope

                });
            });


        }]);