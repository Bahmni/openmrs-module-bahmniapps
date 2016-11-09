'use strict';

var $scope, offlineDbService, eventLogService, offlineSyncService, offlineService, configurationService,loggingService;

describe('OfflineSyncService', function () {
    var patient, mappedPatient, encounter, concept, error_log, labOrderResults;
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
                    },
                    identifiers: [
                        {
                            "display": "Bahmni Id = GAN200076",
                            "uuid": "9cc96aeb-2877-4340-b9fd-abba016a84a3",
                            "identifier": "GAN200076",
                            "identifierSourceUuid": "81f27b48-8792-11e5-ade6-005056b07f03",
                            "identifierType": {
                                "uuid": "81433852-3f10-11e4-adec-0800271c1b75"
                            },
                            "voided": false
                        },
                        {
                            "uuid": "99996aeb-2877-4340-b9fd-abba016a84a3",
                            "identifier": "SecodaryIdentifier",
                            "identifierSourceUuid": "99997b48-8792-11e5-ade6-005056b07f03",
                            "identifierType": {
                                "uuid": "99993852-3f10-11e4-adec-0800271c1b75",
                                "display": "Bahmni Sec Id"
                            },
                            "voided": false
                        }
                    ]
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
                labOrderResults = { results: {"results":[],"tabularResult":{"dates":[],"orders":[],"values":[]}}};
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
                    insertLabOrderResults: function () {
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
                    getReferenceData: function () {
                        return {
                            then: function (callback) {
                                return callback({
                                    data: [
                                        {
                                            uuid: "81433852-3f10-11e4-adec-0800271c1b75",
                                            primary: true
                                        },
                                        {
                                            uuid: "99993852-3f10-11e4-adec-0800271c1b75",
                                            primary: false
                                        }
                                    ]
                                });
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
                    getMarker: function (category) {
                        return {
                            then: function (callback) {
                                return callback({markerName: category, filters: [202020]});
                            }
                        }
                    },
                    insertMarker: function () {
                        return {
                            then: function (callback) {
                                return callback({lastReadTime: new Date()});
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
                    getEventsFor: function (category) {
                        return {
                            then: function (callback) {
                                var event = {
                                    object: 'url to get ' + category + ' object',
                                    category: category,
                                    uuid: 'eventuuid'
                                };
                                return callback({

                                    data: { events:[event] , pendingEventsCount:2 }
                                });
                            }
                        };
                    },

                    getDataForUrl: function (url) {
                        return {
                            then: function (callback) {
                                if (_.includes(url,"concept")) {
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
                        return [202020];
                    },
                    setItem: function() {}
                });

                $provide.value('loggingService', {
                    logSyncError: function(errorUrl, status, stackTrace, payload) {
                        return {};
                    }
                });
            });
        });

        beforeEach(inject(['offlineSyncService', 'eventLogService', 'offlineDbService', 'configurationService', '$httpBackend', '$http', '$rootScope','loggingService','offlineService',
            function (offlineSyncServiceInjected, eventLogServiceInjected, offlineDbServiceInjected, configurationServiceInjected, _$httpBackend_, http, rootScope, loggingServiceInjected,offlineServiceInjected) {
            offlineSyncService = offlineSyncServiceInjected;
            eventLogService = eventLogServiceInjected;
            offlineDbService = offlineDbServiceInjected;
            configurationService = configurationServiceInjected;
            loggingService = loggingServiceInjected;
            offlineService = offlineServiceInjected;
            httpBackend = _$httpBackend_;
            $http = http;
            $rootScope = rootScope;
        }]));

        it('should read the meta data events from the beginning for each category', function() {
            var categories = [
                'addressHierarchy',
                'parentAddressHierarchy',
                'offline-concepts'
            ];

            spyOn(offlineService, 'getItem').and.returnValue(categories);
            spyOn(offlineDbService, 'getMarker').and.callThrough();
            spyOn(eventLogService, 'getEventsFor').and.callThrough();
            spyOn(eventLogService, 'getDataForUrl').and.callFake(function (url) {
                return {
                    then: function (callback) {
                        return callback({data: {uuid: url}});
                    }
                };
            });
            spyOn(offlineDbService, 'insertMarker').and.callFake(function(){ return {
                then: function (callback) {
                    return callback;
                }
            }
            });
            spyOn(offlineDbService, 'insertAddressHierarchy').and.callThrough();
            spyOn(offlineDbService, 'insertConceptAndUpdateHierarchy').and.callThrough();

            offlineSyncService.sync();
            $rootScope.$digest();

            expect(offlineDbService.getMarker.calls.count()).toBe(categories.length * 2);

            categories.forEach(function (category) {
                expect(offlineDbService.getMarker).toHaveBeenCalledWith(category);
                expect(eventLogService.getEventsFor).toHaveBeenCalledWith(category, {
                    markerName: category,
                    filters: [202020]
                });
                var url = 'url to get ' + category + ' object';
                expect(eventLogService.getDataForUrl).toHaveBeenCalledWith(url);
                expect(offlineDbService.insertMarker).toHaveBeenCalledWith(category, "eventuuid", [202020]);
                expect(offlineDbService.insertMarker.calls.count()).toBe(3);
                expect($rootScope.initSyncInfo[category].savedEventsCount).toBe(1);
            });

            expect(offlineDbService.insertAddressHierarchy).toHaveBeenCalledWith({uuid: 'url to get addressHierarchy object'});
            expect(offlineDbService.insertConceptAndUpdateHierarchy).toHaveBeenCalledWith({results:[{uuid: 'url to get offline-concepts object'}]});
            expect(offlineDbService.insertAddressHierarchy).toHaveBeenCalledWith({uuid: 'url to get parentAddressHierarchy object'});
            expect(offlineDbService.insertAddressHierarchy.calls.count()).toBe(2);
        });

        it('should read the transactional events from the beginning for each category', function () {
            var categories = [
                'transactionalData'
            ];
            var patientEvent = {
                object: 'patientUrl',
                category: 'patient',
                uuid: 'uuid1'
            };

            var encounterEvent = {
                object: 'encounterUrl',
                category: 'Encounter',
                uuid: 'uuid2'
            };

            var labOrderResultsEvent = {
                object: '/openmrs/ws/rest/v1/bahmnicore/labOrderResults?patientUuid=5e94e7cb-e9fe-4763-e9ea-217bdaa85029',
                category: 'LabOrderResults',
                uuid: 'uuid3'
            };

            var marker = {markerName: 'transactionalData', filters: [202020]};

            spyOn(offlineService, 'getItem').and.returnValue(categories);
            spyOn(offlineService, 'setItem').and.callThrough();
            spyOn(offlineDbService, 'getMarker').and.callThrough(function(){ return {
                then: function () {
                    return marker;
                }
            }
            });
            spyOn(eventLogService, 'getEventsFor').and.callFake(function (category) {
                return {
                    then: function (callback) {
                        if(!marker.lastReadEventUuid)
                        return callback({
                            data: { events:[patientEvent, encounterEvent, labOrderResultsEvent], pendingEventsCount: 3}
                        });
                    }
                }
            });
            spyOn(eventLogService, 'getDataForUrl').and.callFake(function (url) {
                return {
                    then: function (callback) {
                        return callback({data: url === patientEvent.object ? patient : url === encounterEvent.object ? encounter : labOrderResults});
                    }
                };
            });
            spyOn(offlineDbService, 'insertMarker').and.callFake(function(name,uuid,filters){
                marker.lastReadEventUuid = uuid;
                return {lastReadTime: new Date()}
            });
            spyOn(offlineDbService, 'insertAddressHierarchy').and.callThrough();
            spyOn(offlineDbService, 'createPatient').and.callThrough();
            spyOn(offlineDbService, 'createEncounter').and.callThrough();
            spyOn(offlineDbService, 'insertLabOrderResults').and.callThrough();

            offlineSyncService.sync();
            $rootScope.$digest();

            expect(offlineDbService.getMarker.calls.count()).toBe(5);

            categories.forEach(function (category) {
                expect(offlineDbService.getMarker).toHaveBeenCalledWith(category);
                expect(eventLogService.getEventsFor).toHaveBeenCalledWith(category, {
                    markerName: category,
                    filters: [202020]
                });

                expect(offlineDbService.insertMarker).toHaveBeenCalledWith(category, "uuid1", [202020]);
                expect(offlineDbService.insertMarker).toHaveBeenCalledWith(category, "uuid2", [202020]);
                expect(offlineDbService.insertMarker).toHaveBeenCalledWith(category, "uuid3", [202020]);
                expect(offlineDbService.insertMarker.calls.count()).toBe(3);
            });
            expect(eventLogService.getDataForUrl).toHaveBeenCalledWith(patientEvent.object);
            expect(eventLogService.getDataForUrl).toHaveBeenCalledWith(encounterEvent.object);
            expect(offlineDbService.createPatient).toHaveBeenCalledWith({patient:patient});
            expect(offlineDbService.createEncounter).toHaveBeenCalledWith(encounter);
            expect(offlineDbService.insertLabOrderResults).toHaveBeenCalledWith('5e94e7cb-e9fe-4763-e9ea-217bdaa85029',labOrderResults);
            expect(offlineDbService.insertAddressHierarchy.calls.count()).toBe(0);
        });


        it('should insert log in case of error in response and should stop syncing further', function () {
            var categories = [
                'offline-concepts'
            ];

            spyOn(offlineService, 'getItem').and.returnValue(categories);
            spyOn(offlineDbService, 'getMarker').and.callThrough();
            spyOn(eventLogService, 'getEventsFor').and.callThrough();

            spyOn($rootScope, '$broadcast');
            spyOn(eventLogService, 'getDataForUrl').and.callFake(function(){
                return $http.get("some url");
            });
            spyOn(loggingService, 'logSyncError').and.callThrough();
            httpBackend.expectGET("some url").respond(500, error_log.data);
            offlineSyncService.sync();
            httpBackend.flush();
            $rootScope.$digest();


            expect(offlineDbService.getMarker).toHaveBeenCalled();
            expect(offlineDbService.getMarker.calls.count()).toBe(1);
            expect(eventLogService.getEventsFor).toHaveBeenCalledWith('offline-concepts',{
                markerName: 'offline-concepts',
                filters: [202020]
            });
            expect(eventLogService.getEventsFor.calls.count()).toBe(1);

            expect(loggingService.logSyncError).toHaveBeenCalled();
            expect($rootScope.$broadcast).toHaveBeenCalledWith("schedulerStage", null, true);
        });
    });

    describe('subsequent sync ', function () {
        var $rootScope;
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
                    },
                    identifiers: [
                        {
                            "display": "Bahmni Id = GAN200076",
                            "uuid": "9cc96aeb-2877-4340-b9fd-abba016a84a3",
                            "identifier": "GAN200076",
                            "identifierSourceUuid": "81f27b48-8792-11e5-ade6-005056b07f03",
                            "identifierType": {
                                "uuid": "81433852-3f10-11e4-adec-0800271c1b75"
                            },
                            "voided": false
                        },
                        {
                            "uuid": "99996aeb-2877-4340-b9fd-abba016a84a3",
                            "identifier": "SecodaryIdentifier",
                            "identifierSourceUuid": "99997b48-8792-11e5-ade6-005056b07f03",
                            "identifierType": {
                                "uuid": "99993852-3f10-11e4-adec-0800271c1b75",
                                "display": "Bahmni Sec Id"
                            },
                            "voided": false
                        }
                    ]
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
                    getMarker: function (category) {
                        return {
                            then: function (callback) {
                                return callback({markerName: category, lastReadEventUuid: 'lastReadUuid', filters: [202020]});
                            }
                        }
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
                    },
                    getReferenceData: function () {
                        return {
                            then: function (callback) {
                                return callback({
                                    data: [
                                        {
                                            uuid: "81433852-3f10-11e4-adec-0800271c1b75",
                                            primary: true
                                        }, {
                                            uuid: "99993852-3f10-11e4-adec-0800271c1b75",
                                            primary: false
                                        }
                                    ]
                                });
                            }
                        };
                    }
                });
                $provide.value('eventLogService', {
                    getEventsFor: function (category) {
                        return {
                            then: function (callback) {
                                var event = {
                                    object: 'url to get ' + category + ' object',
                                    category: category,
                                    uuid: 'eventuuid'
                                };
                                return callback({
                                    data: { events:[event] , pendingEventsCount:1 }
                                });
                            }
                        };
                    },getAddressEventsFor: function () {
                        return {
                            then: function (callback) {
                                var event = {
                                    object: 'url to get address object',
                                    category: 'addressHierarchy',
                                    uuid: 'eventuuid'
                                };
                                return callback({
                                    data: { events:[event] , pendingEventsCount:1 }
                                });
                            }
                        };
                    },
                    getConceptEventsFor: function () {
                        return {
                            then: function (callback) {
                                var conceptEvent = {
                                    object: 'url to get concept object',
                                    category: 'offline-concepts',
                                    uuid: 'eventuuid'
                                };
                                return callback({
                                    data: { events:[conceptEvent] , pendingEventsCount:1 }
                                });
                            }
                        };
                    },
                    getDataForUrl: function (url) {
                        return {
                            then: function (callback) {
                                if (_.includes(url, "concept")) {
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
                        return [202020];
                    },
                    setItem: function() {}

                });

                $provide.value('loggingService', {
                    logSyncError: function(errorUrl, status, stackTrace, payload) {
                        return {};
                    }
                });
            });
        });

        beforeEach(inject(['offlineSyncService', 'eventLogService', 'offlineDbService', 'configurationService', '$rootScope', 'loggingService','offlineService',
            function (offlineSyncServiceInjected, eventLogServiceInjected, offlineDbServiceInjected, configurationServiceInjected, rootScope, loggingServiceInjected, offlineServiceInjected) {
            offlineSyncService = offlineSyncServiceInjected;
            eventLogService = eventLogServiceInjected;
            offlineDbService = offlineDbServiceInjected;
            configurationService = configurationServiceInjected;
            loggingService = loggingServiceInjected;
            offlineService = offlineServiceInjected;
            $rootScope = rootScope;
        }]));


        it('should read parent events from the last read uuid', function () {

            var categories = [
                'addressHierarchy',
                'parentAddressHierarchy',
                'offline-concepts'
            ];

            spyOn(offlineService, 'getItem').and.returnValue(categories);
            spyOn(offlineDbService, 'getMarker').and.callThrough();
            spyOn(eventLogService, 'getEventsFor').and.callThrough();
            spyOn(eventLogService, 'getDataForUrl').and.callFake(function (url) {
                return {
                    then: function (callback) {
                        return callback({data: {uuid: url}});
                    }
                };
            });
            spyOn(offlineDbService, 'insertMarker').and.callFake(function(){ return {
                then: function (callback) {
                    return callback;
                }
            }
            });
            spyOn(offlineDbService, 'insertAddressHierarchy').and.callThrough();
            spyOn(offlineDbService, 'insertConceptAndUpdateHierarchy').and.callThrough();

            offlineSyncService.sync();
            $rootScope.$digest();

            categories.forEach(function (category) {
                expect(offlineDbService.getMarker).toHaveBeenCalledWith(category);
                expect(eventLogService.getEventsFor).toHaveBeenCalledWith(category, {
                    markerName: category,
                    lastReadEventUuid : 'lastReadUuid',
                    filters: [202020]
                });
                var url = 'url to get ' + category + ' object';
                expect(eventLogService.getDataForUrl).toHaveBeenCalledWith(url);
                expect(offlineDbService.insertMarker).toHaveBeenCalledWith(category, "eventuuid", [202020]);
                expect(offlineDbService.insertMarker.calls.count()).toBe(3);
            });

            expect(offlineDbService.insertAddressHierarchy).toHaveBeenCalledWith({uuid: 'url to get addressHierarchy object'});
            expect(offlineDbService.insertConceptAndUpdateHierarchy).toHaveBeenCalledWith({results:[{uuid: 'url to get offline-concepts object'}]});
            expect(offlineDbService.insertAddressHierarchy).toHaveBeenCalledWith({uuid: 'url to get parentAddressHierarchy object'});
            expect(offlineDbService.insertAddressHierarchy.calls.count()).toBe(2);


            expect(offlineDbService.getMarker).toHaveBeenCalled();
            expect(offlineDbService.getMarker.calls.count()).toBe(6);
        });



        it('should read patient events from the last read uuid for the catchment', function () {
            var categories = [
                'transactionalData'
            ];
            var patientEvent = {
                object: 'patientUrl',
                category: 'patient',
                uuid: 'uuid1'
            };

            var encounterEvent = {
                object: 'encounterUrl',
                category: 'Encounter',
                uuid: 'uuid2'
            };

            var labOrderResultsEvent = {
                object: '/openmrs/ws/rest/v1/bahmnicore/labOrderResults?patientUuid=5e94e7cb-e9fe-4763-e9ea-217bdaa85029',
                category: 'LabOrderResults',
                uuid: 'uuid3'
            };

            var marker = {markerName: 'transactionalData', filters: [202020]};

            spyOn(offlineService, 'getItem').and.returnValue(categories);
            spyOn(offlineService, 'setItem').and.callThrough();
            spyOn(offlineDbService, 'getMarker').and.callThrough(function(){ return {
                then: function () {
                    return marker;
                }
            }
            });
            spyOn(eventLogService, 'getEventsFor').and.callFake(function (category) {
                return {
                    then: function (callback) {
                        if(!marker.lastReadEventUuid)
                            return callback({
                                data: { events:[patientEvent] , pendingEventsCount:1 }
                            });
                    }
                }
            });
            spyOn(eventLogService, 'getDataForUrl').and.callFake(function (url) {
                return {
                    then: function (callback) {
                        return callback({data: patient});
                    }
                };
            });
            spyOn(offlineDbService, 'insertMarker').and.callFake(function(name,uuid,filters){
                marker.lastReadEventUuid = uuid;
                return {lastReadTime: new Date()}
            });
            spyOn(offlineDbService, 'insertAddressHierarchy').and.callThrough();
            spyOn(offlineDbService, 'createPatient').and.callThrough();

            offlineSyncService.sync();
            $rootScope.$digest();

            expect(offlineDbService.getMarker.calls.count()).toBe(3 );

            categories.forEach(function (category) {
                expect(offlineDbService.getMarker).toHaveBeenCalledWith(category);
                expect(eventLogService.getEventsFor).toHaveBeenCalledWith(category, {
                    markerName: category,
                    lastReadEventUuid : 'lastReadUuid',
                    filters: [202020]
                });
                expect(eventLogService.getEventsFor.calls.count()).toBe(2);

                expect(offlineDbService.insertMarker).toHaveBeenCalledWith(category, "uuid1", [202020]);
                expect(offlineDbService.insertMarker.calls.count()).toBe(1);
            });
            expect(eventLogService.getDataForUrl).toHaveBeenCalledWith(patientEvent.object);
            expect(eventLogService.getDataForUrl.calls.count()).toBe(1);
            expect(offlineDbService.createPatient).toHaveBeenCalledWith({patient:patient});
            expect(offlineDbService.insertAddressHierarchy.calls.count()).toBe(0);
        });

        it('should map patient identifiers data to contain identifierType primary', function () {
            var categories = [
                'transactionalData'
            ];
            var patientEvent = {
                object: 'patientUrl',
                category: 'patient',
                uuid: 'uuid1'
            };

            var marker = {markerName: 'transactionalData', filters: [202020]};

            spyOn(offlineService, 'getItem').and.returnValue(categories);
            spyOn(offlineService, 'setItem').and.callThrough();
            spyOn(offlineDbService, 'getMarker').and.callThrough(function () {
                return {
                    then: function () {
                        return marker;
                    }
                }
            });
            spyOn(eventLogService, 'getEventsFor').and.callFake(function (category) {
                return {
                    then: function (callback) {
                        if (!marker.lastReadEventUuid)
                            return callback({
                                data: { events:[patientEvent] , pendingEventsCount:1 }
                            });
                    }
                }
            });
            spyOn(offlineDbService, 'createPatient').and.callThrough();

            offlineSyncService.sync();
            $rootScope.$digest();

            expect(patient.identifiers[0].identifierType.primary).not.toBeUndefined();
            expect(patient.identifiers[0].identifierType.primary).toBeTruthy();
            expect(patient.identifiers[1].identifierType.primary).not.toBeUndefined();
            expect(patient.identifiers[1].identifierType.primary).toBeFalsy();
        });
    });
});
