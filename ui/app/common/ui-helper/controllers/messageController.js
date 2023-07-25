'use strict';

angular.module("bahmni.common.uiHelper").controller("MessageController", [ "$scope", "messagingService", "$translate", "$state", "exitAlertService",
    function ($scope, messagingService, $translate, $state, exitAlertService) {
        $scope.messages = messagingService.messages;

        $scope.hideMessage = function (level) {
            messagingService.hideMessages(level);
        };

        $scope.isErrorMessagePresent = function () {
            return $scope.messages.error.length > 0;
        };

        $scope.isInfoMessagePresent = function () {
            return $scope.messages.info.length > 0;
        };

        $scope.isAlertMessagePresent = function () {
            return $scope.messages.alert.length > 0;
        };

            $scope.isErrorMessagePresent = function () {
                return $scope.messages.error.length > 0;
            };

        $scope.isInfoMessagePresent = function () {
            return $scope.messages.info.length > 0;
        };

        $scope.isAlertMessagePresent = function () {
            return $scope.messages.alert.length > 0;
        }

        $scope.discardChanges = function (level) {
            $state.discardChanges = true;
            $scope.hideMessage(level);
            exitAlertService.redirectUrl();
        }
    }
]);
