'use strict';

Bahmni.Common.Domain.ProviderMapper = function () {
    this.map = function (openMrsProvider) {
        if (!openMrsProvider) {
            return null;
        }
        return {
            uuid: openMrsProvider.uuid,
            name: openMrsProvider.preferredName ? openMrsProvider.preferredName.display : openMrsProvider.person.preferredName.display
        };
    };
};
