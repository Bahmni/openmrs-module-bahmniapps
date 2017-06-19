'use strict';

angular.module('bahmni.ot')
    .service('surgicalAppointmentHelper', [function () {
        this.filterProvidersByName = function (providerNames, providers) {
            return _.map(providerNames, function (providerName) {
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
            return estTimeHours * 60 + parseInt(estTimeMinutes) + parseInt(cleaningTime);
        };
    }]);
