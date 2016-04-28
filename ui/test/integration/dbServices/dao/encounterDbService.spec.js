'use strict';

describe('encounterDbService tests', function () {
    var encounterDbService;

    var mockHttp = jasmine.createSpyObj('$http', ['get']);

    beforeEach(function () {
        module('bahmni.common.offline');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
        });
    });

    beforeEach(inject(['encounterDbService', function (encounterDbServiceInjected) {
        encounterDbService = encounterDbServiceInjected
    }]));

    it("insert encounter and get from lovefield database", function(done){
        var schemaBuilder = lf.schema.create('BahmniEncounter', 2);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Encounter);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var encounterJson = JSON.parse(readFixtures('encounter.json'));
        schemaBuilder.connect().then(function(db){
            encounterDbService.insertEncounterData(db, encounterJson).then(function(){
                var uuid = 'fc6ede09-f16f-4877-d2f5-ed8b2182ec11';
                encounterDbService.getEncountersByPatientUuid(db, uuid).then(function(results){
                    expect(results[0].encounter.patientUuid).toBe(uuid);
                    expect(results[0].encounter.encounterDateTime).toBe("2016-04-22T11:06:20.000+0530");
                    done();
                });
            });
        });
    });
})