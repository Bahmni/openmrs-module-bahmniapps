'use strict';

describe('encounterDbService tests', function () {
    var errorLogDbService, schemaBuilder;

    beforeEach(function () {
        module('bahmni.common.offline');
        schemaBuilder = lf.schema.create('ErrorLog', 2);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.ErrorLog, true);
    });

    beforeEach(inject(['errorLogDbService', function (errorLogDbServiceInjected) {
        errorLogDbService = errorLogDbServiceInjected
    }]));
    

    it("should insert logs in error log table", function (done) {
        var failedRequest = "https://failedRequestUrl";
        var stackTraceOfError = "error 500";
        var responseStatus = 500;
        schemaBuilder.connect().then(function(db){
           errorLogDbService.insertLog(db, failedRequest, responseStatus,  stackTraceOfError);
               errorLogDbService.getLog(db).then(function (result) {
                   expect(result[0].stackTrace).toBe(stackTraceOfError);
                   done();
               })
        });

    })

   
});