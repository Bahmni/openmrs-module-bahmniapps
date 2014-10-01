'use strict';

angular.module('bahmni.common.uiHelper')
    .service('messagingService', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
        this.messages = {error: [], info: []};
        var self = this;

        $rootScope.$on('event:serverError', function(event, errorMessage) {
            self.showMessage('error',  errorMessage);
        });

        this.showMessage = function(level, message) {
            if (level === 'error') {
                this.messages.error.push(message);
                $timeout(function(){
                    self.messages.error = [];
                }, 6000, true);
            }

            if (level === 'info') {
                this.messages.info.push(message);
                $timeout(function(){
                    self.messages.info = [];
                }, 6000, true);
            }
        };
    }]);