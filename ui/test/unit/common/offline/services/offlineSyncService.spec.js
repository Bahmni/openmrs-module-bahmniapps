'use strict';

var $scope, offlineDbService, eventLogService, offlineSyncService, offlineService, configurationService;

describe('OfflineSyncService', function () {
    var patient, mappedPatient;
    describe('initial sync ', function () {
        beforeEach(function () {
            module('bahmni.common.offline');
            module('bahmni.common.domain');
            module(function ($provide) {
                mappedPatient = {
                    patient: {
                        uuid: 'dataUuid',
                        person: {
                            attributes: [{
                                attributeType: {uuid: 'attributeUuid'},
                                voided: false,
                                value: 'attributeName',
                                hydratedObject: 'attributeValueUuid'
                            }]
                        }
                    }
                };
                patient = {
                    uuid: 'dataUuid',
                    person: {
                        attributes:[{
                            attributeType: {
                                uuid: "attributeUuid"
                            },
                            voided: false,
                            value: {
                                display: "attributeName",
                                uuid: "attributeValueUuid"
                            }
                        }]
                    }
                };
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
                                return callback;
                            }
                        };
                    },
                    getAttributeTypes: function(){
                        return {
                            then: function (callback) {
                                var attributeTypes = {
                                    uuid: 'attributeUuid',
                                    format: 'org.openmrs.Concept'
                                };
                                return callback({data: attributeTypes});
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
                    getAddressEventsFor: function () {
                        return {
                            then: function (callback) {
                                return callback({
                                    data: [{
                                        object: 'url to get address object',
                                        category: 'addressHierarchy',
                                        uuid: 'eventuuid'
                                    }]
                                });
                            }
                        };
                    },
                    getDataForUrl: function () {
                        return {
                            then: function (callback) {

                                return callback({data: patient});
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


        it('should read parent address events from the beginning', function () {
            spyOn(offlineDbService, 'getMarker').and.callThrough();
            spyOn(eventLogService, 'getEventsFor').and.callThrough();
            spyOn(eventLogService, 'getAddressEventsFor').and.callThrough();
            spyOn(eventLogService, 'getDataForUrl').and.callThrough();
            spyOn(offlineDbService, 'createPatient').and.callThrough();
            spyOn(offlineDbService, 'insertMarker').and.callThrough();
            spyOn(offlineDbService, 'getAttributeTypes').and.callThrough();
            spyOn(offlineDbService, 'insertAddressHierarchy').and.callThrough();


            offlineSyncService.syncParentAddressEntries();

            expect(offlineDbService.getMarker).toHaveBeenCalled();
            expect(offlineDbService.getMarker.calls.count()).toBe(1);
            expect(eventLogService.getAddressEventsFor).toHaveBeenCalledWith(undefined, undefined);
            expect(eventLogService.getDataForUrl).toHaveBeenCalledWith('url to get address object');
            expect(eventLogService.getDataForUrl.calls.count()).toBe(1);

            expect(offlineDbService.insertAddressHierarchy).toHaveBeenCalledWith(patient);
            expect(offlineDbService.insertMarker).toHaveBeenCalledWith('ParentAddressHierarchyData', "eventuuid", null);
            expect(offlineDbService.insertMarker.calls.count()).toBe(1);

        });

        it('should read address events from the beginning for the catchment', function () {
            spyOn(offlineDbService, 'getMarker').and.callThrough();
            spyOn(eventLogService, 'getEventsFor').and.callThrough();
            spyOn(eventLogService, 'getAddressEventsFor').and.callThrough();
            spyOn(eventLogService, 'getDataForUrl').and.callThrough();
            spyOn(offlineDbService, 'createPatient').and.callThrough();
            spyOn(offlineDbService, 'insertMarker').and.callThrough();
            spyOn(offlineDbService, 'getAttributeTypes').and.callThrough();
            spyOn(offlineDbService, 'insertAddressHierarchy').and.callThrough();


            offlineSyncService.syncAddressHierarchyEntries();

            expect(offlineDbService.getMarker).toHaveBeenCalled();
            expect(offlineDbService.getMarker.calls.count()).toBe(1);
            expect(eventLogService.getAddressEventsFor).toHaveBeenCalledWith(202020, undefined);
            expect(eventLogService.getDataForUrl).toHaveBeenCalledWith('url to get address object');
            expect(eventLogService.getDataForUrl.calls.count()).toBe(1);

            expect(offlineDbService.insertAddressHierarchy).toHaveBeenCalledWith(patient);
            expect(offlineDbService.insertMarker).toHaveBeenCalledWith('AddressHierarchyData', "eventuuid", 202020);
            expect(offlineDbService.insertMarker.calls.count()).toBe(1);

        });

        it('should read patient events from the beginning for the catchment', function () {
            spyOn(offlineDbService, 'getMarker').and.callThrough();
            spyOn(eventLogService, 'getEventsFor').and.callThrough();
            spyOn(eventLogService, 'getDataForUrl').and.callThrough();
            spyOn(offlineDbService, 'createPatient').and.callThrough();
            spyOn(offlineDbService, 'insertMarker').and.callThrough();
            spyOn(offlineDbService, 'getAttributeTypes').and.callThrough();

            offlineSyncService.syncTransactionalData();

            expect(offlineDbService.getMarker).toHaveBeenCalled();
            expect(offlineDbService.getMarker.calls.count()).toBe(1);
            expect(eventLogService.getEventsFor).toHaveBeenCalledWith(202020, undefined);
            expect(eventLogService.getEventsFor.calls.count()).toBe(1);
            expect(eventLogService.getDataForUrl).toHaveBeenCalledWith('url to get patient object');
            expect(eventLogService.getDataForUrl.calls.count()).toBe(1);



            expect(offlineDbService.createPatient).toHaveBeenCalledWith(mappedPatient);
            expect(offlineDbService.createPatient.calls.count()).toBe(1);
            expect(offlineDbService.insertMarker).toHaveBeenCalledWith('TransactionalData', 'eventuuid', 202020);
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
                    },
                    getAttributeTypes: function(){
                        return {
                            then: function (callback) {
                                var attributeTypes = {
                                    uuid: 'attributeUuid',
                                    format: 'org.openmrs.Concept'
                                };
                                return callback({data: attributeTypes});
                            }
                        };
                    },
                    insertAddressHierarchy: function () {
                        return {
                            then: function (callback) {
                                return callback({});
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
                    },getAddressEventsFor: function () {
                        return {
                            then: function (callback) {
                                return callback({
                                    data: [{
                                        object: 'url to get address object',
                                        category: 'addressHierarchy',
                                        uuid: 'eventuuid'
                                    }]
                                });
                            }
                        };
                    },
                    getDataForUrl: function () {
                        return {
                            then: function (callback) {

                                return callback({data: patient});
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


        it('should read parent events from the last read uuid', function () {
            spyOn(offlineDbService, 'getMarker').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback({lastReadEventUuid: 'lastReadUuid', catchmentNumber: null});
                    }
                };
            });
            spyOn(eventLogService, 'getEventsFor').and.callThrough();
            spyOn(eventLogService, 'getAddressEventsFor').and.callThrough();
            spyOn(eventLogService, 'getDataForUrl').and.callThrough();
            spyOn(offlineDbService, 'createPatient').and.callThrough();
            spyOn(offlineDbService, 'insertAddressHierarchy').and.callThrough();
            spyOn(offlineDbService, 'insertMarker').and.callThrough();

            offlineSyncService.syncParentAddressEntries();

            expect(offlineDbService.getMarker).toHaveBeenCalled();
            expect(offlineDbService.getMarker.calls.count()).toBe(1);
            expect(eventLogService.getAddressEventsFor).toHaveBeenCalledWith(null, 'lastReadUuid');
            expect(eventLogService.getAddressEventsFor.calls.count()).toBe(1);
            expect(eventLogService.getDataForUrl).toHaveBeenCalledWith('url to get address object');
            expect(eventLogService.getDataForUrl.calls.count()).toBe(1);
            expect(offlineDbService.insertAddressHierarchy).toHaveBeenCalledWith(patient);
            expect(offlineDbService.insertAddressHierarchy.calls.count()).toBe(1);
            expect(offlineDbService.insertMarker).toHaveBeenCalledWith('ParentAddressHierarchyData', 'eventuuid', null);
            expect(offlineDbService.insertMarker.calls.count()).toBe(1);
        });

        it('should read address events from the last read uuid for the catchment', function () {
            spyOn(offlineDbService, 'getMarker').and.callThrough();
            spyOn(eventLogService, 'getEventsFor').and.callThrough();
            spyOn(eventLogService, 'getAddressEventsFor').and.callThrough();
            spyOn(eventLogService, 'getDataForUrl').and.callThrough();
            spyOn(offlineDbService, 'createPatient').and.callThrough();
            spyOn(offlineDbService, 'insertAddressHierarchy').and.callThrough();
            spyOn(offlineDbService, 'insertMarker').and.callThrough();

            offlineSyncService.syncAddressHierarchyEntries();

            expect(offlineDbService.getMarker).toHaveBeenCalled();
            expect(offlineDbService.getMarker.calls.count()).toBe(1);
            expect(eventLogService.getAddressEventsFor).toHaveBeenCalledWith(202020, 'lastReadUuid');
            expect(eventLogService.getAddressEventsFor.calls.count()).toBe(1);
            expect(eventLogService.getDataForUrl).toHaveBeenCalledWith('url to get address object');
            expect(eventLogService.getDataForUrl.calls.count()).toBe(1);
            expect(offlineDbService.insertAddressHierarchy).toHaveBeenCalledWith(patient);
            expect(offlineDbService.insertAddressHierarchy.calls.count()).toBe(1);
            expect(offlineDbService.insertMarker).toHaveBeenCalledWith('AddressHierarchyData', 'eventuuid', 202020);
            expect(offlineDbService.insertMarker.calls.count()).toBe(1);
        });

        it('should read patient events from the last read uuid for the catchment', function () {
            spyOn(offlineDbService, 'getMarker').and.callThrough();
            spyOn(eventLogService, 'getEventsFor').and.callThrough();
            spyOn(eventLogService, 'getDataForUrl').and.callThrough();
            spyOn(offlineDbService, 'createPatient').and.callThrough();
            spyOn(offlineDbService, 'insertMarker').and.callThrough();

            offlineSyncService.syncTransactionalData();

            expect(offlineDbService.getMarker).toHaveBeenCalled();
            expect(offlineDbService.getMarker.calls.count()).toBe(1);
            expect(eventLogService.getEventsFor).toHaveBeenCalledWith(202020, 'lastReadUuid');
            expect(eventLogService.getEventsFor.calls.count()).toBe(1);
            expect(eventLogService.getDataForUrl).toHaveBeenCalledWith('url to get patient object');
            expect(eventLogService.getDataForUrl.calls.count()).toBe(1);
            expect(offlineDbService.createPatient).toHaveBeenCalledWith({patient:patient});
            expect(offlineDbService.createPatient.calls.count()).toBe(1);
            expect(offlineDbService.insertMarker).toHaveBeenCalledWith('TransactionalData', 'eventuuid', 202020);
            expect(offlineDbService.insertMarker.calls.count()).toBe(1);
        });
    })
});