'use strict';

angular.module('bahmni.common.uiHelper')
    .factory('spinner', ['$q', function ($q) {
        var arrayUtil = Bahmni.Common.Util.ArrayUtil
        var tokens = [];



        var show = function (token) {
           tokens.push(token);
           if($('#overlay').length == 0) {
                $('body').prepend('<div id="overlay"><div></div></div>');
           }
           $('#view-content').hide();
           $('#overlay').show();
        }

        var hide = function (token) {
            arrayUtil.removeItem(tokens, token);
            if(tokens.length === 0) {
                $('#overlay').fadeOut();
                $('#view-content').show();
            }
        }

        var forPromise = function (promise, options) {
            options = options || {}
            var token = Math.random();
            show(token);
            return promise.then(function (response) {
                if(!options.doNotHideOnSuccess) {
                    hide(token);
                }
                return response;
            }, function (response) {
                hide(token);
                return $q.reject(response);
            });
        };

        return {
            forPromise: forPromise
        }
    }]);