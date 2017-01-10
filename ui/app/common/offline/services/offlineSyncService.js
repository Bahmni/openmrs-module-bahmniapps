'use strict';

angular.module('bahmni.common.offline')
    .service('offlineSyncService', ['eventLogService', 'offlineDbService', '$q', 'offlineService', 'androidDbService', '$rootScope', 'loggingService',
        function (eventLogService, offlineDbService, $q, offlineService, androidDbService, $rootScope, loggingService) {
            var stages, categories;

            var initializeInitSyncInfo = function initializeCounters (categories) {
                $rootScope.initSyncInfo = {};
                $rootScope.showSyncInfo = true;
                _.map(categories, function (category) {
                    $rootScope.initSyncInfo[category] = {};
                    $rootScope.initSyncInfo[category].pendingEventsCount = 0;
                    $rootScope.initSyncInfo[category].savedEventsCount = 0;
                });
                $rootScope.initSyncInfo.savedEvents = 0;
            };

            var sync = function (isInitSync) {
                stages = 0;
                if (offlineService.isAndroidApp()) {
                    offlineDbService = androidDbService;
                }
                var promises = [];
                categories = offlineService.getItem("eventLogCategories");
                initializeInitSyncInfo(categories);
                _.map(categories, function (category) {
                    promises.push(syncForCategory(category, isInitSync));
                });
                return $q.all(promises);
            };

            var syncForCategory = function (category, isInitSync) {
                return offlineDbService.getMarker(category).then(function (marker) {
                    if (category == "transactionalData" && isInitSync) {
                        marker = angular.copy(marker);
                        marker.filters = offlineService.getItem("initSyncFilter");
                    }
                    return syncForMarker(category, marker, isInitSync);
                });
            };

            var updatePendingEventsCount = function updatePendingEventsCount (category, pendingEventsCount) {
                $rootScope.initSyncInfo[category].pendingEventsCount = pendingEventsCount;
                $rootScope.initSyncInfo.totalEvents = categories.reduce(function (count, category) {
                    return count + $rootScope.initSyncInfo[category].savedEventsCount + $rootScope.initSyncInfo[category].pendingEventsCount;
                }, 0);
            };

            var syncForMarker = function (category, marker, isInitSync) {
                return eventLogService.getEventsFor(category, marker).then(function (response) {
                    var events = response.data ? response.data["events"] : undefined;
                    updatePendingEventsCount(category, response.data.pendingEventsCount);
                    if (events == undefined || events.length == 0) {
                        endSync(stages++);
                        return;
                    }
                    return readEvent(events, 0, category, isInitSync);
                }, function () {
                    endSync(-1);
                    var deferrable = $q.defer();
                    deferrable.reject();
                    return deferrable.promise;
                });
            };

            var readEvent = function (events, index, category, isInitSync) {
                if (events.length == index && events.length > 0) {
                    return syncForCategory(category, isInitSync);
                }
                if (events.length == index) {
                    return;
                }
                var event = events[index];
                if (event.category == "SHREncounter") {
                    var uuid = event.object.match(Bahmni.Common.Constants.uuidRegex)[0];
                    event.object = Bahmni.Common.Constants.offlineBahmniEncounterUrl + uuid + "?includeAll=true";
                }
                return eventLogService.getDataForUrl(Bahmni.Common.Constants.hostURL + event.object)
                        .then(function (response) {
                            return saveData(event, response)
                                .then(function () {
                                    updateSavedEventsCount(category);
                                    return updateMarker(event, category);
                                })
                                .then(
                                    function (lastEvent) {
                                        offlineService.setItem("lastSyncTime", lastEvent.lastReadTime);
                                        return readEvent(events, ++index, category, isInitSync);
                                    });
                        }).catch(function (response) {
                            logSyncError(response);
                            $rootScope.$broadcast("schedulerStage", null, true);
                            endSync(-1);
                            var deferrable = $q.defer();
                            deferrable.reject();
                            return deferrable.promise;
                        });
            };

            var logSyncError = function (response) {
                if (response && (parseInt(response.status / 100) == 4 || parseInt(response.status / 100) == 5)) {
                    loggingService.logSyncError(response.config.url, response.status, response.data);
                }
            };

            var mapIdentifiers = function (identifiers) {
                var deferred = $q.defer();
                return offlineDbService.getReferenceData("IdentifierTypes").then(function (identifierTypesData) {
                    var identifierTypes = identifierTypesData.data;
                    angular.forEach(identifiers, function (identifier) {
                        var matchedIdentifierType = _.find(identifierTypes, {'uuid': identifier.identifierType.uuid});
                        identifier.identifierType.primary = matchedIdentifierType.primary || false;
                    });
                    var extraIdentifiersForSearch = {};
                    var extraIdentifiers = _.filter(identifiers, {'identifierType': {'primary': false}});
                    var primaryIdentifier = _.filter(identifiers, {'identifierType': {'primary': true}})[0];
                    angular.forEach(extraIdentifiers, function (extraIdentifier) {
                        var name = extraIdentifier.identifierType.display || extraIdentifier.identifierType.name;
                        extraIdentifiersForSearch[name] = extraIdentifier.identifier;
                    });
                    angular.forEach(identifiers, function (identifier) {
                        identifier.primaryIdentifier = primaryIdentifier.identifier;
                        identifier.extraIdentifiers = !_.isEmpty(extraIdentifiersForSearch) ? extraIdentifiersForSearch : undefined;
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
                        });
                    });
                    break;
                case 'Encounter':
                case 'SHREncounter':
                    offlineDbService.createEncounter(response.data).then(function () {
                        deferrable.resolve();
                    });
                    break;
                case 'LabOrderResults':
                    var patientUuid = event.object.match(Bahmni.Common.Constants.uuidRegex)[0];
                    offlineDbService.insertLabOrderResults(patientUuid, response.data).then(function () {
                        deferrable.resolve();
                    });
                    break;

                case 'offline-concepts':
                    offlineDbService.insertConceptAndUpdateHierarchy({"results": [response.data]}).then(function () {
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
                            return attributeType.uuid === attribute.attributeType.uuid;
                        });
                        if (foundAttribute.format === "org.openmrs.Concept") {
                            var value = attribute.value;
                            attribute.value = value.display;
                            attribute.hydratedObject = value.uuid;
                        }
                    }
                    return;
                });
            };

            var updateMarker = function (event, category) {
                return offlineDbService.getMarker(category).then(function (marker) {
                    return offlineDbService.insertMarker(marker.markerName, event.uuid, marker.filters);
                });
            };

            var updateSavedEventsCount = function (category) {
                $rootScope.initSyncInfo[category].savedEventsCount++;
                $rootScope.initSyncInfo[category].pendingEventsCount--;
                $rootScope.initSyncInfo.savedEvents++;
            };

            var endSync = function (status) {
                if (stages == categories.length || status == -1) {
                    $rootScope.$broadcast("schedulerStage", null);
                }
            };

            return {
                sync: sync
            };
        }
    ]);
