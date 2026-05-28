/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.registration')
    .factory('patientAttributeService', ['$http', '$q', function ($http, $q) {
        var urlMap;

        var init = function () {
            urlMap = {
                "personName": Bahmni.Common.Constants.bahmniSearchUrl + "/personname",
                "personAttribute": Bahmni.Common.Constants.bahmniSearchUrl + "/personattribute"
            };
        };
        init();

        var search = function (fieldName, query, type) {
            var url = urlMap[type];
            var queryWithoutTrailingSpaces = query.trimLeft();

            return $http.get(url, {
                method: "GET",
                params: {q: queryWithoutTrailingSpaces, key: fieldName },
                withCredentials: true
            });
        };

        return {
            search: search
        };
    }]);
