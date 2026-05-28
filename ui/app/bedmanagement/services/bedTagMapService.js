/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.ipd')
    .service('bedTagMapService', ['$http', function ($http) {
        this.getAllBedTags = function () {
            return $http.get(Bahmni.IPD.Constants.getAllBedTags, {
                params: {},
                withCredentials: true
            });
        };

        this.assignTagToABed = function (bedTagId, bedId) {
            var requestPayload = {
                "bedTag": {"id": bedTagId},
                "bed": {"id": bedId}
            };
            var headers = {"Content-Type": "application/json", "Accept": "application/json"};
            return $http.post(Bahmni.IPD.Constants.bedTagMapUrl, requestPayload, headers);
        };

        this.unAssignTagFromTheBed = function (bedTagMapUuid) {
            return $http.delete(Bahmni.IPD.Constants.bedTagMapUrl + bedTagMapUuid);
        };
    }]);
