/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.reports')
    .controller('DashboardHeaderController', ['$scope', 'appService', '$state',
        function ($scope, appService, $state) {
            var setBackLinks = function () {
                var backLinks = [{label: "Home", url: Bahmni.Common.Constants.homeUrl, accessKey: "h", icon: "fa-home"}];
                if (appService.getAppDescriptor().getConfigValue("enableReportQueue")) {
                    backLinks.push({text: "REPORTS_HEADER_REPORTS", state: "dashboard.reports", accessKey: "d"});
                    backLinks.push({text: "REPORTS_HEADER_MY_REPORTS", state: "dashboard.myReports", accessKey: "m"});
                }
                $state.get('dashboard').data.backLinks = backLinks;
            };
            var init = function () {
                setBackLinks();
            };
            return init();
        }]);
