'use strict';

describe('offlineAddressHierarchyDbService', function () {
    var offlineAddressHierarchyDbService;


    beforeEach(function () {
        module('bahmni.common.offline');
        module(function ($provide) {
            $provide.value('$q', Q);
        });
    });

    beforeEach(inject(['offlineAddressHierarchyDbService', function (offlineAddressHierarchyDbServiceInjected) {
        offlineAddressHierarchyDbService = offlineAddressHierarchyDbServiceInjected;
    }]));

    it("insert address and addressLevel and fetch from love field database", function(done) {
        var schemaBuilder = lf.schema.create('BahmniAddressTest', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.AddressHierarchyEntry);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.AddressHierarchyLevel);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var addressHierarchyJSON = JSON.parse(readFixtures('addressHierarchyEntry.json'));
        schemaBuilder.connect().then(function (db) {
            offlineAddressHierarchyDbService.init(db);
            offlineAddressHierarchyDbService.insertAddressHierarchy(addressHierarchyJSON.parent).then(function () {
                offlineAddressHierarchyDbService.insertAddressHierarchy(addressHierarchyJSON.child).then(function () {
                    var childName = "Barguna", parentName = "Barisal", addressHierarchyEntryId = 2;
                    offlineAddressHierarchyDbService.getParentAddressById(addressHierarchyEntryId).then(function (addressEntry) {
                        expect(addressEntry.name).toBe(childName);
                        expect(addressEntry.parent.name).toBe(parentName);
                        done();
                    });
                });
            });
        });
    });


    it('should search for parent address', function (done) {

        var searchString = "ba";
        var parentName = "Barisal";
        var parentUuid = "b3f2af24-ae8f-4699-83d9-78e0d97ba976";
        var params = {
            searchString: searchString,
            addressField: "stateProvince",
            parentUuid: null,
            limit: '20'
        };
        var schemaBuilder = lf.schema.create('BahmniAddressTest', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.AddressHierarchyEntry);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.AddressHierarchyLevel);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var addressHierarchyJSON = JSON.parse(readFixtures('addressHierarchyEntry.json'));
        schemaBuilder.connect().then(function (db) {
            offlineAddressHierarchyDbService.init(db);
            offlineAddressHierarchyDbService.insertAddressHierarchy(addressHierarchyJSON.parent).then(function () {
                offlineAddressHierarchyDbService.insertAddressHierarchy(addressHierarchyJSON.child).then(function () {
                    offlineAddressHierarchyDbService.search(params).then(function(result){
                        var parent = result.data[0];
                        expect(parent.name).toBe(parentName);
                        expect(parent.uuid).toBe(parentUuid);
                        done();
                    });
                });
            });
        });
    });

    it('should search for child address using parentUuid', function (done) {

        var searchString = "gu";
        var parentName = "Barisal";
        var parentUuid = "b3f2af24-ae8f-4699-83d9-78e0d97ba976";
        var childName = "Barguna";
        var childUuid = "559ba00d-d2d6-443e-be7b-f4e9fb7265fb";
        var params = {
            searchString: searchString,
            addressField: "countyDistrict",
            parentUuid: parentUuid,
            limit: '20'
        };
        var schemaBuilder = lf.schema.create('BahmniAddressTest', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.AddressHierarchyEntry);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.AddressHierarchyLevel);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var addressHierarchyJSON = JSON.parse(readFixtures('addressHierarchyEntry.json'));
        schemaBuilder.connect().then(function (db) {
            offlineAddressHierarchyDbService.init(db);
            offlineAddressHierarchyDbService.insertAddressHierarchy(addressHierarchyJSON.parent).then(function () {
                offlineAddressHierarchyDbService.insertAddressHierarchy(addressHierarchyJSON.child).then(function () {
                    offlineAddressHierarchyDbService.search(params).then(function(result){
                        var child = result.data[0];
                        expect(child.name).toBe(childName);
                        expect(child.uuid).toBe(childUuid);
                        expect(child.parent.name).toBe(parentName);
                        expect(child.parent.uuid).toBe(parentUuid);
                        done();
                    });
                });
            });
        });
    });


});