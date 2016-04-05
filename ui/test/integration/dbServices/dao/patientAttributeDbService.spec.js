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
        schemaBuilder.connect().then(function (db) {
            return patientAttributeDbService.insertAttributeTypes(db, personAttributeTypeJSON.data.results).then(function () {
                var attributeTypeTable = db.getSchema().table('patient_attribute_type');
                return patientAttributeDbService.getAttributeTypes(db).then(function (attributeTypeMap) {
                    return patientDbService.insertPatientData(db, patientJson).then(function (uuid) {
                        var patient = patientJson.patient;
                        var person = patient.person;
                        return patientAttributeDbService.insertAttributes(db, uuid, person.attributes, attributeTypeMap).then(function () {
                                var uuid = 'e34992ca-894f-4344-b4b3-54a4aa1e5558';
                                patientDbService.getPatientByUuid(db, uuid).then(function(result){
                                    expect(_.some(result.patient.person.attributes, function(attribute){
                                       return attribute.attributeType.uuid === 'c1f4239f-3f10-11e4-adec-0800271c1b75' && attribute.value === 'hindu';
                                    })).toBeTruthy();
                                    expect(_.some(result.patient.person.attributes, function(attribute){
                                       return attribute.attributeType.uuid === 'c1f455e7-3f10-11e4-adec-0800271c1b75' && attribute.value === 'General';
                                    })).toBeTruthy();
                                    expect(_.some(result.patient.person.attributes, function(attribute){
                                       return attribute.attributeType.uuid === 'c1f4a004-3f10-11e4-adec-0800271c1b75' && attribute.value === '6th to 9th';
                                    })).toBeTruthy();
                                    expect(_.some(result.patient.person.attributes, function(attribute){
                                       return attribute.attributeType.uuid === '3dfdc176-17fd-42b1-b5be-c7e25b78b602' && attribute.value === 23;
                                    })).toBeTruthy();
                                    expect(_.some(result.patient.person.attributes, function(attribute){
                                       return attribute.attributeType.uuid === 'fb3c00b1-81c8-40fe-89e8-6b3344688a13' && attribute.value === "21";
                                    })).toBeTruthy();
                                    expect(_.some(result.patient.person.attributes, function(attribute){
                                       return attribute.attributeType.uuid === '9234695b-0f68-4970-aeb7-3b32d4a2b346' && attribute.value === true;
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
