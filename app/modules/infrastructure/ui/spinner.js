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