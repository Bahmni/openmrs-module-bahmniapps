/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';
var Bahmni = Bahmni || {};
Bahmni.ADT = Bahmni.ADT || {};

Bahmni.ADT.DispositionDisplayUtil = {
    getEncounterToDisplay: function (encounterConfig, visit) {
        var rankActions = {};
        rankActions[encounterConfig.getAdmissionEncounterTypeUuid()] = 1;
        rankActions[encounterConfig.getTransferEncounterTypeUuid()] = 2;
        rankActions[encounterConfig.getDischargeEncounterTypeUuid()] = 3;

        if (visit.isDischarged()) {
            return encounterConfig.getDischargeEncounterTypeUuid();
        } else if (visit.isAdmitted() && !visit.isDischarged()) {
            return encounterConfig.getTransferEncounterTypeUuid();
        } else {
            return encounterConfig.getAdmissionEncounterTypeUuid();
        }
    }
};
