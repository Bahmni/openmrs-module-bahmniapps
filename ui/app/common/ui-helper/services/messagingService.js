'use strict';

angular.module('bahmni.common.uiHelper')
    .service('messagingService', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
        this.messages = {error: [], info: []};
        var self = this;
        var promise;

        $rootScope.$on('event:serverError', function(event, errorMessage) {
            self.showMessage('error',  errorMessage);
        });

        this.showMessage = function(level, message) {
            this.messages[level].push(message);
            if(this.messages[level].length === 1){
                this.createTimeout(level);
            }
        };

        this.createTimeout = function(level) {
            promise = $timeout(function(){ self.messages[level] = [];}, 6000, true);
        };

        this.cancelTimeout = function(){
            $timeout.cancel(promise);
        };
    }]);