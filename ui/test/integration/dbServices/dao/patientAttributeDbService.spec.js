'use strict';

describe('patientAttributeDbService tests', function () {
    var patientDbService, patientAttributeDbService, $q=Q;

    var mockHttp = jasmine.createSpyObj('$http', ['get']);

    beforeEach(function () {
        module('bahmni.common.offline');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
            $provide.value('$q', $q);
        });
    });

    beforeEach(inject(['patientDbService','patientAttributeDbService', function (patientDbServiceInjected, patientAttributeDbServiceInjected) {
        patientDbService = patientDbServiceInjected;
        patientAttributeDbService = patientAttributeDbServiceInjected;
    }]));

    it("insert patient and get attributes from lovefield database", function(done){
        var schemaBuilder = lf.schema.create('BahmniTest', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Patient);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.PatientAttribute);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.PatientAttributeType);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var patientJson = JSON.parse(readFixtures('patient.json'));
        var personAttributeTypeJSON = JSON.parse(readFixtures('patientAttributeType.json'));
        mockHttp.get.and.returnValue(specUtil.respondWithPromise($q, personAttributeTypeJSON));
        schemaBuilder.connect().then(function (db) {
            return patientAttributeDbService.insertAttributeTypes(db).then(function () {
                var attributeTypeTable = db.getSchema().table('patient_attribute_type');
                return patientAttributeDbService.getAttributeTypes(db).then(function (attributeTypeMap) {
                    return patientDbService.insertPatientData(db, patientJson).then(function (uuid) {
                        var patient = patientJson.patient;
                        var person = patient.person;
                        return patientAttributeDbService.insertAttributes(db, uuid, person.attributes, attributeTypeMap).then(function () {
                                var uuid = 'e34992ca-894f-4344-b4b3-54a4aa1e5558';
                                patientDbService.getPatientByUuid(db, uuid).then(function(result){
                                    expect(_.any(result.patient.person.attributes, function(attribute){
                                       return attribute.attributeType.display === 'caste' && attribute.value === 'hindu';
                                    })).toBeTruthy();
                                    expect(_.any(result.patient.person.attributes, function(attribute){
                                       return attribute.attributeType.display === 'class' && attribute.value.display === 'General';
                                    })).toBeTruthy();
                                    expect(_.any(result.patient.person.attributes, function(attribute){
                                       return attribute.attributeType.display === 'education' && attribute.value.display === '6th to 9th';
                                    })).toBeTruthy();
                                    expect(_.any(result.patient.person.attributes, function(attribute){
                                       return attribute.attributeType.display === 'landHolding' && attribute.value === 23;
                                    })).toBeTruthy();
                                    expect(_.any(result.patient.person.attributes, function(attribute){
                                       return attribute.attributeType.display === 'debt' && attribute.value === "21";
                                    })).toBeTruthy();
                                    expect(_.any(result.patient.person.attributes, function(attribute){
                                       return attribute.attributeType.display === 'isUrban' && attribute.value === true;
                                    })).toBeTruthy();
                                    done();
                                });
                            });
                    });
                });
            });

        });
    });


});