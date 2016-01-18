'use strict';

var $scope, offlineDao, eventLogService, offlineSyncService, offlineService;

describe('OfflineSyncService', function () {
    describe('initial sync ', function () {
        beforeEach(function () {
            module('bahmni.common.offline');
            module(function ($provide) {
                $provide.value('offlineDao', {
                    insertAddressHierarchy: function () {
                        return {
                            then: function (callback) {
                                return callback({});
                            }
                        };
                    },
                    createPatient: function () {
                        return {
                            then: function (callback) {
                                return callback({});
                            }
                        };
                    },
                    getMarker: function () {
                        return {
                            then: function (callback) {
                                return callback(undefined);
                            }
                        };
                    },
                    insertMarker: function () {
                        return {
                            then: function (callback) {
                                return callback(undefined);
                            }
                        };
                    }
                });
                $provide.value('eventLogService', {
                    getEventsFor: function () {
                        return {
                            then: function (callback) {
                                return callback({
                                    data: [{
                                        object: 'url to get patient object',
                                        category: 'patient',
                                        uuid: 'eventuuid'
                                    }]
                                });
                            }
                        };
                    },
                    getDataForUrl: function () {
                        return {
                            then: function (callback) {
                                return callback({data: {uuid: 'dataUuid'}});
                            }
                        };
                    }
                });
                $provide.value('offlineService', {
                    getAppPlatform: function () {
                        return {
                            then: function (callback) {
                                return callback({
                                    data: true
                                });
                            }
                        };
                    }
                });
            });
        });

        beforeEach(inject(['offlineSyncService', 'eventLogService', 'offlineDao', function (offlineSyncServiceInjected, eventLogServiceInjected, offlineDaoInjected) {
            offlineSyncService = offlineSyncServiceInjected;
            eventLogService = eventLogServiceInjected;
            offlineDao = offlineDaoInjected;
        }]));


        it('should read patient events from the beginning for the catchment', function () {
            spyOn(offlineDao, 'getMarker').and.callThrough();
            spyOn(eventLogService, 'getEventsFor').and.callThrough();
            spyOn(eventLogService, 'getDataForUrl').and.callThrough();
            spyOn(offlineDao, 'createPatient').and.callThrough();
            spyOn(offlineDao, 'insertMarker').and.callThrough();

            offlineSyncService.sync();

            expect(offlineDao.getMarker).toHaveBeenCalled();
            expect(offlineDao.getMarker.calls.count()).toBe(1);
            expect(eventLogService.getEventsFor).toHaveBeenCalledWith(202020, undefined);
            expect(eventLogService.getEventsFor.calls.count()).toBe(1);
            expect(eventLogService.getDataForUrl).toHaveBeenCalledWith('url to get patient object');
            expect(eventLogService.getDataForUrl.calls.count()).toBe(1);
            expect(offlineDao.createPatient).toHaveBeenCalledWith({patient: {uuid: 'dataUuid'}});
            expect(offlineDao.createPatient.calls.count()).toBe(1);
            expect(offlineDao.insertMarker).toHaveBeenCalledWith('eventuuid', 202020);
            expect(offlineDao.insertMarker.calls.count()).toBe(1);
        });


        it('should read address hierarchy entry from the beginning for the catchment', function () {
            spyOn(offlineDao, 'getMarker').and.callThrough();
            spyOn(eventLogService, 'getEventsFor').and.callFake(function(){
                return {
                    then: function(callback) { return callback({
                        data: [{
                            object: 'url to get addressHierarchy object',
                            category: 'addressHierarchy',
                            uuid: 'eventuuid'
                        }]
                    }); }
                };
            });
            spyOn(eventLogService, 'getDataForUrl').and.callThrough();
            spyOn(offlineDao, 'createPatient').and.callThrough();
            spyOn(offlineDao, 'insertMarker').and.callThrough();
            spyOn(offlineDao, 'insertAddressHierarchy').and.callThrough();

            offlineSyncService.sync();

            expect(offlineDao.getMarker).toHaveBeenCalled();
            expect(offlineDao.getMarker.calls.count()).toBe(1);
            expect(eventLogService.getEventsFor).toHaveBeenCalledWith(202020, undefined);
            expect(eventLogService.getEventsFor.calls.count()).toBe(1);
            expect(eventLogService.getDataForUrl).toHaveBeenCalledWith('url to get addressHierarchy object');
            expect(eventLogService.getDataForUrl.calls.count()).toBe(1);
            expect(offlineDao.insertAddressHierarchy).toHaveBeenCalledWith({uuid: 'dataUuid'});
            expect(offlineDao.createPatient.calls.count()).toBe(0);
            expect(offlineDao.insertMarker).toHaveBeenCalledWith('eventuuid', 202020);
            expect(offlineDao.insertMarker.calls.count()).toBe(1);
        });
    });

    describe('subsequent sync ', function () {
        beforeEach(function () {
            module('bahmni.common.offline');
            module(function ($provide) {
                $provide.value('offlineDao', {
                    createPatient: function () {
                        return {
                            then: function (callback) {
                                return callback({});
                            }
                        };
                    },
                    getMarker: function () {
                        return {
                            then: function (callback) {
                                return callback({lastReadEventUuid: 'lastReadUuid', catchmentNumber: 202020});
                            }
                        };
                    },
                    insertMarker: function () {
                        return {
                            then: function (callback) {
                                return callback(undefined);
                            }
                        };
                    }
                });
                $provide.value('eventLogService', {
                    getEventsFor: function () {
                        return {
                            then: function (callback) {
                                return callback({
                                    data: [{
                                        object: 'url to get patient object',
                                        category: 'patient',
                                        uuid: 'eventuuid'
                                    }]
                                });
                            }
                        };
                    },
                    getDataForUrl: function () {
                        return {
                            then: function (callback) {
                                return callback({data: {uuid: 'patientUuid'}});
                            }
                        };
                    }
                });
                $provide.value('offlineService', {
                    getAppPlatform: function () {
                        return {
                            then: function (callback) {
                                return callback({
                                    data: true
                                });
                            }
                        };
                    }
                });
            });
        });

        beforeEach(inject(['offlineSyncService', 'eventLogService', 'offlineDao', function (offlineSyncServiceInjected, eventLogServiceInjected, offlineDaoInjected) {
            offlineSyncService = offlineSyncServiceInjected;
            eventLogService = eventLogServiceInjected;
            offlineDao = offlineDaoInjected;
        }]));


        it('should read events from the last read uuid for the catchment', function () {
            spyOn(offlineDao, 'getMarker').and.callThrough();
            spyOn(eventLogService, 'getEventsFor').and.callThrough();
            spyOn(eventLogService, 'getDataForUrl').and.callThrough();
            spyOn(offlineDao, 'createPatient').and.callThrough();
            spyOn(offlineDao, 'insertMarker').and.callThrough();

            offlineSyncService.sync();

            expect(offlineDao.getMarker).toHaveBeenCalled();
            expect(offlineDao.getMarker.calls.count()).toBe(1);
            expect(eventLogService.getEventsFor).toHaveBeenCalledWith(202020, 'lastReadUuid');
            expect(eventLogService.getEventsFor.calls.count()).toBe(1);
            expect(eventLogService.getDataForUrl).toHaveBeenCalledWith('url to get patient object');
            expect(eventLogService.getDataForUrl.calls.count()).toBe(1);
            expect(offlineDao.createPatient).toHaveBeenCalledWith({patient: {uuid: 'patientUuid'}});
            expect(offlineDao.createPatient.calls.count()).toBe(1);
            expect(offlineDao.insertMarker).toHaveBeenCalledWith('eventuuid', 202020);
            expect(offlineDao.insertMarker.calls.count()).toBe(1);
        });
    })
});