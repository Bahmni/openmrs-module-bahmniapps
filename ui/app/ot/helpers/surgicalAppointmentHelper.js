'use strict';

angular.module('bahmni.ot')
    .service('surgicalAppointmentHelper', [function () {
        this.filterProvidersByUuid = function (providerUuids, providers) {
            return _.map(providerUuids, function (providerUuid) {
                return _.find(providers, function (provider) {
                    return providerUuid === provider.uuid;
                });
            });
        };

        this.getPatientDisplayLabel = function (display) {
            return display.split('-')[1] + " ( " + display.split('-')[0] + " )";
        };

        this.getEstimatedDurationForAppointment = function (surgicalAppointment) {
            var attributes = _.reduce(surgicalAppointment.surgicalAppointmentAttributes, function (attributes, attribute) {
                attributes[attribute.surgicalAppointmentAttributeType.name] = attribute.value;
                return attributes;
            }, {});
            return this.getAppointmentDuration(attributes.estTimeHours, attributes.estTimeMinutes, attributes.cleaningTime);
        };

        this.getAppointmentDuration = function (estTimeHours, estTimeMinutes, cleaningTime) {
            return estTimeHours * 60 + parseInt(estTimeMinutes) + parseInt(cleaningTime);
        };
    }]);
