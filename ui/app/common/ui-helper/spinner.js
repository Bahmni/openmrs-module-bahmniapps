'use strict';

angular.module('bahmni.common.uiHelper')
    .factory('spinner', ['messagingService', '$timeout', '$rootScope', function (messagingService, $timeout, $rootScope) {

        var showSpinnerForElement = function (element) {
            $('#overlay').remove();
            if($(element).find(".dashboard-section-loader").length === 0) {
              var topLevelDiv = $(element).find("div").eq(0);
              topLevelDiv.addClass('spinnable');
              topLevelDiv.append('<div class="dashboard-section-loader"></div>');
            }
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
            _.isEmpty(domElement) ? element.find("#overlay").remove() : domElement.remove();
        };

        var forPromise = function (promise, element) {
            return $timeout(function() {
                // Added timeout to push a new event into event queue. So that its callback will be invoked once DOM is completely rendered
                var token = show(element);                      // Don't inline this element
                promise['finally'](function () {
                    hide(token);
                });
                return promise;
            })
        };

        var forAjaxPromise = function (promise, element) {
            var token = show(element);
            promise.always(function () {
                hide(token);
            });
            return promise;
        };

        $rootScope.$on('$stateChangeStart', function() {
            hide("body");
        });

        return {
            forPromise: forPromise,
            forAjaxPromise: forAjaxPromise,
            show: show,
            hide: hide
        }
    }]);
