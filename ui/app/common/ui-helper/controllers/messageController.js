'use strict';

angular.module('bahmni.common.uiHelper')
    .controller('MessageController', ['$scope', 'messagingService', '$translate',
        function ($scope, messagingService, $translate) {
            $scope.messages = messagingService.messages;

            $scope.getMessageText = function (level) {
                var string = "";
                $scope.messages[level].forEach(function (message) {
                    string = string.concat(message.value);
                });
                var translatedMessage = $translate.instant(string);

                navigator.clipboard.writeText(translatedMessage);

                return translatedMessage;
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
