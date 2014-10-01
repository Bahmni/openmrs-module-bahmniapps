'use strict';

angular.module('bahmni.common.uiHelper')
    .service('messagingService', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
        this.messages = {error: [], info: []};
        var self = this;

        $rootScope.$on('event:serverError', function(event, errorMessage) {
            self.showMessage('error',  errorMessage);
        });

        this.showMessage = function(level, message) {
            this.messages[level].push(message);
            $timeout(function(){ self.messages[level] = [];}, 6000, true);
        };
    }]);