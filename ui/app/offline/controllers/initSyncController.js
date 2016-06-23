"use strict";

angular.module('bahmni.common.offline')
    .controller('InitSyncController', ['$scope', 'ngDialog', '$state', 'offlineService', 'offlinePush', 'offlinePull','spinner',
        function ($scope, ngDialog, $state, offlineService,  offlinePush, offlinePull, spinner) {

            var init = function () {
                return offlinePush().then(function () {
                    return offlinePull().then(function () {
                            offlineService.setItem("Initial Sync Status", "Complete");
                        },
                        function () {
                            offlineService.setItem("Initial Sync Status", "Not Complete");
                        })
                });
            };

            $scope.dashboard = function () {
                $state.go('dashboard');
            };

            spinner.forPromise(init()).then(function () {
                ngDialog.open({
                    template: offlineService.getItem("Initial Sync Status") == "Complete" ? 'views/offlineSyncConfirm.html' : 'views/offlineSyncFailure.html',
                    class: 'ngdialog-theme-default',
                    scope: $scope

                });
            });


        }]);