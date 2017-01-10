'use strict';

angular.module('bahmni.common.domain')
    .service('encounterService', ['$q', '$rootScope', '$bahmniCookieStore', 'offlineEncounterServiceStrategy', 'eventQueue', 'offlineService', 'offlineDbService', 'androidDbService',
        function ($q, $rootScope, $bahmniCookieStore, offlineEncounterServiceStrategy, eventQueue, offlineService, offlineDbService, androidDbService) {
            var offlineEncounterService = offlineEncounterServiceStrategy;
            if (offlineService.isOfflineApp()) {
                if (offlineService.isAndroidApp()) {
                    offlineDbService = androidDbService;
                }
            }
            this.buildEncounter = function (encounter) {
                encounter.observations = encounter.observations || [];
                encounter.providers = encounter.providers || [];

                var providerData = $bahmniCookieStore.get(Bahmni.Common.Constants.grantProviderAccessDataCookieName);
                if (_.isEmpty(encounter.providers)) {
                    if (providerData && providerData.uuid) {
                        encounter.providers.push({"uuid": providerData.uuid});
                    } else if ($rootScope.currentProvider && $rootScope.currentProvider.uuid) {
                        encounter.providers.push($rootScope.currentProvider);
                    }
                }
                encounter.observations.forEach(function (obs) {
                    obs.uuid = obs.uuid || Bahmni.Common.Offline.UUID.generateUuid();
                    obs.encounterUuid = encounter.encounterUuid;
                    obs.encounterDateTime = encounter.encounterDateTime;
                    obs.observationDateTime = encounter.observationDateTime || new Date();
                    obs.providers = encounter.providers;
                    obs.creatorName = encounter.creatorName;
                    stripExtraInfo(obs);
                });
                return encounter;
            };

            var getDefaultEncounterType = function () {
                var deferred = $q.defer();
                offlineEncounterService.getDefaultEncounterType().then(function (response) {
                    deferred.resolve(response);
                });
                return deferred.promise;
            };

            var getEncounterTypeBasedOnLoginLocation = function () {
                return offlineEncounterService.getEncounterTypeBasedOnLoginLocation();
            };

            var getEncounterTypeBasedOnProgramUuid = function (programUuid) {
                return offlineEncounterService.getEncounterTypeBasedOnProgramUuid();
            };

            var getDefaultEncounterTypeIfMappingNotFound = function (mapping) {
                var encounterType = mapping;
                if (_.isEmpty(encounterType)) {
                    encounterType = getDefaultEncounterType();
                }
                return encounterType;
            };

            this.getEncounterType = function (programUuid, loginLocationUuid) {
                if (programUuid) {
                    return getEncounterTypeBasedOnProgramUuid(programUuid).then(function (response) {
                        return getDefaultEncounterTypeIfMappingNotFound(response);
                    });
                } else if (loginLocationUuid) {
                    return getEncounterTypeBasedOnLoginLocation().then(function (response) {
                        return getDefaultEncounterTypeIfMappingNotFound(response.data);
                    });
                } else {
                    return getDefaultEncounterType();
                }
            };

            this.create = function (encounterData) {
                encounterData.encounterUuid = encounterData.encounterUuid || Bahmni.Common.Offline.UUID.generateUuid();
                encounterData.visitUuid = encounterData.visitUuid || null;
                encounterData.encounterDateTime = encounterData.encounterDateTime || Bahmni.Common.Util.DateUtil.now();
                encounterData.visitType = encounterData.visitType || 'Field';
                encounterData.encounterTypeUuid = null;
                this.buildEncounter(encounterData);
                return getDefaultEncounterType().then(function (encounterType) {
                    encounterData.encounterType = encounterData.encounterType || encounterType.data;
                    return encounterData;
                }).then(function (encounterData) {
                    return offlineEncounterService.create(encounterData);
                }).then(function (result) {
                    var event = {type: "encounter", encounterUuid: result.data.encounterUuid, dbName: offlineDbService.getCurrentDbName() };
                    eventQueue.addToEventQueue(event);
                    return $q.when({data: encounterData});
                });
            };

            this.delete = function (encounterUuid, reason) {
                return offlineEncounterService.delete(encounterUuid, reason);
            };

            var stripExtraInfo = function (obs) {
                delete obs.isObservation;
                delete obs.isObservationNode;
                obs.concept = {uuid: obs.concept.uuid, name: obs.concept.name, dataType: obs.concept.dataType};
                obs.groupMembers = obs.groupMembers || [];
                obs.groupMembers.forEach(function (groupMember) {
                    groupMember.uuid = groupMember.uuid || Bahmni.Common.Offline.UUID.generateUuid();
                    groupMember.encounterDateTime = obs.encounterDateTime;
                    groupMember.observationDateTime = obs.observationDateTime;
                    groupMember.providers = obs.providers;
                    groupMember.creatorName = obs.creatorName;
                    stripExtraInfo(groupMember);
                });
            };

            var searchWithoutEncounterDate = function (visitUuid) {
                return $q.when({"data": {"results": []}});
            };

            this.search = function (visitUuid, encounterDate) {
                return offlineEncounterService.search(visitUuid, encounterDate);
            };

            this.find = function (params) {
                return offlineEncounterService.find(params).then(function (results) {
                    if (results && results.encounter) {
                        return {data: results.encounter};
                    } else {
                        return {"data": {
                            "bahmniDiagnoses": [],
                            "observations": [],
                            "accessionNotes": [],
                            "encounterType": null,
                            "visitType": null,
                            "patientId": null,
                            "reason": null,
                            "orders": [],
                            "providers": [],
                            "drugOrders": [],
                            "patientProgramUuid": null,
                            "visitUuid": null,
                            "patientUuid": null,
                            "encounterDateTime": null,
                            "associatedToPatientProgram": false,
                            "encounterUuid": null,
                            "visitTypeUuid": null,
                            "encounterTypeUuid": null,
                            "locationUuid": null,
                            "disposition": null,
                            "locationName": null,
                            "context": {},
                            "extensions": {}
                        }}; }
                });
            };

            this.findByEncounterUuid = function (encounterUuid) {
                return $q.when({"data": {"results": []}});
            };

            this.getEncountersForEncounterType = function (patientUuid, encounterTypeUuid) {
                return $q.when({"data": {"results": []}});
            };

            this.getDigitized = function (patientUuid) {
                return $q.when({"data": {"results": []}});
            };

            this.discharge = function (encounterData) {
                return $q.when({"data": {"results": []}});
            };
        }]);

