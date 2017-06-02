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
    }]);
