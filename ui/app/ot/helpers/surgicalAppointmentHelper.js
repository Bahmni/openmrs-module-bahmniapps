'use strict';

angular.module('bahmni.ot')
    .service('surgicalAppointmentHelper', [function () {
        this.filterProvidersByName = function (providerNames, providers) {
            if (!providerNames || providerNames.length === 0) {
                return _.filter(providers, function (provider) {
                    return provider.person.display != "";
                });
            }
            var validProviderNames = _.filter(providerNames, function (providerName) {
                return _.find(providers, function (provider) {
                    return providerName === provider.person.display;
                });
            });
            return _.map(validProviderNames, function (providerName) {
                return _.find(providers, function (provider) {
                    return providerName === provider.person.display;
                });
            });
        };

        this.getPatientDisplayLabel = function (display) {
            return display.split(' - ')[1] + " ( " + display.split(' - ')[0] + " )";
        };

        this.getAppointmentAttributes = function (surgicalAppointment) {
            return _.reduce(surgicalAppointment.surgicalAppointmentAttributes, function (attributes, attribute) {
                attributes[attribute.surgicalAppointmentAttributeType.name] = attribute.value;
                return attributes;
            }, {});
        };

        this.getEstimatedDurationForAppointment = function (surgicalAppointment) {
            var attributes = this.getAppointmentAttributes(surgicalAppointment);
            return this.getAppointmentDuration(attributes.estTimeHours, attributes.estTimeMinutes, attributes.cleaningTime);
        };

        this.getAppointmentDuration = function (estTimeHours, estTimeMinutes, cleaningTime) {
            return estTimeHours * 60 + (parseInt(estTimeMinutes) || 0) + (parseInt(cleaningTime) || 0);
        };

        this.filterSurgicalAppointmentsByStatus = function (surgicalAppointments, appointmentStatusList) {
            if (_.isEmpty(appointmentStatusList)) {
                return surgicalAppointments;
            }
            return _.filter(surgicalAppointments, function (appointment) {
                return appointmentStatusList.indexOf(appointment.status) >= 0;
            });
        };

        this.filterSurgicalAppointmentsByPatient = function (surgicalAppointments, patient) {
            if (!patient) {
                return surgicalAppointments;
            }
            return _.filter(surgicalAppointments, function (appointment) {
                return appointment.patient.uuid === patient.uuid;
            });
        };

        this.getAttributesFromAttributeNames = function (attributes, attributeNames) {
            const configuredAttributes = {};
            if (attributes) {
                _.each(attributeNames, function (attributeName) {
                    configuredAttributes[attributeName] = attributes[attributeName];
                });
            }
            return configuredAttributes;
        };

        this.getAttributesFromAttributeTypes = function (attributes, attributeTypes) {
            const configuredAttributes = {};
            if (attributes) {
                _.each(attributeTypes, function (attributeType) {
                    configuredAttributes[attributeType.name] = attributes[attributeType.name];
                });
            }
            return configuredAttributes;
        };

        this.getAttributeTypesByRemovingAttributeNames = function (defaultAttributeTypes, attributeNames) {
            if (!attributeNames) {
                return defaultAttributeTypes;
            }
            return _.filter(defaultAttributeTypes, function (attributeType) {
                return !attributeNames.includes(attributeType.name);
            });
        };

        this.getDefaultAttributeTranslations = function () {
            return new Map([['procedure', "OT_SURGICAL_APPOINTMENT_PROCEDURE"],
                ['estTimeHours', "OT_SURGICAL_APPOINTMENT_HOURS"], ['estTimeMinutes', "OT_SURGICAL_APPOINTMENT_MINUTES"],
                ['cleaningTime', "OT_SURGICAL_APPOINTMENT_CLEANING_TIME"], ['otherSurgeon', "OT_SURGICAL_APPOINTMENT_OTHER_SURGEON"],
                ['surgicalAssistant', "OT_SURGICAL_APPOINTMENT_SURGICAL_ASSISTANT"], ['anaesthetist', "OT_SURGICAL_APPOINTMENT_ANAESTHETIST"],
                ['scrubNurse', "OT_SURGICAL_APPOINTMENT_SCRUB_NURSE"], ['circulatingNurse', "OT_SURGICAL_APPOINTMENT_CIRCULATING_NURSE"],
                ['notes', "OT_SURGICAL_APPOINTMENT_NOTES"], ['Status', "OT_SURGICAL_APPOINTMENT_STATUS"], ['Day', "OT_SURGICAL_BLOCK_START_DAY"],
                ['Date', "OT_SURGICAL_BLOCK_START_DATE"], ['Identifier', "PATIENT_ATTRIBUTE_IDENTIFIER"],
                ['Patient Name', "PATIENT_ATTRIBUTE_PATIENT_NAME"], ['Patient Age', "PERSON_ATTRIBUTE_PATIENT_AGE"],
                ['Start Time', "OT_SURGICAL_BLOCK_START_TIME"], ['Est Time', "OT_SURGICAL_APPOINTMENT_ESTIMATED_TIME"],
                ['Actual Time', "OT_SURGICAL_APPOINTMENT_ACTUAL_TIME"], ['OT#', "OT_SURGICAL_BLOCK_LOCATION_NAME"],
                ['Surgeon', "OT_PROVIDER_SURGEON"], ['Status Change Notes', "OT_SURGICAL_APPOINTMENT_STATUS_CHANGE_NOTES"],
                ['Bed Location', "OT_SURGICAL_APPOINTMENT_BED_LOCATION"],
                ['Bed ID', "OT_SURGICAL_APPOINTMENT_BED_ID"]
            ]);
        };

        this.getSurgicalAttributes = function (surgicalAppointment) {
            return _.reduce(surgicalAppointment.surgicalAppointmentAttributes, function (attributes, attribute) {
                attributes[attribute.surgicalAppointmentAttributeType.name] = attribute.value;
                return attributes;
            }, {});
        };
    }]);
