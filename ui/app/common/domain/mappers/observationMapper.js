/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

Bahmni.Common.Domain.ObservationMapper = function () {
    this.map = function (openMrsObs) {
        var conceptMapper = new Bahmni.Common.Domain.ConceptMapper();
        var groupMembers = openMrsObs.groupMembers || [];
        return {
            uuid: openMrsObs.uuid,
            concept: conceptMapper.map(openMrsObs.concept),
            value: openMrsObs.value,
            voided: openMrsObs.voided,
            voidedReason: openMrsObs.voidedReason,
            observationDateTime: openMrsObs.obsDatetime,
            orderUuid: openMrsObs.orderUuid,
            groupMembers: groupMembers.map(this.map)
        };
    };
};
