'use strict';

describe('surgicalAppointmentHelper', function () {
    var surgicalAppointmentHelper;

    beforeEach(function () {
        module('bahmni.ot');
        inject(['surgicalAppointmentHelper', function (helper) {
            surgicalAppointmentHelper = helper;
        }]);
    });

    it('should filter the providers by name', function () {
        var providerNames = ["Provider1", "Provider2", "Provider5"];
        var providers = [{uuid: "uuid1", person: { display: "Provider1"}}, {uuid: "uuid2", person: { display: "Provider2"}},
            {uuid: "uuid3", person: { display: "Provider3" }}, {uuid: "uuid4",  person: {display: "Provider4"}}, {uuid: "uuid5", person: { display: "Provider5"}}];
        var filteredProviders = surgicalAppointmentHelper.filterProvidersByName(providerNames, providers);

        expect(filteredProviders.length).toEqual(3);
        expect(filteredProviders[0]).toEqual({uuid: "uuid1", person: {display: "Provider1"}});
        expect(filteredProviders[1]).toEqual({uuid: "uuid2", person: {display: "Provider2"}});
        expect(filteredProviders[2]).toEqual({uuid: "uuid5", person: {display: "Provider5" }});
    });

    it('should remove the not existed provider names from the list', function () {
        var providerNames = ["Provider5", "Provider1", "Provider2", "Non Existed Name"];
        var providers = [{uuid: "uuid1", person: { display: "Provider1"}}, {uuid: "uuid2", person: { display: "Provider2"}},
            {uuid: "uuid3", person: { display: "Provider3" }}, {uuid: "uuid4",  person: {provider: "Provider4"}}, {uuid: "uuid5", person: { display: "Provider5"}}];
        var filteredProviders = surgicalAppointmentHelper.filterProvidersByName(providerNames, providers);

        expect(filteredProviders.length).toEqual(3);
        expect(filteredProviders[0]).toEqual({uuid: "uuid5", person: {display: "Provider5" }});
        expect(filteredProviders[1]).toEqual({uuid: "uuid1", person: {display: "Provider1"}});
        expect(filteredProviders[2]).toEqual({uuid: "uuid2", person: {display: "Provider2"}});
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