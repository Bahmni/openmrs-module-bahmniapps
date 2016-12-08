'use strict';

describe('locationDbService tests', function () {
    var locationDbService;

    beforeEach(function () {
        module('bahmni.common.offline');
    });

    beforeEach(inject(['locationDbService', function (locationDbServiceInjected) {
        locationDbService = locationDbServiceInjected;
    }]));

    it("insert locations and get location by uuid from lovefield database", function(done){
        var schemaBuilder = lf.schema.create('BahmniLocations', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.MetaDataSchemaDefinitions.LoginLocations);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var locationsJson = JSON.parse(readFixtures('loginLocations.json'));
        schemaBuilder.connect().then(function(db){
            var uuid = "e905bf88-c461-46e7-a2f1-87db4f611f8b";
            locationDbService.insertLocations(db, locationsJson.results).then(function(){
                locationDbService.getLocationByUuid(db, uuid).then(function(location){
                    expect(location.uuid).toBe(uuid);
                    expect(location.display).toBe("IPD");
                    expect(location.name).toBe("IPD");
                    done();
                });
            });
        });
    });


});