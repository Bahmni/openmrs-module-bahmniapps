'use strict';

describe('referenceDataDbService tests', function () {
    var referenceDataDbService;

    beforeEach(function () {
        module('bahmni.common.offline');
    });

    beforeEach(inject(['referenceDataDbService', function (referenceDataDbServiceInjected) {
        referenceDataDbService = referenceDataDbServiceInjected
    }]));

    it("insert referenceData and get from lovefield database", function(done){
        var schemaBuilder = lf.schema.create('BahmniReferenceData', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.MetaDataSchemaDefinitions.ReferenceData);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.MetaDataSchemaDefinitions.LoginLocations);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var locationsJson = JSON.parse(readFixtures('loginLocations.json'));
        var referenceDataKey = "LoginLocations";
        var eTag = "etag";
        schemaBuilder.connect().then(function(db){
            referenceDataDbService.init(db);
            referenceDataDbService.insertReferenceData(referenceDataKey, locationsJson, eTag).then(function(){
                    referenceDataDbService.getReferenceData(referenceDataKey).then(function(result) {
                        expect(result.etag).toBe(eTag);
                        expect(result.key).toBe(referenceDataKey);
                        expect(result.data).toBe(locationsJson);
                        done();
                    });
            });
        });
    });

});