/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

Bahmni.Common.VisitSummary = function (visitSummary) {
    angular.extend(this, visitSummary);

    this.isAdmitted = function () {
        return this.admissionDetails && this.admissionDetails.uuid ? true : false;
    };

    this.isDischarged = function () {
        return this.dischargeDetails && this.dischargeDetails.uuid ? true : false;
    };

    this.getAdmissionEncounterUuid = function () {
        return this.isAdmitted() ? this.admissionDetails.uuid : undefined;
    };

    this.getDischargeEncounterUuid = function () {
        return this.isDischarged() ? this.dischargeDetails.uuid : undefined;
    };

    this.hasBeenAdmitted = function () {
        return this.isAdmitted() && !this.isDischarged();
    };
};

