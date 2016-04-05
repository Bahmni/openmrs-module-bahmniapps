'use strict';

var $scope, offlineDbService, eventLogService, offlineSyncService, offlineService, configurationService;

describe('OfflineSyncService', function () {
    describe('initial sync ', function () {
        beforeEach(function () {
            module('bahmni.common.offline');
            module('bahmni.common.domain');
            module(function ($provide) {
                $provide.value('offlineDbService', {
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
                                return;
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
                    isAndroidApp: function () {
                        return false;
                    },
                    getItem: function() {
                        return 202020;
                    }
                });
            });
        });

        beforeEach(inject(['offlineSyncService', 'eventLogService', 'offlineDbService', 'configurationService',
            function (offlineSyncServiceInjected, eventLogServiceInjected, offlineDbServiceInjected, configurationServiceInjected) {
            offlineSyncService = offlineSyncServiceInjected;
            eventLogService = eventLogServiceInjected;
            offlineDbService = offlineDbServiceInjected;
            configurationService = configurationServiceInjected;
        }]));


        it('should read patient events from the beginning for the catchment', function () {
            spyOn(offlineDbService, 'getMarker').and.callThrough();
            spyOn(eventLogService, 'getEventsFor').and.callThrough();
            spyOn(eventLogService, 'getDataForUrl').and.callThrough();
            spyOn(offlineDbService, 'createPatient').and.callThrough();
            spyOn(offlineDbService, 'insertMarker').and.callThrough();

            offlineSyncService.init();

            expect(offlineDbService.getMarker).toHaveBeenCalled();
            expect(offlineDbService.getMarker.calls.count()).toBe(1);
            expect(eventLogService.getEventsFor).toHaveBeenCalledWith(202020, undefined);
            expect(eventLogService.getEventsFor.calls.count()).toBe(1);
            expect(eventLogService.getDataForUrl).toHaveBeenCalledWith('url to get patient object');
            expect(eventLogService.getDataForUrl.calls.count()).toBe(1);
            expect(offlineDbService.createPatient).toHaveBeenCalledWith({patient: {uuid: 'dataUuid'}});
            expect(offlineDbService.createPatient.calls.count()).toBe(1);
            expect(offlineDbService.insertMarker).toHaveBeenCalledWith('eventuuid', 202020);
            expect(offlineDbService.insertMarker.calls.count()).toBe(1);
        });


        it('should read address hierarchy entry from the beginning for the catchment', function () {
            spyOn(offlineDbService, 'getMarker').and.callThrough();
            spyOn(eventLogService, 'getEventsFor').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback({
                            data: [{
                                object: 'url to get addressHierarchy object',
                                category: 'addressHierarchy',
                                uuid: 'eventuuid'
                            }]
                        });
                    }
                };
            });
            spyOn(eventLogService, 'getDataForUrl').and.callThrough();
            spyOn(offlineDbService, 'createPatient').and.callThrough();
            spyOn(offlineDbService, 'insertMarker').and.callThrough();
            spyOn(offlineDbService, 'insertAddressHierarchy').and.callThrough();

            offlineSyncService.init();

            expect(offlineDbService.getMarker).toHaveBeenCalled();
            expect(offlineDbService.getMarker.calls.count()).toBe(1);
            expect(eventLogService.getEventsFor).toHaveBeenCalledWith(202020, undefined);
            expect(eventLogService.getEventsFor.calls.count()).toBe(1);
            expect(eventLogService.getDataForUrl).toHaveBeenCalledWith('url to get addressHierarchy object');
            expect(eventLogService.getDataForUrl.calls.count()).toBe(1);
            expect(offlineDbService.insertAddressHierarchy).toHaveBeenCalledWith({uuid: 'dataUuid'});
            expect(offlineDbService.createPatient.calls.count()).toBe(0);
            expect(offlineDbService.insertMarker).toHaveBeenCalledWith('eventuuid', 202020);
            expect(offlineDbService.insertMarker.calls.count()).toBe(1);
        });
    });

    describe('subsequent sync ', function () {
        beforeEach(function () {
            module('bahmni.common.offline');
            module('bahmni.common.domain');
            module(function ($provide) {
                $provide.value('offlineDbService', {
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
                                return ;
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
                    isAndroidApp: function () {
                        return false;
                    },
                    getItem: function() {
                        return 202020;
                    }
                });
            });
        });

        beforeEach(inject(['offlineSyncService', 'eventLogService', 'offlineDbService', 'configurationService',
            function (offlineSyncServiceInjected, eventLogServiceInjected, offlineDbServiceInjected, configurationServiceInjected) {
            offlineSyncService = offlineSyncServiceInjected;
            eventLogService = eventLogServiceInjected;
            offlineDbService = offlineDbServiceInjected;
            configurationService = configurationServiceInjected;
        }]));


        it('should read events from the last read uuid for the catchment', function () {
            spyOn(offlineDbService, 'getMarker').and.callThrough();
            spyOn(eventLogService, 'getEventsFor').and.callThrough();
            spyOn(eventLogService, 'getDataForUrl').and.callThrough();
            spyOn(offlineDbService, 'createPatient').and.callThrough();
            spyOn(offlineDbService, 'insertMarker').and.callThrough();

            offlineSyncService.init();

            expect(offlineDbService.getMarker).toHaveBeenCalled();
            expect(offlineDbService.getMarker.calls.count()).toBe(1);
            expect(eventLogService.getEventsFor).toHaveBeenCalledWith(202020, 'lastReadUuid');
            expect(eventLogService.getEventsFor.calls.count()).toBe(1);
            expect(eventLogService.getDataForUrl).toHaveBeenCalledWith('url to get patient object');
            expect(eventLogService.getDataForUrl.calls.count()).toBe(1);
            expect(offlineDbService.createPatient).toHaveBeenCalledWith({patient: {uuid: 'patientUuid'}});
            expect(offlineDbService.createPatient.calls.count()).toBe(1);
            expect(offlineDbService.insertMarker).toHaveBeenCalledWith('eventuuid', 202020);
            expect(offlineDbService.insertMarker.calls.count()).toBe(1);
        });
    })
});