/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

Bahmni.Clinical.ClinicalDashboardConfig = function (config) {
    var self = this;

    var tabConfig = new Bahmni.Clinical.TabConfig(config);
    if (!tabConfig.identifierKey) {
        tabConfig.identifierKey = "dashboardName";
    }
    angular.extend(self, tabConfig);

    this.getDiseaseTemplateSections = function (tab) {
        tab = tab || this.currentTab;
        return _.filter(_.values(tab.sections), function (section) {
            return section.type === "diseaseTemplate";
        });
    };

    this.getMaxRecentlyViewedPatients = function () {
        return self.currentTab.maxRecentlyViewedPatients || 10;
    };
};
