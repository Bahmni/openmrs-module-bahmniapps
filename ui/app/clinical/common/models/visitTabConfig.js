/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

Bahmni.Clinical.VisitTabConfig = function (tabs) {
    var tabConfig = new Bahmni.Clinical.TabConfig(tabs);
    if (!tabConfig.identifierKey) {
        tabConfig.identifierKey = "title";
    }
    angular.extend(this, tabConfig);

    this.setVisitUuidsAndPatientUuidToTheSections = function (visitUuids, patientUuid) {
        _.each(this.tabs, function (tab) {
            _.each(tab.sections, function (section) {
                section.config.visitUuids = visitUuids;
                section.config.patientUuid = patientUuid;
            });
        });
    };
};
