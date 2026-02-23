/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

Bahmni.Common.Domain.PatientProgramMapper = function () {
    this.map = function (patientProgram, programAttributeTypes, dateCompleted) {
        var attributeFormatter = new Bahmni.Common.Domain.AttributeFormatter();
        return {
            dateEnrolled: moment(Bahmni.Common.Util.DateUtil.getDateWithoutTime(patientProgram.dateEnrolled)).format(Bahmni.Common.Constants.ServerDateTimeFormat),
            states: patientProgram.states,
            uuid: patientProgram.uuid,
            dateCompleted: dateCompleted ? moment(dateCompleted).format(Bahmni.Common.Constants.ServerDateTimeFormat) : null,
            outcome: patientProgram.outcomeData ? patientProgram.outcomeData.uuid : null,
            attributes: attributeFormatter.getMrsAttributesForUpdate(patientProgram.patientProgramAttributes, programAttributeTypes, patientProgram.attributes),
            voided: !!patientProgram.voided,
            voidReason: patientProgram.voidReason
        };
    };
};
