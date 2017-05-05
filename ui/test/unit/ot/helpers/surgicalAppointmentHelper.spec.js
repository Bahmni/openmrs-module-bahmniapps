'use strict';

describe('surgicalAppointmentHelper', function () {
    var surgicalAppointmentHelper;

    beforeEach(function () {
        module('bahmni.ot');
        inject(['surgicalAppointmentHelper', function (helper) {
            surgicalAppointmentHelper = helper;
        }]);
    });

    it('should filter the providers by uuids', function () {
        var providerUuids = ["uuid1", "uuid2", "uuid5"];
        var providers = [{uuid: "uuid1", name: "Provider1"}, {uuid: "uuid2", name: "Provider2"},
            {uuid: "uuid3", name: "Provider3"}, {uuid: "uuid4", name: "Provider4"}, {uuid: "uuid5", name: "Provider5"}];
        var filteredProviders = surgicalAppointmentHelper.filterProvidersByUuid(providerUuids, providers);

        expect(filteredProviders.length).toEqual(3);
        expect(filteredProviders[0]).toEqual({uuid: "uuid1", name: "Provider1"});
        expect(filteredProviders[1]).toEqual({uuid: "uuid2", name: "Provider2"});
        expect(filteredProviders[2]).toEqual({uuid: "uuid5", name: "Provider5"});
    });


});