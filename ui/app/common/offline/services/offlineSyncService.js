'use strict';

angular.module('bahmni.common.offline')
    .service('offlineSyncService', ['eventLogService', 'offlineDbService', '$q', 'offlineService', 'androidDbService', '$rootScope','loggingService',
        function (eventLogService, offlineDbService, $q, offlineService, androidDbService, $rootScope,loggingService) {

                var stages;
                var sync = function () {
                    stages = 0;
                    if (offlineService.isAndroidApp()) {
                        offlineDbService = androidDbService;
                    }
                    var promises = [];
                    var categories = offlineService.getItem("eventLogCategories");
                    _.map(categories,function(category){
                        promises.push(syncForCategory(category))
                    });
                    return $q.all(promises);
                };


                var syncForCategory = function(category){
                    return offlineDbService.getMarker(category).then(function(marker){
                      return syncForMarker(category, marker);
                    });
                };


                var syncForMarker = function (category, marker) {
                    return eventLogService.getEventsFor(category, marker).then(function (response) {
                        if (response.data == undefined || response.data.length == 0) {
                            endSync(stages++);
                            return;
                        }
                        return readEvent(response.data, 0, category);
                    }, function () {
                        endSync(-1);
                        var deferrable = $q.defer();
                        deferrable.reject();
                        return deferrable.promise;
                    });
                };

                var readEvent = function (events, index, category) {
                    if (events.length == index && events.length > 0) {
                        return syncForCategory(category);
                    }
                    if (events.length == index) {
                        return;
                    }
                    var event = events[index];
                    if(event.category == "SHREncounter") {
                        var uuid = event.object.match(Bahmni.Common.Constants.uuidRegex)[0];
                        event.object = Bahmni.Common.Constants.offlineBahmniEncounterUrl + uuid + "?includeAll=true";
                    }
                    return eventLogService.getDataForUrl(Bahmni.Common.Constants.hostURL + event.object)
                        .then(function (response) {
                            return saveData(event, response)
                                .then(function() {
                                        return updateMarker(event,category)})
                                .then(
                                    function(lastEvent) {
                                        offlineService.setItem("lastSyncTime", lastEvent.lastReadTime);
                                        return readEvent(events, ++index, category)
                                    });
                    }).catch(function(response) {
                        if(parseInt(response.status / 100) == 4 || parseInt(response.status / 100) == 5) {
                            loggingService.logSyncError(response.config.url, response.status, response.data);
                        }
                        $rootScope.$broadcast("schedulerStage", null, true);
                        endSync(-1);
                        var deferrable = $q.defer();
                        deferrable.reject();
                        return deferrable.promise;
                    });
                };

            var mapIdentifiers = function (identifiers) {
                var deferred = $q.defer();
                return offlineDbService.getReferenceData("IdentifierTypes").then(function (identifierTypesData) {
                    var identifierTypes = identifierTypesData.data;
                    angular.forEach(identifiers, function (identifier) {
                        var matchedIdentifierType = _.find(identifierTypes, {'uuid': identifier.identifierType.uuid});
                        identifier.identifierType.primary = matchedIdentifierType.primary || false;
                    });
                    deferred.resolve({data: identifiers});
                    return deferred.promise;
                });
            };

            var saveData = function (event, response) {
                    var deferrable = $q.defer();
                    switch (event.category) {
                        case 'patient':
                            offlineDbService.getAttributeTypes().then(function (attributeTypes) {
                                mapAttributesToPostFormat(response.data.person.attributes, attributeTypes);
                                mapIdentifiers(response.data.identifiers).then(function () {
                                    offlineDbService.createPatient({patient: response.data}).then(function () {
                                        deferrable.resolve();
                                    });
                                })
                            });
                            break;
                        case 'Encounter':
                        case 'SHREncounter':
                            offlineDbService.createEncounter(response.data).then(function () {
                                deferrable.resolve();
                            });
                            break;
                        case 'offline-concepts':
                            offlineDbService.insertConceptAndUpdateHierarchy({"results": [response.data]}).then(function(){
                                deferrable.resolve();
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

                var updateMarker = function (event, category) {
                   return offlineDbService.getMarker(category).then(function(marker) {
                        return offlineDbService.insertMarker(marker.markerName, event.uuid, marker.filters);
                    });
                };

                var endSync = function (status) {
                      if (stages == 4 || status == -1){
                          $rootScope.$broadcast("schedulerStage", null);
                      }
                };

            return {
                sync: sync
            };
        }
    ]);