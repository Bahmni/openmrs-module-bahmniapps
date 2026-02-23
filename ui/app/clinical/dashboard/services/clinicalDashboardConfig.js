/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.clinical')
    .service('clinicalDashboardConfig', ['appService', function (appService) {
        var self = this;
        this.load = function () {
            return appService.loadConfig('dashboard.json').then(function (response) {
                angular.extend(self, new Bahmni.Clinical.ClinicalDashboardConfig(_.values(response)));
            });
        };
    }]);
