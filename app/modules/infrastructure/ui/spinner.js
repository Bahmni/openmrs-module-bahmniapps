'use strict';

angular.module('infrastructure.spinner', [])
    .factory('spinner', ['$q', function ($q) {
        var enabled = true;

        var show = function () {
            if (enabled)
                $('#overlay').show();
        }

        var hide = function () {
            $('#overlay').hide();
        }

        var forPromise = function (promise) {
            show();
            return promise.then(function (response) {
                hide();
                return response;
            }, function (response) {
                hide();
                return $q.reject(response);
            });
        }

        return {
            forPromise: forPromise
        }
    }]);