'use strict';

angular.module('bahmni.common.offline')
    .service('offlineSyncService', ['eventLogService', 'offlineDbService', '$q', 'offlineService', 'androidDbService',
        function (eventLogService, offlineDbService, $q, offlineService, androidDbService) {
            return function() {
                if (offlineService.isAndroidApp()) {
                    offlineDbService = androidDbService;
                }

                var sync = function () {
                   return offlineDbService.getMarker().then(function (marker) {
                        if (marker == undefined) {
                            marker = {
                                catchmentNumber: offlineService.getItem('catchmentNumber')
                            }
                        }
                       return syncForMarker(marker);
                    });
                };

                var syncForMarker = function (marker) {
                    eventLogService.getEventsFor(marker.catchmentNumber, marker.lastReadEventUuid).then(function (response) {
                        if (response.data == undefined || response.data.length == 0) {
                            return;
                        }
                        readEvent(response.data, 0);
                    });
                };

                var readEvent = function (events, index) {
                    if (events.length == index && events.length > 0) {
                        sync();
                        return;
                    }
                    if (events.length == index) {
                        return;
                    }
                    var event = events[index];
                    return eventLogService.getDataForUrl(Bahmni.Common.Constants.hostURL + event.object).then(function (response) {
                        return saveData(event, response).then(updateMarker(event).then(function () {
                            return readEvent(events, ++index);
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
                            deferrable.resolve();
                            break;
                        case 'addressHierarchy':
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
                    return offlineDbService.insertMarker(event.uuid, offlineService.getItem('catchmentNumber'));
                };

            return sync();
            }
        }
    ]);