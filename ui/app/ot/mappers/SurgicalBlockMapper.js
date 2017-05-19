'use strict';

Bahmni.OT.SurgicalBlockMapper = function () {
    var mapOpenMrsSurgicalAppointmentAttribute = function (openMrsSurgicalAppointmentAttribute) {
        return {
            id: openMrsSurgicalAppointmentAttribute.id,
            value: openMrsSurgicalAppointmentAttribute.value,
            name: openMrsSurgicalAppointmentAttribute.surgicalAppointmentAttributeType.name
        }

    };

    this.mapSurgicalAppointment = function (openMrsSurgicalAppointment) {
        return {
            id: openMrsSurgicalAppointment.id,
            uuid: openMrsSurgicalAppointment.uuid,
            voided: openMrsSurgicalAppointment.voided,
            patient: openMrsSurgicalAppointment.patient,
            notes: openMrsSurgicalAppointment.notes,
            surgicalAppointmentAttributes: _map(openMrsSurgicalAppointment.surgicalAppointmentAttributes, function (surgicalAppointment) {
                return mapOpenMrsSurgicalAppointmentAttribute(surgicalAppointment);
            })
        }
    };

    this.map = function (openMrsSurgicalBlock) {
        return {
            id: openMrsSurgicalBlock.id,
            uuid: openMrsSurgicalBlock.uuid,
            voided: openMrsSurgicalBlock.voided,
            startDatetime: openMrsSurgicalBlock.startDatetime,
            endDatetime: openMrsSurgicalBlock.endDatetime,
            provider: openMrsSurgicalBlock.provider,
            location: openMrsSurgicalBlock.location,
            surgicalAppointments: _.map(openMrsSurgicalBlock.surgicalAppointments, function (surgicalAppointment) {
                return this.mapSurgicalAppointment(surgicalAppointment)
            })
        }
    };

    var mapSurgicalAppointmentAttributesUIToDomain = function (attributes) {
        _.values(attributes).filter(function (attribute) {
            return attribute.value;
        }).map(function (attribute) {
            attribute.value = attribute.value.toString();
            return attribute;
        })
    };

    var mapSurgicalAppointmentUIToDomain = function (surgicalAppointmentUI) {
        return {
            id: surgicalAppointmentUI.id,
            patient: {uuid: surgicalAppointmentUI.patient.uuid},
            notes: surgicalAppointmentUI.notes,
            surgicalAppointmentAttributes: mapSurgicalAppointmentAttributesUIToDomain(surgicalAppointmentUI.surgicalAppointmentAttributes)
        }
    };

    this.mapSurgicalBlockUIToDomain = function (surgicalBlockUI) {
        return {
            id: surgicalBlockUI.id,
            uuid: surgicalBlockUI.uuid,
            voided: surgicalBlockUI.voided,
            startDatetime: surgicalBlockUI.startDatetime,
            endDatetime: surgicalBlockUI.endDatetime,
            provider: surgicalBlockUI.provider,
            location: surgicalBlockUI.location,
            surgicalAppointments: _.map(surgicalBlockUI.surgicalAppointments, function (surgicalAppointment) {
                return mapSurgicalAppointmentUIToDomain(surgicalAppointment)
            })
        }
    }
};
