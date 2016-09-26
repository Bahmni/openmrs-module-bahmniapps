'use strict';

angular.module('bahmni.common.uiHelper')
    .factory('spinner', ['messagingService', function (messagingService) {

        var showSpinnerForElement = function (element) {
            $('#overlay').hide();
            if($(element).find(".dashboard-section-loader").length === 0)
                $(element).append('<div class="dashboard-section-loader"></div>');
            return element;
        };

        var showSpinnerForOverlay = function () {
            $('body').prepend('<div id="overlay"><div></div></div>');
            $('#overlay').stop().show();
            return "body";
        };

        var show = function (element) {
            messagingService.hideMessages("error");
            if (element !== undefined)
                return showSpinnerForElement(element);

            if ($('#overlay').length == 0)
                return showSpinnerForOverlay();
        };

        var hide = function (reference) {
            var element = $(reference);
            var domElement = element.find(".dashboard-section-loader");
            _.isEmpty(domElement) ? element.find("#overlay").hide() : domElement.hide();
        };

        var forPromise = function (promise, element) {
            var token = show(element); //Don't inline this element
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
