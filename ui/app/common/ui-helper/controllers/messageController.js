'use strict';

angular.module("bahmni.common.uiHelper").controller("MessageController", [
    "$scope",
    "messagingService",
    "$translate",
    "$location",
    "$state",
    function ($scope, messagingService, $translate, $location, $state) {
        $scope.messages = messagingService.messages;
        $scope.isNavigating = false;

            $scope.getMessageText = function (level) {
                var string = "";
                $scope.messages[level].forEach(function (message) {
                    string = string.concat(message.value);
                });

                navigator.clipboard.writeText(string);

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

        $scope.discardChanges = function (level) {
            $scope.isNavigating = false;
            $state.dirtyConsultationForm = false;
            $scope.hideMessage(level);
            $location.path('/default/patient/search');
        }

        $scope.$on("$stateChangeStart", function (event, next, current) {
            if (next.url.includes("/patient/search")) {
                $scope.isNavigating = true;
            }
        })

    }
]);
