"use strict";


describe("dbNameService", function () {
    describe("getDbName", function () {
        var dbNameService, offlineDbService, offlineService;
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
                    },
                    getItem: function () {
                        return true;
                    }
                })
            });
            inject(['dbNameService', "offlineDbService", "offlineService", function (dbNameServiceInjected, offlineDbServiceInjected, offlineServiceInjected) {
                dbNameService = dbNameServiceInjected;
                offlineDbService = offlineDbServiceInjected;
                offlineService = offlineServiceInjected;
            }]);

        };

        it("should give loginLocation as db name", function (done) {
            injectDependency({
                value: {"dbNameCondition.js": "Bahmni.Common.Offline.dbNameCondition.get = function (provider, loginLocation) {return loginLocation;};"}
            });

            spyOn(offlineDbService, "getConfig").and.callThrough();
            spyOn(offlineService, "getItem").and.callThrough();
            dbNameService.getDbName("provider", "loginLocation").then(function (dbName) {
                expect(dbName).toBe("loginLocation");
                done();
            });
            expect(offlineDbService.getConfig.calls.count()).toBe(1);
            expect(offlineService.getItem.calls.count()).toBe(1);
            expect(offlineService.getItem).toHaveBeenCalledWith("allowMultipleLoginLocation");
        });

        it("should give loginLocation as db name", function (done) {
            injectDependency({
                value: {"dbNameCondition.js": "Bahmni.Common.Offline.dbNameCondition.get = function (provider, loginLocation) {return provider;};"}
            });

            spyOn(offlineDbService, "getConfig").and.callThrough();
            spyOn(offlineService, "getItem").and.callThrough();
            dbNameService.getDbName("provider", "loginLocation").then(function (dbName) {
                expect(dbName).toBe("provider");
                done();
            });
            expect(offlineDbService.getConfig.calls.count()).toBe(1);
            expect(offlineService.getItem.calls.count()).toBe(1);
            expect(offlineService.getItem).toHaveBeenCalledWith("allowMultipleLoginLocation");
        });
        it("should give default DB name 'Bahmni Connect' if allowMultipleLoginLocation is set to false", function (done) {
            var config = {
                value: {"dbNameCondition.js": "Bahmni.Common.Offline.dbNameCondition.get = function (provider, loginLocation) {return provider;};"}
            };

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
                    },
                    getItem: function () {
                        return false;
                    }
                })
            });
            inject(['dbNameService', "offlineDbService", "offlineService", function (dbNameServiceInjected, offlineDbServiceInjected, offlineServiceInjected) {
                dbNameService = dbNameServiceInjected;
                offlineDbService = offlineDbServiceInjected;
                offlineService = offlineServiceInjected;
            }]);
            spyOn(offlineService, "getItem").and.callThrough();
            spyOn(offlineDbService, "getConfig").and.callThrough();

            dbNameService.getDbName("provider", "loginLocation").then(function (dbName) {
                expect(dbName).toBe("Bahmni Connect");
                done();
            });
            expect(offlineService.getItem.calls.count()).toBe(1);
            expect(offlineService.getItem).toHaveBeenCalledWith("allowMultipleLoginLocation");
            expect(offlineDbService.getConfig.calls.count()).toBe(0);
        });
    });
});
