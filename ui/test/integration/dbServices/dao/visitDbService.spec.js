'use strict';

describe('visitDbService tests', function () {
    var visitDbService;

    beforeEach(function () {
        module('bahmni.common.offline');
    });

    beforeEach(inject(['visitDbService', function (visitDbServiceInjected) {
        visitDbService = visitDbServiceInjected;
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


});