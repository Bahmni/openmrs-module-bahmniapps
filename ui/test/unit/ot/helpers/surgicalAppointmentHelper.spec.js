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

    it('should sort  providers by the uuids from the config', function () {
        var providerUuids = ["uuid5", "uuid1", "uuid2"];
        var providers = [{uuid: "uuid1", name: "Provider1"}, {uuid: "uuid2", name: "Provider2"},
            {uuid: "uuid3", name: "Provider3"}, {uuid: "uuid4", name: "Provider4"}, {uuid: "uuid5", name: "Provider5"}];
        var filteredProviders = surgicalAppointmentHelper.filterProvidersByUuid(providerUuids, providers);

        expect(filteredProviders.length).toEqual(3);
        expect(filteredProviders[0]).toEqual({uuid: "uuid5", name: "Provider5"});
        expect(filteredProviders[1]).toEqual({uuid: "uuid1", name: "Provider1"});
        expect(filteredProviders[2]).toEqual({uuid: "uuid2", name: "Provider2"});
    });

    it('should get the duration in minutes', function () {
        var estTimInHours = "1";
        var estTimInMinutes = "15";
        var cleaningTime = "15";
        var appointmentDuration = surgicalAppointmentHelper.getAppointmentDuration(estTimInHours, estTimInMinutes, cleaningTime);

        expect(appointmentDuration).toEqual(90);
    });

    it('should map the surgical appointment attribures values to name and shout get the appointment duration in minutes', function () {

        var surgicalAppointment = {
            id: 1,
            patient: { uuid: "patientUuid" },
            actualStartDateTime: null,
            actualEndDateTime: null,
            status: null,
            surgicalAppointmentAttributes: [{id: 88, value: "procedure", surgicalAppointmentAttributeType: { name: "procedure" } },{id: 89, value: "1", surgicalAppointmentAttributeType: { name: "estTimeHours" } }, {id: 90, value: "15", surgicalAppointmentAttributeType: { name: "estTimeMinutes" } }, {id: 91, value: "30", surgicalAppointmentAttributeType: { name: "cleaningTime" } }]
        };

        var appointmentDuration = surgicalAppointmentHelper.getEstimatedDurationForAppointment(surgicalAppointment);

        expect(appointmentDuration).toEqual(105);
    });
});