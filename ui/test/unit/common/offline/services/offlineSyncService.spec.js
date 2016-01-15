'use strict';

var $scope, offlineDao, eventLogService, offlineSyncService, offlineMarkerDao, offlineAHDao;

describe('OfflineSyncService', function () {
    describe('initial sync ', function () {
        beforeEach(function () {
            module('bahmni.common.offline');
            module(function ($provide) {
                $provide.value('offlineAddressHierarchyDao', {
                    insertAddressHierarchy: function () {
                        return {
                            then: function (callback) {
                                return callback({});
                            }
                        };
                    }
                });
                $provide.value('offlineDao', {
                    createPatient: function () {
                        return {
                            then: function (callback) {
                                return callback({});
                            }
                        };
                    }
                });
                $provide.value('offlineMarkerDao', {
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
            });
        });

        beforeEach(inject(['offlineSyncService', 'eventLogService', 'offlineMarkerDao', 'offlineDao', 'offlineAddressHierarchyDao', function (offlineSyncServiceInjected, eventLogServiceInjected, offlineMarkerDaoInjected, offlineDaoInjected, offlineAddressHierarchyDaoInjected) {
            offlineSyncService = offlineSyncServiceInjected;
            eventLogService = eventLogServiceInjected;
            offlineMarkerDao = offlineMarkerDaoInjected;
            offlineDao = offlineDaoInjected;
            offlineAHDao = offlineAddressHierarchyDaoInjected;
        }]));


        it('should read patient events from the beginning for the catchment', function () {
            spyOn(offlineMarkerDao, 'getMarker').and.callThrough();
            spyOn(eventLogService, 'getEventsFor').and.callThrough();
            spyOn(eventLogService, 'getDataForUrl').and.callThrough();
            spyOn(offlineDao, 'createPatient').and.callThrough();
            spyOn(offlineMarkerDao, 'insertMarker').and.callThrough();

            offlineSyncService.sync();

            expect(offlineMarkerDao.getMarker).toHaveBeenCalled();
            expect(offlineMarkerDao.getMarker.calls.count()).toBe(1);
            expect(eventLogService.getEventsFor).toHaveBeenCalledWith(202020, undefined);
            expect(eventLogService.getEventsFor.calls.count()).toBe(1);
            expect(eventLogService.getDataForUrl).toHaveBeenCalledWith('url to get patient object');
            expect(eventLogService.getDataForUrl.calls.count()).toBe(1);
            expect(offlineDao.createPatient).toHaveBeenCalledWith({patient: {uuid: 'dataUuid'}});
            expect(offlineDao.createPatient.calls.count()).toBe(1);
            expect(offlineMarkerDao.insertMarker).toHaveBeenCalledWith('eventuuid', 202020);
            expect(offlineMarkerDao.insertMarker.calls.count()).toBe(1);
        });


        it('should read address hierarchy entry from the beginning for the catchment', function () {
            spyOn(offlineMarkerDao, 'getMarker').and.callThrough();
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
            spyOn(offlineMarkerDao, 'insertMarker').and.callThrough();
            spyOn(offlineAHDao, 'insertAddressHierarchy').and.callThrough();

            offlineSyncService.sync();

            expect(offlineMarkerDao.getMarker).toHaveBeenCalled();
            expect(offlineMarkerDao.getMarker.calls.count()).toBe(1);
            expect(eventLogService.getEventsFor).toHaveBeenCalledWith(202020, undefined);
            expect(eventLogService.getEventsFor.calls.count()).toBe(1);
            expect(eventLogService.getDataForUrl).toHaveBeenCalledWith('url to get addressHierarchy object');
            expect(eventLogService.getDataForUrl.calls.count()).toBe(1);
            expect(offlineAHDao.insertAddressHierarchy).toHaveBeenCalledWith({uuid: 'dataUuid'});
            expect(offlineDao.createPatient.calls.count()).toBe(0);
            expect(offlineMarkerDao.insertMarker).toHaveBeenCalledWith('eventuuid', 202020);
            expect(offlineMarkerDao.insertMarker.calls.count()).toBe(1);
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
                    }
                });
                $provide.value('offlineMarkerDao', {
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
            });
        });

        beforeEach(inject(['offlineSyncService', 'eventLogService', 'offlineMarkerDao', 'offlineDao', function (offlineSyncServiceInjected, eventLogServiceInjected, offlineMarkerDaoInjected, offlineDaoInjected) {
            offlineSyncService = offlineSyncServiceInjected;
            eventLogService = eventLogServiceInjected;
            offlineMarkerDao = offlineMarkerDaoInjected;
            offlineDao = offlineDaoInjected;
        }]));


        it('should read events from the last read uuid for the catchment', function () {
            spyOn(offlineMarkerDao, 'getMarker').and.callThrough();
            spyOn(eventLogService, 'getEventsFor').and.callThrough();
            spyOn(eventLogService, 'getDataForUrl').and.callThrough();
            spyOn(offlineDao, 'createPatient').and.callThrough();
            spyOn(offlineMarkerDao, 'insertMarker').and.callThrough();

            offlineSyncService.sync();

            expect(offlineMarkerDao.getMarker).toHaveBeenCalled();
            expect(offlineMarkerDao.getMarker.calls.count()).toBe(1);
            expect(eventLogService.getEventsFor).toHaveBeenCalledWith(202020, 'lastReadUuid');
            expect(eventLogService.getEventsFor.calls.count()).toBe(1);
            expect(eventLogService.getDataForUrl).toHaveBeenCalledWith('url to get patient object');
            expect(eventLogService.getDataForUrl.calls.count()).toBe(1);
            expect(offlineDao.createPatient).toHaveBeenCalledWith({patient: {uuid: 'patientUuid'}});
            expect(offlineDao.createPatient.calls.count()).toBe(1);
            expect(offlineMarkerDao.insertMarker).toHaveBeenCalledWith('eventuuid', 202020);
            expect(offlineMarkerDao.insertMarker.calls.count()).toBe(1);
        });
    })
});