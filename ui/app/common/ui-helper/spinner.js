'use strict';

angular.module('bahmni.common.uiHelper')
    .factory('spinner', ['messagingService', function (messagingService) {
        var tokens = [];
        var overlayTokens = [];

        var showSpinnerForElement = function (token, element) {
            $('#overlay').hide();
            tokens.push(token);
            $(element).append('<div class="dashboard-section-loader"></div>');
            return token;
        };

        var showSpinnerForOverlay = function (token) {
            overlayTokens.push(token);
            $('body').prepend('<div id="overlay"><div></div></div>');
            $('#overlay').stop().show();
            return token;
        };

        var show = function (element) {
            messagingService.hideMessages("error");
            var token = Math.random();
            if (element !== undefined)
                return showSpinnerForElement(token, element);

            if ($('#overlay').length == 0)
                return showSpinnerForOverlay(token);
        };

        var hide = function (token) {
            _.pull(tokens, token);
            _.pull(overlayTokens, token);
            if (tokens.length === 0) {
                $('.dashboard-section-loader').fadeOut(300);
            }
            if (overlayTokens.length === 0) {
                $('#overlay').fadeOut(300);
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
