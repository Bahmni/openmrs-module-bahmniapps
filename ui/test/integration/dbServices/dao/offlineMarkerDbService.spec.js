'use strict';

describe('offlineMarkerDbService tests', function () {
    var offlineMarkerDbService;

    beforeEach(function () {
        module('bahmni.common.offline');
    });

    beforeEach(inject(['offlineMarkerDbService', function (offlineMarkerDbServiceInjected) {
        offlineMarkerDbService = offlineMarkerDbServiceInjected
    }]));

    it("insert Marker data and get from lovefield database", function(done){
        var schemaBuilder = lf.schema.create('EventLogMarker', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.EventLogMarker);
        jasmine.getFixtures().fixturesPath = 'base/test/data';

        var markerName = "Transactional";
        schemaBuilder.connect().then(function(db){
            offlineMarkerDbService.init(db);
            offlineMarkerDbService.insertMarker(markerName, "lastReadEventUuid", 20202020).then(function(){
                offlineMarkerDbService.getMarker(markerName).then(function(result) {
                    expect(result.markerName).toBe(markerName);
                    expect(result.lastReadEventUuid).toBe("lastReadEventUuid");
                    expect(result.catchmentNumber).toBe(20202020);
                    expect(result.lastReadTime).not.toBeUndefined();
                    done();
                });
            });
        });
    });


    it("insertMarker should return the data from lovefield database", function(done){
        var schemaBuilder = lf.schema.create('EventLogMarker', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.EventLogMarker);
        jasmine.getFixtures().fixturesPath = 'base/test/data';

        var markerName = "Transactional";
        schemaBuilder.connect().then(function(db){
            offlineMarkerDbService.init(db);
            offlineMarkerDbService.insertMarker(markerName, "lastReadEventUuid", 20202020).then(function(result){
                expect(result).not.toBeUndefined();
                expect(result.markerName).toBe(markerName);
                expect(result.lastReadEventUuid).toBe("lastReadEventUuid");
                expect(result.catchmentNumber).toBe(20202020);
                expect(result.lastReadTime).not.toBeUndefined();
                done();
            });
        });
    });
});