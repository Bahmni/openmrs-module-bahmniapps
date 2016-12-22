'use strict';

describe('offlineConfigDbService tests', function () {
    var offlineConfigDbService;

    beforeEach(function () {
        module('bahmni.common.offline');
    });

    beforeEach(inject(['offlineConfigDbService', function (offlineConfigDbServiceInjected) {
        offlineConfigDbService = offlineConfigDbServiceInjected
    }]));

    it("insert patient and get from lovefield database", function(done){
        var schemaBuilder = lf.schema.create('configMetadata', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.MetaDataSchemaDefinitions.Configs);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var configJson = JSON.parse(readFixtures('config.json'));
        var module = "test";
        var eTag = "etag";
        schemaBuilder.connect().then(function(db){
            offlineConfigDbService.init(db);
            offlineConfigDbService.insertConfig(module, configJson, eTag).then(function(){
                offlineConfigDbService.getConfig(module).then(function(result){
                    expect(result.etag).toBe(eTag);
                    expect(result.key).toBe(module);
                    expect(result.value).toBe(configJson);
                    done();
                });
            });
        });
    });


});