'use strict';

describe('offlineSearchDbService', function () {
    var offlineSearchDbService, patientDbService, patientIdentifierDbService, age, patientAddressDbService, patientAttributeDbService, encounterDbService, $q = Q;

    var mockHttp = jasmine.createSpyObj('$http', ['get']);
    jasmine.getFixtures().fixturesPath = 'base/test/data';
    var encounterJson = JSON.parse(readFixtures('encounter.json'));
    var patientJson = JSON.parse(readFixtures('patient.json'));

    beforeEach(function () {
        module('bahmni.common.offline');
        module('bahmni.common.models');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
            $provide.value('$q', $q);
        });
    });

    beforeEach(inject(['offlineSearchDbService', 'patientDbService', 'patientIdentifierDbService', 'age', 'patientAddressDbService', 'patientAttributeDbService', 'encounterDbService',
        function (offlineSearchDbServiceInjected, patientDbServiceInjected, patientIdentifierDbServiceInjected, ageInjected, patientAddressDbServiceInjected, patientAttributeDbServiceInjected, encounterDbServiceInjected) {
            offlineSearchDbService = offlineSearchDbServiceInjected;
            patientDbService = patientDbServiceInjected;
            patientIdentifierDbService = patientIdentifierDbServiceInjected;
            age = ageInjected;
            patientAddressDbService = patientAddressDbServiceInjected;
            patientAttributeDbService = patientAttributeDbServiceInjected;
            encounterDbService = encounterDbServiceInjected;
        }]));


    var createAndSearch = function (params, done) {
        var schemaBuilder = lf.schema.create('BahmniTest', 2);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Patient);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.PatientIdentifier);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Encounter);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.PatientAttribute);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.PatientAttributeType);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.PatientAddress);
        var personAttributeTypeJSON = JSON.parse(readFixtures('patientAttributeType.json'));
        return schemaBuilder.connect().then(function (db) {
            offlineSearchDbService.init(db);
            return patientAttributeDbService.insertAttributeTypes(db, personAttributeTypeJSON.data.results).then(function () {
                var attributeTypeTable = db.getSchema().table('patient_attribute_type');
                return db.select(attributeTypeTable.attributeTypeId,
                    attributeTypeTable.uuid, attributeTypeTable.attributeName, attributeTypeTable.format).from(attributeTypeTable).exec().then(function (attributeTypeMap) {
                    return patientDbService.insertPatientData(db, patientJson).then(function (uuid) {
                        var patient = patientJson.patient;
                        var person = patient.person;
                        return patientIdentifierDbService.insertPatientIdentifiers(db, patient.uuid, patient.identifiers).then(function () {
                            return patientAddressDbService.insertAddress(db, uuid, person.addresses[0]).then(function () {
                                return patientAttributeDbService.insertAttributes(db, uuid, person.attributes, attributeTypeMap).then(function () {
                                    return encounterDbService.insertEncounterData(db, encounterJson).then(function () {
                                        return offlineSearchDbService.search(params).then(function (result) {
                                            return result;
                                            done();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    };


    it('Should search for patient by first name', function (done) {

        var searchString = "test";
        var params = {
            q: searchString,
            s: "byIdOrNameOrVillage",
            startIndex: 0,
            addressFieldName: 'address2'
        };

        createAndSearch(params).then(function (result) {
            expect(result.data.pageOfResults[0].givenName).toBe(searchString);
            done();
        });

    });


    it('Should search for patient by last name', function (done) {

        var searchString = "integration";
        var params = {
            q: searchString,
            s: "byIdOrNameOrVillage",
            startIndex: 0,
            addressFieldName: 'address2'
        };

        createAndSearch(params).then(function (result) {
            expect(result.data.pageOfResults[0].familyName).toBe(searchString);
            done();
        });

    });

    it('Should search for patient by address field', function (done) {

        var searchString = "Chattisgarh";
        var params = {
            q: '',
            s: "byIdOrNameOrVillage",
            startIndex: 0,
            addressFieldName: 'stateProvince',
            addressFieldValue: searchString
        };

        createAndSearch(params).then(function (result) {
            expect(result.data.pageOfResults[0].addressFieldValue["state_province"]).toEqual('Chattisgarh');
            done();
        });

    });

    it('Should search for patient by identifier', function (done) {

        var searchString = "GAN200076";
        var params = {
            q: searchString,
            s: "byIdOrNameOrVillage",
            startIndex: 0,
            addressFieldName: 'address2'
        };

        patientJson.patient.identifiers[0].primaryIdentifier = patientJson.patient.identifiers[0].identifier;
        createAndSearch(params).then(function (result) {
            expect(result.data.pageOfResults[0].identifier).toBe(searchString);
            done();
        });

    });

    it('Should search for patient by caste(custom attribute)', function (done) {

        var searchString = "hindu";
        var params = {
            q: '',
            s: "byIdOrNameOrVillage",
            addressFieldName: 'address2',
            customAttribute: searchString,
            startIndex: 0,
            patientAttributes: ["caste"]
        };

        createAndSearch(params, done).then(function (result) {
            var customAttributes = JSON.parse(result.data.pageOfResults[0].customAttribute);
            expect(customAttributes.caste).toBe(searchString);
            done();
        });

    });

    it('Should search for patient by isUrban(custom attribute)', function (done) {

        var searchString = true;
        var params = {
            q: '',
            s: "byIdOrNameOrVillage",
            addressFieldName: 'address2',
            customAttribute: searchString,
            startIndex: 0,
            patientAttributes: ["caste", "isUrban"]
        };

        createAndSearch(params, done).then(function (result) {
            var customAttributes = JSON.parse(result.data.pageOfResults[0].customAttribute);
            expect(customAttributes.isUrban).toBe(searchString);
            done();
        });

    });

    it('Should not get patient on search, if the patient is voided', function (done) {
        var searchString = "test";
        var params = {
            q: searchString,
            s: "byIdOrNameOrVillage",
            startIndex: 0,
            addressFieldName: 'address2'
        };

        patientJson.patient.voided = true;
        createAndSearch(params, done).then(function (result) {
            expect(result.data.pageOfResults.length).toBe(0);
            patientJson.patient.voided = false;
            done();
        });
    });

    it('Should fetch patient with primary identifier on search, if the patient has multiple identifiers', function (done) {
        var searchString = "GAN200076";
        var params = {
            q: searchString,
            s: "byIdOrNameOrVillage",
            startIndex: 0,
            addressFieldName: 'address2'
        };

        var extraIdentifier = {
            "uuid": "99996aeb-2877-4340-b9fd-abba016a84a3",
            "identifier": "SecodaryIdentifier",
            "identifierSourceUuid": "99997b48-8792-11e5-ade6-005056b07f03",
            "identifierType": {
                "uuid": "99993852-3f10-11e4-adec-0800271c1b75",
                "display": "Bahmni Sec Id",
                "primary": false
            },
            "location": null,
            "preferred": true,
            "voided": false,
            "resourceVersion": "1.8"
        };

        patientJson.patient.identifiers.push(extraIdentifier);

        var extraIdentifiers = {Bahmni: "SEC2908216"};
        patientJson.patient.identifiers[0].primaryIdentifier = "GAN200076";
        patientJson.patient.identifiers[0].extraIdentifiers = extraIdentifiers;
        createAndSearch(params, done).then(function (result) {
            expect(result.data.pageOfResults.length).toBe(1);
            expect(result.data.pageOfResults[0].identifier).toBe("GAN200076");
            expect(result.data.pageOfResults[0].extraIdentifiers).toBe(JSON.stringify(extraIdentifiers));
            done();
        });
    });

    it('Should fetch patient with secondary identifier on search, if the patient has multiple identifiers', function (done) {
        var searchString = "SEC2908216";
        var params = {
            q: searchString,
            s: "byIdOrNameOrVillage",
            startIndex: 0,
            addressFieldName: 'address2'
        };

        var extraIdentifier = {
            "uuid": "99996aeb-2877-4340-b9fd-abba016a84a3",
            "identifier": "SEC2908216",
            "identifierSourceUuid": "99997b48-8792-11e5-ade6-005056b07f03",
            "identifierType": {
                "uuid": "99993852-3f10-11e4-adec-0800271c1b75",
                "display": "Bahmni",
                "primary": false
            },
            "location": null,
            "preferred": true,
            "voided": false,
            "resourceVersion": "1.8"
        };

        patientJson.patient.identifiers.push(extraIdentifier);

        var extraIdentifiers = {Bahmni: "SEC2908216"};
        patientJson.patient.identifiers[0].primaryIdentifier = "GAN200076";
        patientJson.patient.identifiers[0].extraIdentifiers = extraIdentifiers;
        createAndSearch(params, done).then(function (result) {
            expect(result.data.pageOfResults.length).toBe(1);
            expect(result.data.pageOfResults[0].identifier).toBe("GAN200076");
            expect(result.data.pageOfResults[0].extraIdentifiers).toBe(JSON.stringify(extraIdentifiers));
            done();
        });
    });

    it('Should search for patient by Education(custom attribute)', function (done) {

        var searchString = '6th to 9th';
        var params = {
            q: '',
            s: "byIdOrNameOrVillage",
            addressFieldName: 'address2',
            customAttribute: searchString,
            startIndex: 0,
            patientAttributes: ["education"]
        };

        createAndSearch(params, done).then(function (result) {
            var customAttributes = JSON.parse(result.data.pageOfResults[0].customAttribute);
            expect(customAttributes.education).toBe(searchString);
            done();
        });

    });

    it('Should search for patient by landHolding(custom attribute)', function (done) {

        var searchString = 23;
        var params = {
            q: '',
            s: "byIdOrNameOrVillage",
            addressFieldName: 'address2',
            customAttribute: searchString,
            startIndex: 0,
            patientAttributes: ["landHolding"]
        };

        createAndSearch(params, done).then(function (result) {
            var customAttributes = JSON.parse(result.data.pageOfResults[0].customAttribute);
            expect(customAttributes.landHolding).toBe(searchString);
            done();
        });

    });

     it('Should not display if patient datecreated and encounter date is not within duration', function (done) {
        var params = {
            q: '',
            s: "byDate",
            startIndex: 0,
            addressFieldName: 'address2',
            duration: 14
        };

         var DateUtil = Bahmni.Common.Util.DateUtil;
         encounterJson.encounterDateTime = DateUtil.subtractDays(DateUtil.now(), 20);
         patientJson.patient.person.auditInfo.dateCreated = DateUtil.subtractDays(DateUtil.now(), 20);

         createAndSearch(params, done).then(function (result) {
            expect(result.data.pageOfResults).toEqual([]);
            done(encounterJson.encounterDateTime);
        });

    });

    it('Should display if patient date created in not within duration and encounter date is within duration', function (done) {
        var params = {
            q: '',
            s: "byDate",
            startIndex: 0,
            addressFieldName: 'address2',
            duration: 14
        };

        var DateUtil = Bahmni.Common.Util.DateUtil;
        encounterJson.encounterDateTime = DateUtil.subtractDays(DateUtil.now(), 2);
        patientJson.patient.person.auditInfo.dateCreated = DateUtil.subtractDays(DateUtil.now(), 20);
        createAndSearch(params, done).then(function (result) {
            expect(result.data.pageOfResults[0].givenName).toEqual("test");
            done();
        });
    });

    it('Should display as recent patient if dateCreated is within date range and there is no encounter for patient', function (done) {
        var params = {
            q: '',
            s: "byDate",
            startIndex: 0,
            addressFieldName: 'address2',
            duration: 14
        };

        var DateUtil = Bahmni.Common.Util.DateUtil;
        encounterJson.patientUuid = "patientUuid";
        patientJson.patient.person.auditInfo.dateCreated = DateUtil.subtractDays(DateUtil.now(), 2);
        createAndSearch(params, done).then(function (result) {
            expect(result.data.pageOfResults[0].givenName).toEqual("test");
            done();
        });
    });


    it('Should display as recent patient if dateCreated is within date range and encounter date is not in date range for patient', function (done) {
        var params = {
            q: '',
            s: "byDate",
            startIndex: 0,
            addressFieldName: 'address2',
            duration: 14
        };

        var DateUtil = Bahmni.Common.Util.DateUtil;
        encounterJson.encounterDateTime = DateUtil.subtractDays(DateUtil.now(), 20);
        patientJson.patient.person.auditInfo.dateCreated = DateUtil.subtractDays(DateUtil.now(), 2);
        createAndSearch(params, done).then(function (result) {
            expect(result.data.pageOfResults[0].givenName).toEqual("test");
            done();
        });
    });


    it('Should display as recent patient if dateCreated and encounter date is within date range', function (done) {
        var params = {
            q: '',
            s: "byDate",
            startIndex: 0,
            addressFieldName: 'address2',
            duration: 14
        };

        var DateUtil = Bahmni.Common.Util.DateUtil;
        encounterJson.encounterDateTime = DateUtil.subtractDays(DateUtil.now(), 2);
        patientJson.patient.person.auditInfo.dateCreated = DateUtil.subtractDays(DateUtil.now(), 2);
        createAndSearch(params, done).then(function (result) {
            expect(result.data.pageOfResults[0].givenName).toEqual("test");
            done();
        });
    });

});