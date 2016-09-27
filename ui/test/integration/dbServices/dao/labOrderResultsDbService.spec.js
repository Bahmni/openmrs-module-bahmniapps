'use strict';

describe('labOrderResultsDbService tests', function () {
    var labOrderResultsDbService;

    beforeEach(function () {
        module('bahmni.common.offline');
    });

    beforeEach(inject(['labOrderResultsDbService', function (labOrderResultsDbServiceInjected) {
        labOrderResultsDbService = labOrderResultsDbServiceInjected;
    }]));

    it("insert lab results and get lab results by patient uuid from lovefield database", function(done){
        var schemaBuilder = lf.schema.create('labOrderResults', 2);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.LabOrderResult);
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var resultsJson = JSON.parse(readFixtures('labOrderResults.json'));
        schemaBuilder.connect().then(function(db){
            var uuid = "e905bf88-c461-46e7-a2f1-87db4f611f5e";
            var params = { patientUuid: uuid};
            labOrderResultsDbService.insertLabOrderResults(db, uuid, resultsJson).then(function(){
                labOrderResultsDbService.getLabOrderResultsForPatient(db, params).then(function(labResults){
                    expect(labResults.results.results.length).toBe(2);
                    expect(labResults.results.tabularResult).toBeDefined();
                    done();
                });
            });
        });
    });


});
