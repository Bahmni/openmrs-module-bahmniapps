'use strict';

angular.module('bahmni.common.uiHelper')
    .service('MessagingService', ['$timeout', function ($timeout) {
        this.messages = {error: [], info: []};
        var that = this;

        this.showMessage = function(level, message) {
            if (level === 'error') {
                this.messages.error.push(message);
                that = this;
                $timeout(function(){
                    that.messages.error = [];
                }, 6000, true);
            }

            if (level === 'info') {
                this.messages.info.push(message);
                that = this;
                $timeout(function(){
                    that.messages.info = [];
                }, 6000, true);
            }
        };
    }]);