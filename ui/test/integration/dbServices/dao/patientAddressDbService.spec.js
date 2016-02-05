'use strict';

describe('patientDbService tests', function () {
    var patientDbService, patientAddressDbService;

    var mockHttp = jasmine.createSpyObj('$http', ['get']);

    beforeEach(function () {
        module('bahmni.common.offline');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
        });
    });

    beforeEach(inject(['patientDbService', 'patientAddressDbService', function (patientDbServiceInjected, patientAddressDbServiceInjected) {
        patientDbService = patientDbServiceInjected;
        patientAddressDbService = patientAddressDbServiceInjected;
    }]));

    it("insert patient and get from lovefield database", function(done){
        var schemaBuilder = lf.schema.create('BahmniTest', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Patient);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.PatientAddress);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var patientJson = JSON.parse(readFixtures('patient.json'));
        schemaBuilder.connect().then(function(db){
            patientDbService.insertPatientData(db, patientJson).then(function(){
                var uuid = 'e34992ca-894f-4344-b4b3-54a4aa1e5558';
                return patientAddressDbService.insertAddress(db, uuid, patientJson.patient.person.addresses[0]).then(function () {
                    patientDbService.getPatientByUuid(db, uuid).then(function (result) {
                        expect(result.patient.uuid).toBe(uuid);
                        expect(result.patient.person.preferredAddress.cityVillage).toBe("PACHARI");
                        expect(result.patient.person.preferredAddress.stateProvince).toBe("Chattisgarh");
                        expect(result.patient.person.preferredAddress.countyDistrict).toBe("Raipur");
                        expect(result.patient.person.preferredAddress.address3).toBe("BILAIGARH");
                        done();
                    });
                });
            });
        });
    });


});