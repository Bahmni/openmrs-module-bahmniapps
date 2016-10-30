'use strict';

angular.module('bahmni.common.uiHelper')
    .controller('MessageController', ['$scope', 'messagingService',
        function ($scope, messagingService) {
            $scope.messages = messagingService.messages;

            $scope.getMessageText = function (level) {
                var string = "";
                $scope.messages[level].forEach(function (message) {
                    string = string.concat(message.value);
                });
                return string;
            };

            $scope.hideMessage = function (level) {
                messagingService.hideMessages(level);
            };

            $scope.isErrorMessagePresent = function () {
                return $scope.messages.error.length > 0;
            };

            $scope.isInfoMessagePresent = function () {
                return $scope.messages.info.length > 0;
            };
        }]);
