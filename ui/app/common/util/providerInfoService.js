/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

angular.module('bahmni.common.util')
    .factory('providerInfoService', [ '$rootScope', function ($rootScope) {
        $rootScope.provider = null;
        var setProvider = function (obs) {
            if ($rootScope.provider === null) {
                if (obs.length > 0) {
                    $rootScope.provider = obs[0].providers;
                }
            }
        };
        return {
            setProvider: setProvider
        };
    }]);
