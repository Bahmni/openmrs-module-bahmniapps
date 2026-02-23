/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';
angular.module('bahmni.common.services')
    .factory('virtualConsultService', ['$http', '$rootScope', function ($http, $rootScope) {
        var launchMeeting = function (uuid, link) {
            $rootScope.$broadcast("event:launchVirtualConsult", {"uuid": uuid, "link": link});
        };

        return {
            launchMeeting: launchMeeting
        };
    }]);
