'use strict';

describe('patientIdentifierDbService', function () {
    var patientDbService, patientIdentifierDbService, $q = Q;

    beforeEach(function () {
        module('bahmni.common.offline');
        module(function ($provide) {
            $provide.value('$q', $q);
        });
    });

    beforeEach(inject(['patientIdentifierDbService', 'patientDbService', function (patientIdentifierDbServiceInjected, patientDbServiceInjected) {
        patientIdentifierDbService = patientIdentifierDbServiceInjected;
        patientDbService = patientDbServiceInjected;
    }]));

    it("should insert identifier and get it from the lovefield db", function (done) {
        var schemaBuilder = lf.schema.create('PatientIdentifierTest', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Patient);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.PatientIdentifier);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var patientJson = JSON.parse(readFixtures('patient.json'));
        var patientUuid = patientJson.patient.uuid;
        var identifiers = patientJson.patient.identifiers;
        patientJson.patient.identifiers[0].extraIdentifiers = "extraIdentifiers";
        patientJson.patient.identifiers[0].primaryIdentifier = "primaryIdentifier";
        schemaBuilder.connect().then(function(db){
            patientDbService.insertPatientData(db, patientJson).then(function () {
                patientIdentifierDbService.insertPatientIdentifiers(db, patientUuid, identifiers).then(function(){
                    patientIdentifierDbService.getPatientIdentifiersByPatientUuid(db, patientUuid).then(function(identifiersArray){
                        expect(identifiersArray.length).toBe(1);
                        expect(identifiersArray[0].identifierJson).toBe(identifiers[0]);
                        done();
                    });
                });
            });
        });
    });
});