'use strict';

describe('patientServiceStrategy', function () {
    var $http, patientServiceStrategy, mockHttp;
    var patient = {
            address: {},
            age: {},
            birthdate: "Tue Jan 19 1982 00:00:00 GMT+0530 (IST)",
            familyName: "Patient",
            gender: "F",
            givenName: "Test",
            registrationDate: "Tue Jan 19 2016 15:01:59 GMT+0530 (IST)",
            uuid: "dc1e37ac-40ff-48a5-9d09-6a292030d3cd",
            getImageData: function () {
                return false;
            },
            primaryIdentifier: Bahmni.Registration.Identifier({uuid: 'identifier-type-uuid'}),
            extraIdentifiers: []

        },
        openMRSPatient = {
            auditInfo: {},
            display: "GAN200061 - Test Patient",
            identifiers: [],
            person: {
                addresses: [],
                age: 34,
                birthdate: "1982-01-19T00:00:00.000+0530",
                attributes: [],
                names: [{
                    display: "Test Patient",
                    familyName: "Patient",
                    givenName: "Test",
                    uuid: "9c993377-cc7d-4d4e-b752-e703bed5d06d",
                    voided: false
                }],
                preferredName: {
                    givenName: "Test",
                    familyName: "Patient",
                    display: "Test Patient"
                },
                uuid: "dc1e37ac-40ff-48a5-9d09-6a292030d3cd"
            },
            resourceVersion: "1.8",
            uuid: "dc1e37ac-40ff-48a5-9d09-6a292030d3cd",
            voided: false
        },
        attributeTypes = [
            {
                "uuid": "82325788-3f10-11e4-adec-0800271c1b75",
                "sortWeight": 3,
                "name": "givenNameLocal",
                "fullySpecifiedName": "givenNameLocal",
                "description": "Name in local language",
                "format": "java.lang.String",
                "answers": [],
                "required": false,
                "concept": {}
            },
            {
                "uuid": "8233a58a-3f10-11e4-adec-0800271c1b75",
                "sortWeight": 3,
                "name": "familyNameLocal",
                "fullySpecifiedName": "familyNameLocal",
                "description": "familyNameLocal",
                "format": "java.lang.String",
                "answers": [],
                "required": false,
                "concept": {}
            }
        ];

    beforeEach(module('bahmni.registration'));

    beforeEach(module(function ($provide) {
        mockHttp = jasmine.createSpyObj('$http', ['post']);
        $provide.value('$http', mockHttp);
        $provide.value('$q', Q);
    }));

    beforeEach(inject(['patientServiceStrategy', function (patientServiceStrategyInjected) {
        patientServiceStrategy = patientServiceStrategyInjected;
    }]));

    describe('test Update()', function () {
        it("should update the patient name", function (done) {
            mockHttp.post.and.callFake(function (param, data) {
                expect(param).toBe('/openmrs/ws/rest/v1/bahmnicore/patientprofile/dc1e37ac-40ff-48a5-9d09-6a292030d3cd');
                expect(data.patient.person.names[0].givenName).toBe(patient.givenName);
                return specUtil.respondWith({"data": openMRSPatient});
            });
            patientServiceStrategy.update(patient, openMRSPatient, attributeTypes).then(function (results) {
                expect(results).not.toBeUndefined();
                done();
            });
        });
    });
});