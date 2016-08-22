'use strict';

describe('visitDbService tests', function () {
    var visitDbService,encounterDbService;

    beforeEach(function () {
        module('bahmni.common.offline');
    });

    beforeEach(inject(['visitDbService','encounterDbService', function (visitDbServiceInjected,encounterDbServiceInjected) {
        visitDbService = visitDbServiceInjected;
        encounterDbService = encounterDbServiceInjected;
    }]));

    it("insert visit and get visit by uuid from lovefield database", function(done){
        var schemaBuilder = lf.schema.create('visit', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Visit);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var visitJson = JSON.parse(readFixtures('visit.json'));
        schemaBuilder.connect().then(function(db){
            var uuid = "de5d8f4b-cb75-4eff-8637-fd0efc0fb9ad";
            visitDbService.insertVisitData(db, visitJson).then(function(){
                visitDbService.getVisitByUuid(db, uuid).then(function(visit){
                    expect(visit.uuid).toBe(uuid);
                    expect(visit.patientUuid).toBe("d07ddb7e-fd8d-4e06-bc44-3bb17507d955");
                    done();
                });
            });
        });
    });


    it("insert visits and get the latest visitUuids by patientUuid and numberOfVisits from lovefield database", function(done){
        var schemaBuilder = lf.schema.create('visit', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Visit);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var visitJson = JSON.parse(readFixtures('visit.json'));
        schemaBuilder.connect().then(function(db){
            var visitUuid = "de5d8f4b-cb75-4eff-8637-fd0efc0fb9ad";
            visitDbService.insertVisitData(db, visitJson).then(function () {
                var newVisitUuid = "ff5d8f4b-cb75-4eff-8637-fd0efc0fb9ad";
                visitJson.uuid = newVisitUuid;
                visitJson.startDatetime = "2016-04-30T17:36:18.000+0530";
                visitDbService.insertVisitData(db, visitJson).then(function () {
                    var patientUuid = "d07ddb7e-fd8d-4e06-bc44-3bb17507d955";
                    visitDbService.getVisitsByPatientUuid(db, patientUuid, 2).then(function (visitUuids) {
                        expect(visitUuids).not.toBeUndefined();
                        expect(visitUuids.length).toBe(2);
                        expect(visitUuids[0].uuid).toBe(newVisitUuid);
                        expect(visitUuids[1].uuid).toBe(visitUuid);
                        expect((visitUuids[0].startDatetime.toString())).toBe(new Date("2016-04-30T17:36:18.000+0530").toString());
                    });

                    visitDbService.getVisitsByPatientUuid(db, patientUuid, 1).then(function (visitUuids) {
                        expect(visitUuids).not.toBeUndefined();
                        expect(visitUuids.length).toBe(1);
                        expect(visitUuids[0].uuid).toBe(newVisitUuid);
                        expect(visitUuids[1]).toBeUndefined();
                    });

                    visitDbService.getVisitsByPatientUuid(db, patientUuid, 4).then(function (visitUuids) {
                        expect(visitUuids).not.toBeUndefined();
                        expect(visitUuids.length).toBe(2);
                        expect(visitUuids[0].uuid).toBe(newVisitUuid);
                        expect(visitUuids[1].uuid).toBe(visitUuid);
                        done();
                    });
                });
            });
        });
    });

    it("should get visit details by PatientUuid", function (done) {
        var schemaBuilder = lf.schema.create('visit', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Visit);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var visitJson = JSON.parse(readFixtures('visit.json'));

        schemaBuilder.connect().then(function(db) {
            var patientUuid = "d07ddb7e-fd8d-4e06-bc44-3bb17507d955";

            visitDbService.insertVisitData(db, visitJson).then(function () {
                visitDbService.getVisitDetailsByPatientUuid(db, patientUuid).then(function(results) {
                    expect(results[0].patient.uuid).toBe(patientUuid);
                    done();
                });
            });
        });
    });

    it("should not get visit details by PatientUuid for invalid PatientUuid", function (done) {
        var schemaBuilder = lf.schema.create('visit', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Visit);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var visitJson = JSON.parse(readFixtures('visit.json'));

        schemaBuilder.connect().then(function(db) {
            var patientUuid = "invalid-uuid";

            visitDbService.insertVisitData(db, visitJson).then(function () {
                visitDbService.getVisitDetailsByPatientUuid(db, patientUuid).then(function(results) {
                    expect(results.length).toBe(0);
                    done();
                });
            });
        });
    });


    xit("should  get visit summary by visitUuid", function (done) {
        var schemaBuilder = lf.schema.create('visit', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Visit);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Encounter);

        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var visitJson = JSON.parse(readFixtures('visit.json'));
        var encounterJson = JSON.parse(readFixtures('encounter.json'));
        var visitUuid = "de5d8f4b-cb75-4eff-8637-fd0efc0fb9ad";
        encounterJson.visitUuid = visitUuid;

        schemaBuilder.connect().then(function(db) {
            visitDbService.insertVisitData(db, visitJson).then(function () {
                encounterDbService.insertEncounterData(db, encounterJson).then(function(){
                    visitDbService.getVisitSummaryByVisitUuid(db, visitUuid).then(function(results) {
                        expect(results).toBeDefined();
                        done();
                    });
                });
            });
        });
    });
});
