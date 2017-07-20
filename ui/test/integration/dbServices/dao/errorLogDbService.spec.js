'use strict';

describe('encounterDbService tests', function () {
    var errorLogDbService, schemaBuilder;

    beforeEach(function () {
        module('bahmni.common.offline');
        schemaBuilder = lf.schema.create('ErrorLog', 2);
        Bahmni.Tests.OfflineDbUtils.createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.ErrorLog);
    });

    beforeEach(inject(['errorLogDbService', function (errorLogDbServiceInjected) {
        errorLogDbService = errorLogDbServiceInjected
    }]));
    

    it("should insert logs in error log table", function (done) {
        var failedRequest = "https://failedRequestUrl";
        var stackTraceOfError = "error 500";
        var responseStatus = 500;
        var requestPayload = {data: 'requestPayload'};
        var uuid = "someUuid";
        var provider = {display: "armanvuiyan", uuid: "providerUuid"};
        schemaBuilder.connect().then(function(db){
            errorLogDbService.insertLog(db, uuid, failedRequest, responseStatus,  stackTraceOfError, requestPayload, provider);
               errorLogDbService.getLog(db).then(function (result) {
                   expect(result[0].stackTrace).toBe(stackTraceOfError);
                   done();
               })
        });

    });

    it("should get error log based on uuid", function (done) {
        var failedRequest = "https://failedRequestUrl";
        var stackTraceOfError = "error 500";
        var responseStatus = 500;
        var requestPayload = {data: 'requestPayload'};
        var uuid = "someUuid";
        var provider = {display: "armanvuiyan", uuid: "providerUuid"};
        schemaBuilder.connect().then(function(db){
            errorLogDbService.insertLog(db, uuid, failedRequest, responseStatus,  stackTraceOfError, requestPayload, provider);
            errorLogDbService.getErrorLogByUuid(db,uuid).then(function (result) {
                expect(result.stackTrace).toBe(stackTraceOfError);
                expect(result.failedRequestUrl).toBe(failedRequest);
                expect(result.responseStatus).toBe(responseStatus);
                done();
            })
        });

    });

    it("should delete error log based on uuid", function (done) {
        var failedRequest = "https://failedRequestUrl";
        var stackTraceOfError = "error 500";
        var responseStatus = 500;
        var requestPayload = {data: 'requestPayload'};
        var uuid = "someUuid";
        var provider = {display: "armanvuiyan", uuid: "providerUuid"};
        schemaBuilder.connect().then(function(db){
            errorLogDbService.insertLog(db, uuid, failedRequest, responseStatus,  stackTraceOfError, requestPayload, provider);
            errorLogDbService.getErrorLogByUuid(db,uuid).then(function (result) {
                expect(result.stackTrace).toBe(stackTraceOfError);
                expect(result.failedRequestUrl).toBe(failedRequest);
                expect(result.responseStatus).toBe(responseStatus);
            }).then(function(){
                errorLogDbService.deleteByUuid(db,uuid).then(function() {
                    errorLogDbService.getErrorLogByUuid(db, uuid).then(function (result) {
                        expect(result).toBeEmpty();
                        done();
                    })
                });
            })
        });

    });

    it("should not delete error log if uuid is not present", function (done) {
        var failedRequest = "https://failedRequestUrl";
        var stackTraceOfError = "error 500";
        var responseStatus = 500;
        var requestPayload = {data: 'requestPayload'};
        var uuid = "someUuid";
        var provider = {display: "armanvuiyan", uuid: "providerUuid"};
        schemaBuilder.connect().then(function(db){
            errorLogDbService.insertLog(db, uuid, failedRequest, responseStatus,  stackTraceOfError, requestPayload, provider);
            errorLogDbService.getErrorLogByUuid(db,uuid).then(function (result) {
                expect(result.stackTrace).toBe(stackTraceOfError);
                expect(result.failedRequestUrl).toBe(failedRequest);
                expect(result.responseStatus).toBe(responseStatus);
            }).then(function(){
                errorLogDbService.deleteByUuid(db,"randomUuid").then(function() {
                    errorLogDbService.getErrorLogByUuid(db, uuid).then(function (result) {
                        expect(result.stackTrace).toBe(stackTraceOfError);
                        expect(result.failedRequestUrl).toBe(failedRequest);
                        expect(result.responseStatus).toBe(responseStatus);
                        done();
                    })
                });
            })
        });

    });

});