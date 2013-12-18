'use strict';

angular.module('bahmni.common.infrastructure')
    .factory('spinner', ['$q', function ($q) {
        var show = function () {
           if($('#overlay').length == 0) {
            $('body').prepend('<div id="overlay"></div>');
           }
           $('#view-content').hide();
           $('#overlay').show();
        }

        var hide = function () {
            $('#overlay').hide();
            $('#view-content').show();
        }

        var forPromise = function (promise, options) {
            options = options || {}
            show();
            return promise.then(function (response) {
                if(!options.doNotHideOnSuccess) {
                    hide();
                }
                return response;
            }, function (response) {
                hide();
                return $q.reject(response);
            });
        };

        return {
            show: show,
            hide: hide,
            forPromise: forPromise
        }
    }]);