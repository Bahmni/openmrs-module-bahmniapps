'use strict';

var $scope, offlineDbService, eventLogService, offlineSyncService, offlineService, configurationService;

describe('OfflineSyncService', function () {
    var patient, mappedPatient, encounter, concept, error_log;
    describe('initial sync ', function () {
        var httpBackend, $http, $rootScope;
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
                concept = {
                    uuid: 'dataUuid',
                    data: {},
                    parents: {"parentUuids" : []},
                    name: 'concept'
                };
                error_log = {
                    config: {"url": "this is the url"},
                    data: {}
                };
                encounter = {
                    uuid: 'encounterUuid',
                    observations: [],
                    patientUuid: "patientUuid",
                    visitUuid: "visitUuid"
                };
                $provide.value('offlineDbService', {
                    insertAddressHierarchy: function () {
                        return {
                            then: function (callback) {
                                return callback({});
                            }
                        };
                    },
                    insertEncounterData: function () {
                        return {
                            then: function (callback) {
                                return callback({visitUuid: "someUuid"});
                            }
                        };
                    },
                    createEncounter: function () {
                        return {
                            then: function (callback) {
                                return callback({});
                            }
                        };
                    },
                    insertVisitData: function () {
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
                    insertConceptAndUpdateHierarchy: function () {
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
                    insertLog: function () {
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
                    getConceptEventsFor: function () {
                        return {
                            then: function (callback) {
                                return callback({
                                    data: [{
                                        object: 'url to get concept object',
                                        category: 'offline-concepts',
                                        uuid: 'eventuuid'
                                    }]
                                });
                            }
                        };
                    },
                    getDataForUrl: function (url) {
                        return {
                            then: function (callback) {
                                if (url.contains("concept")) {
                                    return callback({data: concept});
                                }
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

        beforeEach(inject(['offlineSyncService', 'eventLogService', 'offlineDbService', 'configurationService', '$httpBackend', '$http', '$rootScope',
            function (offlineSyncServiceInjected, eventLogServiceInjected, offlineDbServiceInjected, configurationServiceInjected, _$httpBackend_, http, rootScope) {
            offlineSyncService = offlineSyncServiceInjected;
            eventLogService = eventLogServiceInjected;
            offlineDbService = offlineDbServiceInjected;
            configurationService = configurationServiceInjected;
            httpBackend = _$httpBackend_;
            $http = http;
            $rootScope = rootScope;
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

        it('should read concept events from the beginning', function () {
            spyOn(offlineDbService, 'getMarker').and.callThrough();
            spyOn(eventLogService, 'getConceptEventsFor').and.callThrough();
            spyOn(eventLogService, 'getDataForUrl').and.callThrough();
            spyOn(offlineDbService, 'insertConceptAndUpdateHierarchy').and.callThrough();
            spyOn(offlineDbService, 'insertMarker').and.callThrough();

            offlineSyncService.syncConcepts();

            expect(offlineDbService.getMarker).toHaveBeenCalled();
            expect(offlineDbService.getMarker.calls.count()).toBe(1);
            expect(eventLogService.getConceptEventsFor).toHaveBeenCalledWith(undefined);
            expect(eventLogService.getConceptEventsFor.calls.count()).toBe(1);
            expect(eventLogService.getDataForUrl).toHaveBeenCalledWith('url to get concept object');
            expect(eventLogService.getDataForUrl.calls.count()).toBe(1);



            expect(offlineDbService.insertConceptAndUpdateHierarchy).toHaveBeenCalledWith({"results" : [concept]});
            expect(offlineDbService.insertConceptAndUpdateHierarchy.calls.count()).toBe(1);
            expect(offlineDbService.insertMarker).toHaveBeenCalledWith('ConceptData', 'eventuuid', null);
            expect(offlineDbService.insertMarker.calls.count()).toBe(1);
        });

        it('should read encounter events from the beginning for the catchment', function () {
            spyOn(offlineDbService, 'getMarker').and.callThrough();
            spyOn(eventLogService, 'getEventsFor').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback({
                            data: [{
                                object: 'url to get encounter object',
                                category: 'Encounter',
                                uuid: 'eventuuid'
                            }]
                        });
                    }
                };
            });
            spyOn(eventLogService, 'getDataForUrl').and.callFake(function(){
                return {
                    then: function (callback) {

                        return callback({data: encounter});
                    }
                };
            });
            spyOn(offlineDbService, 'createEncounter').and.callThrough();
            spyOn(offlineDbService, 'insertMarker').and.callThrough();
            spyOn(offlineDbService, 'getAttributeTypes').and.callThrough();

            offlineSyncService.syncTransactionalData();

            expect(offlineDbService.getMarker).toHaveBeenCalled();
            expect(offlineDbService.getMarker.calls.count()).toBe(1);
            expect(eventLogService.getEventsFor).toHaveBeenCalledWith(202020, undefined);
            expect(eventLogService.getEventsFor.calls.count()).toBe(1);
            expect(eventLogService.getDataForUrl).toHaveBeenCalledWith('url to get encounter object');

            expect(offlineDbService.createEncounter).toHaveBeenCalledWith(encounter);

            expect(offlineDbService.insertMarker).toHaveBeenCalledWith('TransactionalData', 'eventuuid', 202020);
            expect(offlineDbService.insertMarker.calls.count()).toBe(1);
        });

        it('should insert log in case of error in response and should stop syncing further', function () {
            spyOn(offlineDbService, 'getMarker').and.callThrough();
            spyOn(eventLogService, 'getConceptEventsFor').and.callThrough();
            spyOn($rootScope, '$broadcast');
            spyOn(eventLogService, 'getDataForUrl').and.callFake(function(){
                return $http.get("some url");
            });
            spyOn(offlineDbService, 'insertLog').and.callThrough();
            httpBackend.expectGET("some url").respond(500, error_log.data);
            offlineSyncService.syncConcepts();
            httpBackend.flush();


            expect(offlineDbService.getMarker).toHaveBeenCalled();
            expect(offlineDbService.getMarker.calls.count()).toBe(1);
            expect(eventLogService.getConceptEventsFor).toHaveBeenCalledWith(undefined);
            expect(eventLogService.getConceptEventsFor.calls.count()).toBe(1);
            
            expect(offlineDbService.insertLog).toHaveBeenCalled();
            expect($rootScope.$broadcast).toHaveBeenCalledWith("schedulerStage", null, true);
        });
    });

    describe('subsequent sync ', function () {
        beforeEach(function () {
            module('bahmni.common.offline');
            module('bahmni.common.domain');
            module(function ($provide) {
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
                concept = {
                    uuid: 'dataUuid',
                    data: {},
                    parents: {"parentUuids" : []},
                    name: 'concept'
                };
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
                    },
                    insertConceptAndUpdateHierarchy: function () {
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
                    getConceptEventsFor: function () {
                        return {
                            then: function (callback) {
                                return callback({
                                    data: [{
                                        object: 'url to get concept object',
                                        category: 'offline-concepts',
                                        uuid: 'eventuuid'
                                    }]
                                });
                            }
                        };
                    },
                    getDataForUrl: function (url) {
                        return {
                            then: function (callback) {
                                if (url.contains("concept")) {
                                    return callback({data: concept});
                                }
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

        it('should read concept events from the last read uuid', function () {
            spyOn(offlineDbService, 'getMarker').and.callThrough();
            spyOn(eventLogService, 'getConceptEventsFor').and.callThrough();
            spyOn(eventLogService, 'getDataForUrl').and.callThrough();
            spyOn(offlineDbService, 'insertConceptAndUpdateHierarchy').and.callThrough();
            spyOn(offlineDbService, 'insertMarker').and.callThrough();

            offlineSyncService.syncConcepts();

            expect(offlineDbService.getMarker).toHaveBeenCalled();
            expect(offlineDbService.getMarker.calls.count()).toBe(1);
            expect(eventLogService.getConceptEventsFor).toHaveBeenCalledWith('lastReadUuid');
            expect(eventLogService.getConceptEventsFor.calls.count()).toBe(1);
            expect(eventLogService.getDataForUrl).toHaveBeenCalledWith('url to get concept object');
            expect(eventLogService.getDataForUrl.calls.count()).toBe(1);



            expect(offlineDbService.insertConceptAndUpdateHierarchy).toHaveBeenCalledWith({"results" : [concept]});
            expect(offlineDbService.insertConceptAndUpdateHierarchy.calls.count()).toBe(1);
            expect(offlineDbService.insertMarker).toHaveBeenCalledWith('ConceptData', 'eventuuid', null);
            expect(offlineDbService.insertMarker.calls.count()).toBe(1);
        });
    })
});