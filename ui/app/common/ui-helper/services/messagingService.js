'use strict';

angular.module('bahmni.common.uiHelper')
    .service('messagingService', ['$rootScope', function ($rootScope) {
        this.messages = {error: [], info: [], formError: []};
        var self = this;

        $rootScope.$on('event:serverError', function (event, errorMessage) {
            self.showMessage('error', errorMessage, 'serverError');
        });

        this.showMessage = function (level, message, errorEvent) {
            var messageObject = {'value': '', 'isServerError': false};
            messageObject.value = message;
            if (errorEvent) {
                messageObject.isServerError = true;
            }
            this.messages[level].push(messageObject);
        };

        this.hideMessages = function (level) {
            self.messages[level].length = 0;
        }
    }]);
