'use strict';

angular.module('infrastructure.loader', [])
    .factory('loader', ['$q', function ($q) {
        var show = function () {
           $('#loader').show();
        }

        var hide = function () {
            $('#loader').hide();
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