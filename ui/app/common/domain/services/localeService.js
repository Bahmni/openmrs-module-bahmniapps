/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

angular.module('bahmni.common.domain')
    .service('localeService', ['$http', function ($http) {
        this.allowedLocalesList = function () {
            return $http.get(Bahmni.Common.Constants.globalPropertyUrl, {
                method: "GET",
                params: {
                    property: 'locale.allowed.list'
                },
                withCredentials: true,
                headers: {
                    Accept: 'text/plain'
                }
            });
        };

        this.defaultLocale = function () {
            return $http.get(Bahmni.Common.Constants.globalPropertyUrl, {
                method: "GET",
                params: {
                    property: 'default_locale'
                },
                withCredentials: true,
                headers: {
                    Accept: 'text/plain'
                }
            });
        };

        this.serverDateTime = function () {
            return $http.get(Bahmni.Common.Constants.serverDateTimeUrl, {
                method: "GET",
                headers: {
                    Accept: 'text/plain'
                }
            });
        };

        this.getLoginText = function () {
            return $http.get(Bahmni.Common.Constants.loginText, {
                method: "GET",
                headers: {
                    Accept: 'text/plain'
                }
            });
        };

        this.getLocalesLangs = function () {
            return $http.get(Bahmni.Common.Constants.localeLangs, {
                method: "GET",
                headers: {
                    Accept: 'text/plain'
                }
            });
        };
    }]);
