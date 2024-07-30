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

    it('should return all providers with a display name when an empty list of names is passed', function () {
        var providerNames = [];
        var providers = [{uuid: "uuid1", person: { display: "Provider1"}}, {uuid: "uuid2", person: { display: "Provider2"}}];
        var filteredProviders = surgicalAppointmentHelper.filterProvidersByName(providerNames, providers);

        expect(filteredProviders.length).toEqual(2);
        expect(filteredProviders[0]).toEqual({uuid: "uuid1", person: {display: "Provider1"}});
        expect(filteredProviders[1]).toEqual({uuid: "uuid2", person: {display: "Provider2"}});
    });

    it('should return all providers with a display name when the list of names is undefined', function () {
        var providerNames = undefined;
        var providers = [{ uuid: "uuid1", person: { display: "Provider1" } }, { uuid: "uuid2", person: { display: "Provider2" } }];
        var filteredProviders = surgicalAppointmentHelper.filterProvidersByName(providerNames, providers);

        expect(filteredProviders.length).toEqual(2);
        expect(filteredProviders[0]).toEqual({ uuid: "uuid1", person: { display: "Provider1" } });
        expect(filteredProviders[1]).toEqual({ uuid: "uuid2", person: { display: "Provider2" } });
    });

    it('should not return providers with an empty display name and when the an empty list of names is passed', function () {
        var providerNames = [];
        var providers = [{ uuid: "uuid1", person: { display: "Provider1" } }, { uuid: "uuid2", person: { display: "" } }];
        var filteredProviders = surgicalAppointmentHelper.filterProvidersByName(providerNames, providers);

        expect(filteredProviders.length).toEqual(1);
        expect(filteredProviders[0]).toEqual({ uuid: "uuid1", person: { display: "Provider1" } });
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
    });

    describe('getAttributesFromAttributeNames', function () {
        it('should return configured surgery attributes along with the order', function () {

            var configuredSurgeryAttributeNames = ["surgicalAssistant", "procedure"];
            var attributes = {
                procedure: {surgicalAppointmentAttributeType: {name: 'procedure'}},
                surgicalAssistant: {surgicalAppointmentAttributeType: {name: 'surgicalAssistant'}},
                cleaningTime: {surgicalAppointmentAttributeType: {name: 'cleaningTime'}}
            };

            var expectedAttributes = {
                surgicalAssistant: {surgicalAppointmentAttributeType: {name: 'surgicalAssistant'}},
                procedure: {surgicalAppointmentAttributeType: {name: 'procedure'}}
            };

            var configuredAttributes = surgicalAppointmentHelper.getAttributesFromAttributeNames(attributes, configuredSurgeryAttributeNames);

            expect(_.isEqual(expectedAttributes, configuredAttributes)).toBeTruthy();
        });

        it('should return empty object when "configuredSurgeryAttributeNames" is undefined', function () {
            var attributes = {
                procedure: {surgicalAppointmentAttributeType: {name: 'procedure'}},
                surgicalAssistant: {surgicalAppointmentAttributeType: {name: 'surgicalAssistant'}},
                cleaningTime: {surgicalAppointmentAttributeType: {name: 'cleaningTime'}}
            };
            var configuredAttributes = surgicalAppointmentHelper.getAttributesFromAttributeNames(attributes, undefined);
            expect(_.isEmpty(configuredAttributes)).toBeTruthy();
        });

        it('should return empty object when "attributes" is undefined', function () {
            var configuredSurgeryAttributeNames = ["surgicalAssistant", "procedure"];
            var configuredAttributes = surgicalAppointmentHelper.getAttributesFromAttributeNames(undefined, configuredSurgeryAttributeNames);
            expect(_.isEmpty(configuredAttributes)).toBeTruthy();
        });

        describe('getAttributeTypesByRemovingAttributeNames', function () {
            it('should return surgical attributes types by removing given "attributeNames"', function () {
                var attributeNamesToBeRemoved = ['estTimeHours', 'estTimeMinutes', 'cleaningTime'];
                var attributesTypes = [{"uuid": "34c1cace-7367-11e7-a46a-000c29e530d2", "name": "procedure"},
                    {"uuid": "34c1e03b-7367-11e7-a46a-000c29e530d2", "name": "Notes"},
                    {"uuid": "34c26d4b-7367-11e7-a46a-000c29e530d5", "name": "estTimeHours"},
                    {"uuid": "34c26d4b-7367-11e7-a46a-000c29e530d3", "name": "estTimeMinutes"},
                    {"uuid": "34c26d4b-7367-11e7-a46a-000c29e530d8", "name": "cleaningTime"}];
                var finalAttributeTypes = surgicalAppointmentHelper.getAttributeTypesByRemovingAttributeNames(attributesTypes, attributeNamesToBeRemoved);
                expect(finalAttributeTypes.length).toBe(2);
                expect(finalAttributeTypes[0].name).toBe('procedure');
                expect(finalAttributeTypes[1].name).toBe('Notes');
            });

            it('should return same surgical attributes types when given "attributeNames" is undefined', function () {
                var attributesTypes = [{"uuid": "34c1cace-7367-11e7-a46a-000c29e530d2", "name": "procedure"},
                    {"uuid": "34c1e03b-7367-11e7-a46a-000c29e530d2", "name": "Notes"}];
                var finalAttributeTypes = surgicalAppointmentHelper.getAttributeTypesByRemovingAttributeNames(attributesTypes, undefined);
                expect(finalAttributeTypes.length).toBe(2);
                expect(finalAttributeTypes[0].name).toBe('procedure');
                expect(finalAttributeTypes[1].name).toBe('Notes');
            });
        });

        describe('getAttributesFromAttributeTypes', function () {
            it('should sort and filter attributes by given "attributeTypes"', function () {
                var attributes = {
                    procedure: {surgicalAppointmentAttributeType: {name: 'procedure'}},
                    surgicalAssistant: {surgicalAppointmentAttributeType: {name: 'surgicalAssistant'}},
                    cleaningTime: {surgicalAppointmentAttributeType: {name: 'cleaningTime'}},
                    estTimeHours: {surgicalAppointmentAttributeType: {name: 'estTimeHours'}},
                    estTimeMinutes: {surgicalAppointmentAttributeType: {name: 'estTimeMinutes'}},
                    Notes: {surgicalAppointmentAttributeType: {name: 'Notes'}}
                };
                var attributesTypes = [{"uuid": "34c1cace-7367-11e7-a46a-000c29e530d2", "name": "procedure"},
                    {"uuid": "34c1e03b-7367-11e7-a46a-000c29e530d2", "name": "Notes"},
                    {"uuid": "34c26d4b-7367-11e7-a46a-000c29e530d5", "name": "estTimeHours"},
                    {"uuid": "34c26d4b-7367-11e7-a46a-000c29e530d3", "name": "estTimeMinutes"},
                    {"uuid": "34c26d4b-7367-11e7-a46a-000c29e530d8", "name": "cleaningTime"}];

                var expectedAttributes = {
                    procedure: {surgicalAppointmentAttributeType: {name: 'procedure'}},
                    Notes: {surgicalAppointmentAttributeType: {name: 'Notes'}},
                    estTimeHours: {surgicalAppointmentAttributeType: {name: 'estTimeHours'}},
                    estTimeMinutes: {surgicalAppointmentAttributeType: {name: 'estTimeMinutes'}},
                    cleaningTime: {surgicalAppointmentAttributeType: {name: 'cleaningTime'}}
                };

                var finalAttributes = surgicalAppointmentHelper.getAttributesFromAttributeTypes(attributes, attributesTypes);

                expect(_.isEqual(expectedAttributes, finalAttributes)).toBeTruthy();
            });

            it('should return empty attributes when "attributeTypes" is undefined', function () {
                var attributes = {procedure: {surgicalAppointmentAttributeType: {name: 'procedure'}}};
                var finalAttributes = surgicalAppointmentHelper.getAttributesFromAttributeTypes(attributes);
                expect(_.isEmpty(finalAttributes)).toBeTruthy();
            });

            it('should return empty attributes when "attributes" is undefined', function () {
                var finalAttributes = surgicalAppointmentHelper.getAttributesFromAttributeTypes(undefined, {});
                expect(_.isEmpty(finalAttributes)).toBeTruthy();
            });
        });

        describe('getSurgicalAttributes', function () {
            it('should return existing attributes from surgical appointment', function () {
                var surgicalAppointment = {
                    id: 1,
                    patient: {uuid: "patientUuid"},
                    actualStartDateTime: null,
                    actualEndDateTime: null,
                    status: null,
                    surgicalAppointmentAttributes: [{
                        id: 88,
                        value: "Physiotherapy",
                        surgicalAppointmentAttributeType: {name: "procedure"}
                    }, {id: 89, value: "1", surgicalAppointmentAttributeType: {name: "estTimeHours"}}, {
                        id: 90,
                        value: "15",
                        surgicalAppointmentAttributeType: {name: "estTimeMinutes"}
                    }, {id: 91, value: "30", surgicalAppointmentAttributeType: {name: "cleaningTime"}}]
                };
                var expectedAttributes = {
                    procedure: 'Physiotherapy',
                    estTimeHours: '1',
                    estTimeMinutes: '15',
                    cleaningTime: '30'
                };
                var surgicalAttributes = surgicalAppointmentHelper.getSurgicalAttributes(surgicalAppointment);
                expect(_.isEqual(expectedAttributes, surgicalAttributes)).toBeTruthy()
            })
        });

    });

});
