'use strict';

angular.module('bahmni.common.offline')
    .factory('offlineDbInitialization', ['spinner', 'offlineService', 'initializeOfflineSchema', 'offlineDbService', 'androidDbService', 'dbNameService',
        function (spinner, offlineService, initializeOfflineSchema, offlineDbService, androidDbService, dbNameService) {
            var getDbName = function (provider, location) {
                return dbNameService.getDbName(provider, location);
            };
            return function () {
                if (offlineService.isOfflineApp()) {
                    if (offlineService.isAndroidApp()) {
                        offlineDbService = androidDbService;
                    }
                    var loginInformation = offlineService.getItem('LoginInformation');
                    var location = loginInformation ? loginInformation.currentLocation.display : null;
                    return offlineDbService.initSchema(Bahmni.Common.Constants.bahmniConnectMetaDataDb).then(function (metaDataDb) {
                        offlineDbService.init(metaDataDb);
                        if (location === null) {
                            return metaDataDb;
                        }
                        var dbNames = offlineService.getItem("dbNames") || [];
                        var username = offlineService.getItem("userData").results[0].username;
                        return getDbName(username, location).then(function (dbName) {
                            dbNames.push(dbName);
                            offlineService.setItem("dbNames", _.uniq(dbNames));
                            offlineService.setItem("currentDbName", dbName);
                            return offlineDbService.initSchema(dbName);
                        }).then(function (db) {
                            offlineDbService.init(db);
                            return db;
                        });
                    });
                }
            };
        }
    ]);
