'use strict';

angular.module('bahmni.common.offline')
    .service('errorLogDbService', function () {
        var insertLog = function (db, uuid, failedRequest, responseStatus, stacktrace, requestPayload, provider) {
            var errorLogTable = db.getSchema().table('error_log');
            var row = errorLogTable.createRow({
                uuid: uuid,
                failedRequestUrl: failedRequest,
                logDateTime: new Date(),
                responseStatus: responseStatus,
                stackTrace: stacktrace,
                requestPayload: requestPayload,
                provider: provider
            });
            return db.insertOrReplace().into(errorLogTable).values([row]).exec();
        };

        var getLog = function (db) {
            var p = db.getSchema().table('error_log');

            return db.select()
                .from(p).exec()
                .then(function (results) {
                    return results;
                });
        };

        var getErrorLogByUuid = function (db, errorUuid) {
            var error = db.getSchema().table('error_log');
            return db.select()
                .from(error)
                .where(error.uuid.eq(errorUuid)).exec()
                .then(function (result) {
                    return result[0] || {};
                });
        };

        var deleteByUuid = function (db, uuid) {
            var error = db.getSchema().table('error_log');
            return db.delete()
                .from(error)
                .where(error.uuid.eq(uuid)).exec();
        };

        return {
            insertLog: insertLog,
            getLog: getLog,
            getErrorLogByUuid: getErrorLogByUuid,
            deleteByUuid: deleteByUuid
        };
    });
