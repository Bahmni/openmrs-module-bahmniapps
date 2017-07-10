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

    it('should give all surgical appointments by status when the status list provided is empty or undefined', function () {
        var surgicalAppointments = [{
            "id": 107,
            "patient": {
                "uuid": "2848a63a-b273-4d9d-8e10-1ad3e39ab1a6",
                "display": "IQ100079F - XKHRQKVNNJKC UHNTLIXSNERE"
            },
            "actualStartDatetime": null,
            "actualEndDatetime": null,
            "status": "POSTPONED",
            "notes": "not ready",
            "sortWeight": 0,
            "surgicalAppointmentAttributes": []
        }, {
            "id": 106,
            "patient": {
                "uuid": "9b41d661-df96-4815-aea1-ecc8278dd220",
                "display": "IQ100072F - QXHTPLJYKLTF JVMSGICIQZVB"
            },
            "actualStartDatetime": "2017-06-22T09:15:00.000+0530",
            "actualEndDatetime": "2017-06-22T10:00:00.000+0530",
            "status": "COMPLETED",
            "notes": null,
            "sortWeight": 0,
            "surgicalAppointmentAttributes": []
        }, {
            "id": 108,
            "patient": {
                "uuid": "0c58967c-a415-48c8-9830-adcaa94b9d4f",
                "display": "IQ100074F - CUYCTOEPHJDP OCECDYHMGPSO"
            },
            "actualStartDatetime": null,
            "actualEndDatetime": null,
            "status": "CANCELLED",
            "notes": "Mistake",
            "sortWeight": null,
            "surgicalAppointmentAttributes": []
        }];

        var filteredAppointments = surgicalAppointmentHelper.filterSurgicalAppointmentsByStatus(surgicalAppointments);
        var filteredAppointmentsWithEmptyStatusList = surgicalAppointmentHelper.filterSurgicalAppointmentsByStatus(surgicalAppointments, []);
        expect(filteredAppointments).toEqual(surgicalAppointments);
        expect(filteredAppointmentsWithEmptyStatusList).toEqual(surgicalAppointments);
    });


    it('should filter appointments by the status list', function () {
        var surgicalAppointments = [{
            "id": 107,
            "patient": {
                "uuid": "2848a63a-b273-4d9d-8e10-1ad3e39ab1a6",
                "display": "IQ100079F - XKHRQKVNNJKC UHNTLIXSNERE"
            },
            "actualStartDatetime": null,
            "actualEndDatetime": null,
            "status": "POSTPONED",
            "notes": "not ready",
            "sortWeight": 0,
            "surgicalAppointmentAttributes": []
        }, {
            "id": 106,
            "patient": {
                "uuid": "9b41d661-df96-4815-aea1-ecc8278dd220",
                "display": "IQ100072F - QXHTPLJYKLTF JVMSGICIQZVB"
            },
            "actualStartDatetime": "2017-06-22T09:15:00.000+0530",
            "actualEndDatetime": "2017-06-22T10:00:00.000+0530",
            "status": "COMPLETED",
            "notes": null,
            "sortWeight": 0,
            "surgicalAppointmentAttributes": []
        }, {
            "id": 108,
            "patient": {
                "uuid": "0c58967c-a415-48c8-9830-adcaa94b9d4f",
                "display": "IQ100074F - CUYCTOEPHJDP OCECDYHMGPSO"
            },
            "actualStartDatetime": null,
            "actualEndDatetime": null,
            "status": "CANCELLED",
            "notes": "Mistake",
            "sortWeight": null,
            "surgicalAppointmentAttributes": []
        }];

        var filteredAppointments = surgicalAppointmentHelper.filterSurgicalAppointmentsByStatus(surgicalAppointments, ["COMPLETED"]);
        expect(filteredAppointments.length).toEqual(1);
        expect(filteredAppointments[0].id).toEqual(106);
    });

    it('should filter appointments by patient', function () {
        var surgicalAppointments = [{
            "id": 107,
            "patient": {
                "uuid": "2848a63a-b273-4d9d-8e10-1ad3e39ab1a6",
                "display": "IQ100079F - XKHRQKVNNJKC UHNTLIXSNERE"
            },
            "actualStartDatetime": null,
            "actualEndDatetime": null,
            "status": "POSTPONED",
            "notes": "not ready",
            "sortWeight": 0,
            "surgicalAppointmentAttributes": []
        }, {
            "id": 106,
            "patient": {
                "uuid": "9b41d661-df96-4815-aea1-ecc8278dd220",
                "display": "IQ100072F - QXHTPLJYKLTF JVMSGICIQZVB"
            },
            "actualStartDatetime": "2017-06-22T09:15:00.000+0530",
            "actualEndDatetime": "2017-06-22T10:00:00.000+0530",
            "status": "COMPLETED",
            "notes": null,
            "sortWeight": 0,
            "surgicalAppointmentAttributes": []
        }, {
            "id": 108,
            "patient": {
                "uuid": "0c58967c-a415-48c8-9830-adcaa94b9d4f",
                "display": "IQ100074F - CUYCTOEPHJDP OCECDYHMGPSO"
            },
            "actualStartDatetime": null,
            "actualEndDatetime": null,
            "status": "CANCELLED",
            "notes": "Mistake",
            "sortWeight": null,
            "surgicalAppointmentAttributes": []
        }];
        var filteredAppointments = surgicalAppointmentHelper.filterSurgicalAppointmentsByPatient(surgicalAppointments, {uuid : '0c58967c-a415-48c8-9830-adcaa94b9d4f'});
        expect(filteredAppointments.length).toEqual(1);
        expect(filteredAppointments[0].id).toEqual(108);
    });
    
    it('should calculate the duration of the appointment when some fields are empty', function () {
        var estTimInHours = "";
        var estTimInMinutes = "";
        var cleaningTime = "";
        var appointmentDuration = surgicalAppointmentHelper.getAppointmentDuration(estTimInHours, estTimInMinutes, cleaningTime);

        expect(appointmentDuration).toEqual(0);
    })
});