'use strict';

angular.module('infrastructure.spinner', [])
    .factory('spinner', ['$q', function ($q) {
        var show = function () {
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

        var forMethod = function (method, options) {
            options = options || {};
            show();
            return method().then(function (response) {
                if (!options.doNotHideOnSuccess) {
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
            forPromise: forPromise,
            forMethod: forMethod
        }
    }]);