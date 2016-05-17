'use strict';

angular.module('bahmni.common.offline')
    .service('offlineSyncService', ['eventLogService', 'offlineDbService', '$q', 'offlineService', 'androidDbService', '$rootScope',
        function (eventLogService, offlineDbService, $q, offlineService, androidDbService, $rootScope) {

                var stages;
                var sync = function () {
                    stages = 0;
                    if (offlineService.isAndroidApp()) {
                        offlineDbService = androidDbService;
                    }
                    return syncConcepts().then(function () {
                        return syncParentAddressEntries().then(function () {
                            return syncAddressHierarchyEntries().then(function () {
                                return syncTransactionalData();
                            });
                        })
                    });
                };

                var syncConcepts = function() {
                    return offlineDbService.getMarker("ConceptData").then(function (marker) {
                        if (marker == undefined) {
                            marker = {}
                        }
                        return syncConceptsForMarker(marker)
                    });
                };

                var syncTransactionalData = function() {
                    return offlineDbService.getMarker("TransactionalData").then(function (marker) {
                        if (marker == undefined) {
                            marker = {
                                catchmentNumber: offlineService.getItem('catchmentNumber')
                            }
                        }
                        return syncForMarker(marker)
                    });
                };

                var syncAddressHierarchyEntries = function (){
                    return offlineDbService.getMarker("AddressHierarchyData").then(function (marker) {
                        if(!marker) {
                            marker = {
                                catchmentNumber: offlineService.getItem('addressCatchmentNumber')
                            }
                        }
                        return syncAddressHierarchyForMarker(marker);
                    });
                };


                var syncParentAddressEntries = function() {
                    return offlineDbService.getMarker("ParentAddressHierarchyData").then(function (marker) {
                        if (!marker)
                            marker = {};
                        return syncAddressHierarchyForMarker(marker, 'parentAddressHierarchy');
                    });
                };

                var syncAddressHierarchyForMarker = function (marker, levels) {
                    return eventLogService.getAddressEventsFor(marker.catchmentNumber, marker.lastReadEventUuid).then(function (response) {
                        if (response.data == undefined || response.data.length == 0) {
                            endSync(stages++);
                            return;
                        }
                        return readEvent(response.data, 0, levels);
                    }, function () {
                        endSync(-1);
                    });
                };


                var syncConceptsForMarker = function (marker) {
                    return eventLogService.getConceptEventsFor(marker.lastReadEventUuid).then(function (response) {
                        if (response.data == undefined || response.data.length == 0) {
                            endSync(stages++);
                            return;
                        }
                        readEvent(response.data, 0);
                    }, function () {
                        endSync(-1);
                    });
                };


                var syncForMarker = function (marker) {
                    return eventLogService.getEventsFor(marker.catchmentNumber, marker.lastReadEventUuid).then(function (response) {
                        if (response.data == undefined || response.data.length == 0) {
                            endSync(stages++);
                            return;
                        }
                        return readEvent(response.data, 0);
                    }, function () {
                        endSync(-1);
                    });
                };


                var syncNextEvents = function(category){
                    switch (category) {
                        case 'patient':
                        case 'Encounter':
                                syncTransactionalData();
                                break;
                        case 'addressHierarchy':
                                syncAddressHierarchyEntries();
                                break;
                        case 'parentAddressHierarchy':
                                syncParentAddressEntries();
                                break;
                        case 'offline-concepts':
                                syncConcepts();
                                break;
                        default:
                            break;
                    }

                };

                var readEvent = function (events, index, category) {
                    if (events.length == index && events.length > 0) {
                        var group = category ? category : events[0].category;
                        syncNextEvents(group);
                        return;
                    }
                    if (events.length == index) {
                        return;
                    }
                    var event = events[index];
                    event.category = category ? category : event.category;
                    return eventLogService.getDataForUrl(Bahmni.Common.Constants.hostURL + event.object).then(function (response) {
                        return saveData(event, response).then(updateMarker(event).then(function () {
                            return readEvent(events, ++index, category);
                        }));
                    }).catch(function(response) {
                        if(parseInt(response.status / 100) == 4 || parseInt(response.status / 100) == 5) {
                            offlineDbService.insertLog(response.config.url, response.status, response.data);
                        }
                        $rootScope.$broadcast("schedulerStage", null, true);
                        endSync(-1);
                    });
                };

                var saveData = function (event, response) {
                    var deferrable = $q.defer();
                    switch (event.category) {
                        case 'patient':
                            offlineDbService.getAttributeTypes().then(function (attributeTypes) {
                                mapAttributesToPostFormat(response.data.person.attributes, attributeTypes);
                                offlineDbService.createPatient({patient: response.data}).then(function () {
                                    deferrable.resolve();
                                });
                            });
                            break;
                        case 'Encounter':
                            offlineDbService.insertEncounterData(response.data).then(function() {
                                if(response.data.visitUuid){
                                    eventLogService.getDataForUrl(Bahmni.Common.Constants.visitUrl + "/" + response.data.visitUuid).then(function(response) {
                                        offlineDbService.insertVisitData(response.data).then(function(){
                                            deferrable.resolve();
                                        })
                                    })
                                }else {
                                    deferrable.resolve();
                                }
                            });
                            break;
                        case 'offline-concepts':
                            offlineDbService.insertConceptAndUpdateHierarchy({"results": [response.data]});
                            break;
                        case 'addressHierarchy':
                        case 'parentAddressHierarchy':
                            offlineDbService.insertAddressHierarchy(response.data).then(function () {
                                deferrable.resolve();
                            });
                            break;
                        default:
                            deferrable.resolve();
                            break;
                    }
                    return deferrable.promise;
                };

                var mapAttributesToPostFormat = function (attributes, attributeTypes) {
                    angular.forEach(attributes, function (attribute) {
                        if (!attribute.voided) {
                            var foundAttribute = _.find(attributeTypes, function (attributeType) {
                                return attributeType.uuid === attribute.attributeType.uuid
                            });
                            if ("org.openmrs.Concept" === foundAttribute.format) {
                                var value = attribute.value;
                                attribute.value = value.display;
                                attribute.hydratedObject = value.uuid;
                            }
                        }
                        return;
                    });
                };

                var updateMarker = function (event) {
                    var markerName, catchmentNumber;
                    if (event.category == "parentAddressHierarchy") {
                        markerName = "ParentAddressHierarchyData";
                        catchmentNumber = null;
                    }else if (event.category == "addressHierarchy") {
                        markerName = "AddressHierarchyData";
                        catchmentNumber = offlineService.getItem("addressCatchmentNumber");
                    }else if (event.category == "offline-concepts") {
                        markerName = "ConceptData";
                        catchmentNumber = null;
                    }else{
                        markerName = "TransactionalData";
                        catchmentNumber = offlineService.getItem('catchmentNumber');
                    }
                    return offlineDbService.insertMarker(markerName, event.uuid, catchmentNumber);
                };

                var endSync = function (status) {
                      if (stages == 4 || status == -1){
                          $rootScope.$broadcast("schedulerStage", null);
                      }
                };

            return {
                sync: sync,
                syncTransactionalData: syncTransactionalData,
                syncAddressHierarchyEntries: syncAddressHierarchyEntries,
                syncParentAddressEntries: syncParentAddressEntries,
                syncConcepts: syncConcepts
            };
        }
    ]);