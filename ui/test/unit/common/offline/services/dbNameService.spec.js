"use strict";


describe("dbNameService", function () {
    describe("getDbName", function () {
        var dbNameService, offlineDbService;
        var injectDependency = function (config) {
            module('bahmni.common.offline');
            module(function ($provide) {
                $provide.value('$q', Q);
                $provide.value("offlineDbService", {
                    getConfig: function () {
                        return {
                            then: function (callback) {
                                callback(config);
                            }
                        }
                    }
                });
                $provide.value('offlineService', {
                    isAndroidApp: function () {
                        return false;
                    },
                    isOfflineApp: function () {
                        return true;
                    }
                })
            });
            inject(['dbNameService', "offlineDbService", function (dbNameServiceInjected, offlineDbServiceInjected) {
                dbNameService = dbNameServiceInjected;
                offlineDbService = offlineDbServiceInjected;
            }]);

        };

        it("should give loginLocation as db name", function (done) {
            injectDependency({
                value: {"dbNameCondition.js": "Bahmni.Common.Offline.dbNameCondition.get = function (provider, loginLocation) {return loginLocation;};"}
            });

            spyOn(offlineDbService, "getConfig").and.callThrough();
            dbNameService.getDbName("provider", "loginLocation").then(function (dbName) {
                expect(dbName).toBe("loginLocation");
                done();
            });
            expect(offlineDbService.getConfig.calls.count()).toBe(1);
        });

        it("should give loginLocation as db name", function (done) {
            injectDependency({
                value: {"dbNameCondition.js": "Bahmni.Common.Offline.dbNameCondition.get = function (provider, loginLocation) {return provider;};"}
            });

            spyOn(offlineDbService, "getConfig").and.callThrough();
            dbNameService.getDbName("provider", "loginLocation").then(function (dbName) {
                expect(dbName).toBe("provider");
                done();
            });
            expect(offlineDbService.getConfig.calls.count()).toBe(1);

        });
    });
});
