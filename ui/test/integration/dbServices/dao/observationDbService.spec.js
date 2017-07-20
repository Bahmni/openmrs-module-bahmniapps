'use strict';

describe('observationDbService tests', function () {
    var observationDbService;

    beforeEach(function () {
        module('bahmni.common.offline');
    });

    beforeEach(inject(['observationDbService', function (observationDbServiceInjected) {
        observationDbService = observationDbServiceInjected;
    }]));

    it("insert observations and get observations by patientUuid filter by conceptNames and visitUuids from lovefield database", function (done) {
        var schemaBuilder = lf.schema.create('Obs', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Observation);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var encounterJson = JSON.parse(readFixtures('encounter.json'));
        var observationJson = encounterJson.observations;
        var observationUuid = encounterJson.observations[0].uuid;
        var patientUuid = "fc6ede09-f16f-4877-d2f5-ed8b2182ec11";
        var visitUuid = "47a706a2-c0e6-4e40-ae31-4a3535be2ace";

        schemaBuilder.connect().then(function (db) {
            observationDbService.insertObservationsData(db, patientUuid, visitUuid, observationJson).then(function () {
                var params = {
                    patientUuid: "fc6ede09-f16f-4877-d2f5-ed8b2182ec11",
                    conceptNames: ["Child Health"],
                    visitUuids: [visitUuid]
                }
                observationDbService.getObservationsFor(db, params).then(function (results) {
                    expect(results).not.toBeUndefined();
                    expect(results[0].observation.uuid).toBe(observationUuid);
                    done();
                });
            });
        });
    });

    it("insert observations and get observations by patientUuid filter by conceptNames and and visitUuid as null from lovefield database", function (done) {
        var schemaBuilder = lf.schema.create('Obs', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Observation);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var encounterJson = JSON.parse(readFixtures('encounter.json'));
        var observationJson = encounterJson.observations;
        var observationUuid = encounterJson.observations[0].uuid;
        var patientUuid = "fc6ede09-f16f-4877-d2f5-ed8b2182ec11";

        schemaBuilder.connect().then(function (db) {
            observationDbService.insertObservationsData(db, patientUuid, null, observationJson).then(function () {
                var params = {
                    patientUuid: "fc6ede09-f16f-4877-d2f5-ed8b2182ec11",
                    conceptNames: ["Child Health"],
                    visitUuids: [null]
                }
                observationDbService.getObservationsFor(db, params).then(function (results) {
                    expect(results).not.toBeUndefined();
                    expect(results[0].observation.uuid).toBe(observationUuid);
                    done();
                });
            });
        });
    });

    it("delete observations(i.e. uncheck all selected options) by observationUuid from lovefield database", function (done) {
        var schemaBuilder = lf.schema.create('Obs', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Observation);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var encounterJson = JSON.parse(readFixtures('encounter.json'));
        var observationJson = encounterJson.observations;
        var observationUuid = encounterJson.observations[0].uuid;
        var patientUuid = "fc6ede09-f16f-4877-d2f5-ed8b2182ec11";

        schemaBuilder.connect().then(function (db) {
            observationDbService.insertObservationsData(db, patientUuid, null, observationJson).then(function () {
                observationDbService.insertObservationsData(db, patientUuid, null, [{
                    groupMembers: [],
                    uuid: observationUuid
                }]).then(function (results) {
                    expect(results).not.toBeUndefined();
                    expect(results).toEqual([[]]);
                    done();
                });
            });
        });
    });

    it("should get observations for a visit with a given Uuid", function (done) {
        var schemaBuilder = lf.schema.create('Obs', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Observation);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var encounterJson = JSON.parse(readFixtures('encounter.json'));
        var observationJson = encounterJson.observations;
        var observationUuid = encounterJson.observations[0].uuid;
        var patientUuid = "fc6ede09-f16f-4877-d2f5-ed8b2182ec11";
        var visitUuid = encounterJson.observations[0].visitUuid;

        schemaBuilder.connect().then(function (db) {
            observationDbService.insertObservationsData(db, patientUuid, visitUuid, observationJson).then(function () {
                observationDbService.getObservationsForVisit(db, visitUuid).then(function (results) {
                    expect(results).toBeDefined();
                    expect(results[0].observation.uuid).toBe(observationUuid);
                    done();
                });
            });
        });
    });
});
