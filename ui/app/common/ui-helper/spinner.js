'use strict';

angular.module('bahmni.common.uiHelper')
    .factory('spinner', ['messagingService', function (messagingService) {
        var tokens = [];

        var show = function (element) {
            messagingService.hideMessages("error");
            var token = Math.random();
            tokens.push(token);
            if(element !== undefined)
                $(element).prepend('<div class="section-title-loader"><img src="../images/spinner.gif" /></div>');
            return token;
        };

        var hide = function (token) {
            _.pull(tokens, token);
            if (tokens.length === 0) {
                $('.section-title-loader').fadeOut(300);
            }
        };

        var forPromise = function (promise, element) {
            var token = show(element);
            promise['finally'](function () {
                hide(token);
            });
            return promise;
        };

        var forAjaxPromise = function (promise, element) {
            var token = show(element);
            promise.always(function () {
                hide(token);
            });
            return promise;
        };

        return {
            forPromise: forPromise,
            forAjaxPromise: forAjaxPromise,
            show: show,
            hide: hide
        }
    }]);
