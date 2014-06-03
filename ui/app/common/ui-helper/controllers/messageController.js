'use strict';

angular.module('bahmni.common.uiHelper')
    .controller('MessageController', ['$scope', 'MessagingService',
        function ($scope, messagingService) {
            $scope.messages = messagingService.messages;
        }]);
