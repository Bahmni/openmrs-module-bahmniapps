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
