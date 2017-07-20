'use strict';

angular.module('bahmni.common.offline')
    .service('offlineConfigDbService', function () {
        var db;

        var getConfig = function (module) {
            var config = db.getSchema().table('configs');
            return db.select()
                .from(config)
                .where(config.key.eq(module)).exec()
                .then(function (result) {
                    return result[0];
                });
        };

        var insertConfig = function (module, data, eTag) {
            var config = db.getSchema().table('configs');

            var row = config.createRow({
                key: module,
                value: data,
                etag: eTag
            });

            return db.insertOrReplace().into(config).values([row]).exec().then(function (result) {
                return result[0];
            });
        };

        var init = function (_db) {
            db = _db;
        };

        return {
            init: init,
            getConfig: getConfig,
            insertConfig: insertConfig
        };
    });
