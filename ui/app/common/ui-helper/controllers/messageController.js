'use strict';

angular.module('bahmni.common.uiHelper')
    .controller('MessageController', ['$scope', 'messagingService',
        function ($scope, messagingService) {
            $scope.messages = messagingService.messages;

            $scope.getErrorMessageText = function(){
                var string = "";
                $scope.messages.error.forEach(function(errorMessage){
                    string = string.concat(errorMessage.value);
                });
                return string;
            };

            $scope.showError = false;

            $scope.toggleShowError = function (){
                $scope.showError = !$scope.showError;
                if ($scope.showError === true) {
                    messagingService.cancelTimeout();
                } else {
                    messagingService.createTimeout("error", 0);
                }
            };

            $scope.isErrorMessagePresent = function(){
                return $scope.messages.error.length > 0;
            };

            $scope.isFormErrorMessagePresent = function(){
                return $scope.messages.formError.length > 0;
            };

            $scope.isInfoMessagePresent = function(){
                return $scope.messages.info.length > 0;
            }
        }]);
