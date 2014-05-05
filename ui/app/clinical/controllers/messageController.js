'use strict';

angular.module('bahmni.clinical')
    .controller('MessageController', ['$scope', 'MessagingService',
        function ($scope, messagingService) {
            $scope.messages = messagingService.messages;
        }]);
