'use strict';

angular.module('bahmni.common.offline')
    .service('errorLogDbService', function () {

        var insertLog = function (db, failedRequest, responseStatus, stacktrace, requestPayload, provider) {
            var errorLogTable = db.getSchema().table('error_log');
            var row = errorLogTable.createRow({
                failedRequestUrl: failedRequest,
                logDateTime: new Date(),
                responseStatus: responseStatus,
                stackTrace: stacktrace,
                requestPayload: requestPayload,
                provider: provider
            });
            db.insertOrReplace().into(errorLogTable).values([row]).exec();
        };

        var getLog = function (db) {
            var p = db.getSchema().table('error_log');
            
            return db.select()
                .from(p).exec()
                .then(function (results) {
                    return results;
                });
        };
        return {
            insertLog: insertLog,
            getLog: getLog
        }
    });
