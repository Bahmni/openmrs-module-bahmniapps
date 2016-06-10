'use strict';

describe('encounterDbService tests', function () {
    var encounterDbService, schemaBuilder, encounterJson;

    var mockHttp = jasmine.createSpyObj('$http', ['get']);

    beforeEach(function () {
        module('bahmni.common.offline');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
        });

        schemaBuilder = lf.schema.create('BahmniEncounter', 2);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Encounter);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        encounterJson = JSON.parse(readFixtures('encounter.json'));

    });

    beforeEach(inject(['encounterDbService', function (encounterDbServiceInjected) {
        encounterDbService = encounterDbServiceInjected
    }]));

    it("insert encounter and get from lovefield database", function(done){

        schemaBuilder.connect().then(function(db){
            encounterDbService.insertEncounterData(db, encounterJson).then(function(){
                var uuid = 'e34992ca-894f-4344-b4b3-54a4aa1e5558';
                encounterDbService.getEncountersByPatientUuid(db, uuid).then(function(results){
                    expect(results[0].encounter.patientUuid).toBe(uuid);
                    expect(results[0].encounter.visitUuid).toBe("47a706a2-c0e6-4e40-ae31-4a3535be2ace");
                    expect(results[0].encounter.encounterDateTime).toBe("2016-04-22T11:06:20.000+0530");
                    done();
                });
            });
        });
    });

    it("insert encounter and getActiveEncounter from lovefield database", function(done){

        var DateUtil = Bahmni.Common.Util.DateUtil;
        encounterJson.encounterDateTime = DateUtil.addSeconds(DateUtil.now(), -1600);
        schemaBuilder.connect().then(function(db){
            encounterDbService.insertEncounterData(db, encounterJson).then(function(result){
                var patientUuid = 'e34992ca-894f-4344-b4b3-54a4aa1e5558';
                var providerUuid = "6a5d9c71-bb71-47ad-abed-bda86637f1b7";
                var encounterType = "FIELD";
                encounterDbService.findActiveEncounter(db, {patientUuid: patientUuid, providerUuid: providerUuid, encounterType: encounterType}, 60).then(function(results){
                    expect(results.encounter).not.toBeUndefined();
                    expect(results.encounter.patientUuid).toBe(patientUuid);
                    expect(results.encounter.encounterType).toBe(encounterType);
                    done();
                });
            });
        });
    });

    it("get encounter by encounterUuid from lovefield database", function(done){

        var DateUtil = Bahmni.Common.Util.DateUtil;
        encounterJson.encounterDateTime = DateUtil.addSeconds(DateUtil.now(), -1600);
        schemaBuilder.connect().then(function(db){
            encounterDbService.insertEncounterData(db, encounterJson).then(function(result){
                var uuid = 'e34992ca-894f-4344-b4b3-54a4aa1e5558';
                var providerUuid = "6a5d9c71-bb71-47ad-abed-bda86637f1b7";
                var encounterType = "FIELD";
                encounterDbService.findActiveEncounter(db, {patientUuid: uuid, providerUuid: providerUuid, encounterType: encounterType}, 60).then(function(results){
                    expect(results.encounter).not.toBeUndefined();
                    expect(results.encounter.patientUuid).toBe(uuid);
                    done();
                });
                encounterDbService.getEncounterByEncounterUuid(db, encounterJson.encounterUuid).then(function(results){
                    expect(results).not.toBeUndefined();
                })
            });
        });

    });


    it("get encounter by visits from lovefield database", function(done){

        var DateUtil = Bahmni.Common.Util.DateUtil;
        encounterJson.encounterDateTime = DateUtil.addSeconds(DateUtil.now(), -1600);
        schemaBuilder.connect().then(function(db){
            encounterDbService.insertEncounterData(db, encounterJson).then(function(result){
                var patientUuid = 'e34992ca-894f-4344-b4b3-54a4aa1e5558';
                var visitUuids = ["47a706a2-c0e6-4e40-ae31-4a3535be2ace"];
                encounterDbService.getEncountersByVisits(db, {patientUuid: patientUuid, visitUuids: visitUuids}).then(function (results) {
                    expect(results[0].encounter.patientUuid).toBe(patientUuid);
                    expect(results[0].encounter.visitUuid).toBe(visitUuids[0]);
                    done();
                })
            });
        });

    });
});