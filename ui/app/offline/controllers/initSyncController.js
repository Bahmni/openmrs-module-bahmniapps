"use strict";

angular.module('bahmni.common.offline')
    .controller('InitSyncController', ['$scope', 'ngDialog', '$state',
        function ($scope, ngDialog, $state) {

            $scope.dashboard = function () {
                $state.go('dashboard');
            };

            ngDialog.open({
                template: 'views/offlineSyncConfirm.html',
                class: 'ngdialog-theme-default',
                scope: $scope

            });

        }]);