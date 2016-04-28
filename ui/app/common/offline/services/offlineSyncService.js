'use strict';

angular.module('bahmni.common.offline')
    .service('offlineSyncService', ['eventLogService', 'offlineDbService', '$q', 'offlineService', 'androidDbService',
        function (eventLogService, offlineDbService, $q, offlineService, androidDbService) {

                var sync = function () {
                    if (offlineService.isAndroidApp()) {
                        offlineDbService = androidDbService;
                    }
                    return syncParentAddressEntries().then(function(){
                        return syncAddressHierarchyEntries().then(function(){
                            return  syncTransactionalData();
                        });
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
                            return;
                        }
                        return readEvent(response.data, 0, levels);
                    });
                };


                var syncForMarker = function (marker) {
                    return eventLogService.getEventsFor(marker.catchmentNumber, marker.lastReadEventUuid).then(function (response) {
                        if (response.data == undefined || response.data.length == 0) {
                            return;
                        }
                        return readEvent(response.data, 0);
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
                    });
                };

                var saveData = function (event, response) {
                    var deferrable = $q.defer();
                    switch (event.category) {
                        case 'patient':
                            offlineDbService.getAttributeTypes().then(function(attributeTypes) {
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

                var mapAttributesToPostFormat = function(attributes, attributeTypes){
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
                    }else{
                        markerName = "TransactionalData";
                        catchmentNumber = offlineService.getItem('catchmentNumber');
                    }
                    return offlineDbService.insertMarker(markerName, event.uuid, catchmentNumber);
                };

            return {
                sync: sync,
                syncTransactionalData: syncTransactionalData,
                syncAddressHierarchyEntries: syncAddressHierarchyEntries,
                syncParentAddressEntries: syncParentAddressEntries
            };
        }
    ]);