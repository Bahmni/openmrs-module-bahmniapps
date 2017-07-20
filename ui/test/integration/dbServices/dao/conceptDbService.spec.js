'use strict';

describe('conceptDbService tests', function () {
    var conceptDbService;
    var $q= Q;

    beforeEach(function () {
        module('bahmni.common.offline');
    });

    beforeEach(module(function ($provide) {
        $provide.value('$q', $q);
    }));

    beforeEach(inject(['conceptDbService', function (conceptDbServiceInjected) {
        conceptDbService = conceptDbServiceInjected
    }]));

    it("should update children of concept if there are setmembers", function(done){
        var schemaBuilder = lf.schema.create('conceptMetadata', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.MetaDataSchemaDefinitions.Concept);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var conceptJson = JSON.parse(readFixtures('concept.json'));
        var uuid = "c36a7537-3f10-11e4-adec-0800271c1b75";
        var child1Uuid = "c36af094-3f10-11e4-adec-0800271c1b75";
        var child1Name = "Pulse Data";
        schemaBuilder.connect().then(function(db){
            conceptDbService.init(db);
            conceptDbService.insertConceptAndUpdateHierarchy(conceptJson).then(function(){
                conceptDbService.getConcept(uuid).then(function(result) {
                    expect(result.data).toBe(conceptJson);
                }).then(function() {
                    conceptDbService.getConcept(child1Uuid).then(function(result) {
                        expect(result.name).toBe(child1Name);
                        expect(result.parents.parentConcepts.length).toBe(1);
                        done();
                    })
                });
            });
        });
    });

    it("should return the root concept for any given child concept", function(done){
        var schemaBuilder = lf.schema.create('conceptMetadata', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.MetaDataSchemaDefinitions.Concept);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var conceptJson = JSON.parse(readFixtures('concept.json'));
        var childConceptName = "RR Data";
        schemaBuilder.connect().then(function(db){
            conceptDbService.init(db);
            conceptDbService.insertConceptAndUpdateHierarchy(conceptJson).then(function(){
                conceptDbService.getAllParentsInHierarchy(childConceptName, []).then(function (result) {
                    expect(result).toEqual(['RR Data', 'Vitals']);
                });

                conceptDbService.getAllParentsInHierarchy(childConceptName, []).then(function (result) {
                    expect(result).toEqual(['RR Data', 'Vitals']);
                    done();
                });
            });
        });
    });

    it("should return the empty array if the given concept is not in db", function(done){
        var schemaBuilder = lf.schema.create('conceptMetadata', 1);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.MetaDataSchemaDefinitions.Concept);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var conceptJson = JSON.parse(readFixtures('concept.json'));
        var conceptName = "dummyConcept";
        schemaBuilder.connect().then(function(db){
            conceptDbService.init(db);
            conceptDbService.insertConceptAndUpdateHierarchy(conceptJson).then(function(){
                conceptDbService.getAllParentsInHierarchy(conceptName, []).then(function (result) {
                    expect(result).toEqual([]);
                    done();
                });
            });
        });
    });

});