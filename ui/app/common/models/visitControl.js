/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

Bahmni.Common.VisitControl = function (visitTypes, defaultVisitTypeName, encounterService,
    $translate, visitService) {
    var self = this;
    self.visitTypes = visitTypes;
    self.defaultVisitTypeName = defaultVisitTypeName;
    self.defaultVisitType = visitTypes.filter(function (visitType) {
        return visitType.name === defaultVisitTypeName;
    })[0];

    self.startButtonText = function (visitType) {
        return $translate.instant('REGISTRATION_START_VISIT', {visitType: visitType.name});
    };

    self.startVisit = function (visitType) {
        self.onStartVisit();
        self.selectedVisitType = visitType;
    };

    self.checkIfActiveVisitExists = function (patientUuid, visitLocationUuid) {
        return visitService.checkIfActiveVisitExists(patientUuid, visitLocationUuid);
    };

    self.createVisitOnly = function (patientUuid, visitLocationUuid) {
        var visitType = self.selectedVisitType || self.defaultVisitType;
        var visitDetails = {patient: patientUuid, visitType: visitType.uuid, location: visitLocationUuid};
        return visitService.createVisit(visitDetails);
    };
};

