'use strict';

var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.Util = Bahmni.Common.Util || {};

angular.module('bahmni.common.util', [])
    .provider('$bahmniCookieStore', [function () {
        var self = this;
        self.defaultOptions = {};
        var fixedEncodeURIComponent = function (str) {
            return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
                return '%' + c.charCodeAt(0).toString(16);
            });
        };

        self.setDefaultOptions = function (options) {
            self.defaultOptions = options;
        };

        self.$get = function () {
            return {
                get: function (name) {
                    var jsonCookie = $.cookie(name);
                    if (jsonCookie) {
                        return angular.fromJson(decodeURIComponent(jsonCookie));
                    }
                    return null;
                },
                put: function (name, value, options) {
                    options = $.extend({}, self.defaultOptions, options);
                    $.cookie.raw = true;
                    $.cookie(name, fixedEncodeURIComponent(angular.toJson(value)), options);
                },
                remove: function (name, options) {
                    options = $.extend({}, self.defaultOptions, options);
                    $.removeCookie(name, options);
                }
            };
        };
    }])
;
