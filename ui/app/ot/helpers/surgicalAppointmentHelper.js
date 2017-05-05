'use strict';

angular.module('bahmni.ot')
    .service('surgicalAppointmentHelper', [function () {
        this.filterProvidersByUuid = function (providerUuids, providers) {
            return _.filter(providers, function (provider) {
                return _.find(providerUuids, function (uuid) {
                    return uuid === provider.uuid;
                });
            });
        };
    }]);
