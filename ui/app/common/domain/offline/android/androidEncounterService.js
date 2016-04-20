'use strict';

angular.module('bahmni.common.domain')
    .service('encounterService', ['$q', '$rootScope', '$bahmniCookieStore', 'androidDbService',
        function ($q, $rootScope,  $bahmniCookieStore, androidDbService) {

            this.buildEncounter = function (encounter) {
                encounter.observations = encounter.observations || [];
                encounter.observations.forEach(function (obs) {
                    stripExtraConceptInfo(obs);
                });

                encounter.providers = encounter.providers || [];

                var providerData = $bahmniCookieStore.get(Bahmni.Common.Constants.grantProviderAccessDataCookieName);
                if (_.isEmpty(encounter.providers)) {
                    if (providerData && providerData.uuid) {
                        encounter.providers.push({"uuid": providerData.uuid});
                    } else if ($rootScope.currentProvider && $rootScope.currentProvider.uuid) {
                        encounter.providers.push({"uuid": $rootScope.currentProvider.uuid});
                    }
                }
                return encounter;
            };

            var getDefaultEncounterType = function () {
                var deferrable = $q.defer();
                androidDbService.getReferenceData("DefaultEncounterType").then(function(defaultEncounterType) {
                    deferrable.resolve(defaultEncounterType);
                });
                return deferrable.promise;
            };

            var getEncounterTypeBasedOnLoginLocation = function () {
                var deferrable = $q.defer();
                androidDbService.getReferenceData("LoginLocationToEncounterTypeMapping").then(function(results){
                    var mappings = results.value.results[0].mappings;
                    deferrable.resolve({"data": mappings});
                });
                return deferrable.promise;
            };

            var getEncounterTypeBasedOnProgramUuid = function (programUuid) {
                return $q.when();
            };

            var getDefaultEncounterTypeIfMappingNotFound = function (mapping) {
                var encounterType = mapping;
                if (!encounterType) {
                    encounterType = getDefaultEncounterType();
                }
                return encounterType;

            };

            this.getEncounterType = function (programUuid, loginLocationUuid) {
                if (programUuid) {
                    return getEncounterTypeBasedOnProgramUuid(programUuid).then(function (response) {
                        return getDefaultEncounterTypeIfMappingNotFound(response);
                    });
                }
                else if (loginLocationUuid) {
                    return getEncounterTypeBasedOnLoginLocation().then(function (response) {
                        return getDefaultEncounterTypeIfMappingNotFound(response.data);
                    });
                } else {
                    return getDefaultEncounterType();
                }

            };


            this.create = function (encounter) {
                return $q.when({"data": {"results": []}})
            };

            this.delete = function (encounterUuid, reason) {
                return $q.when({"data": {"results": []}})
            };

            var stripExtraConceptInfo = function (obs) {
                obs.concept = {uuid: obs.concept.uuid, name: obs.concept.name, dataType: obs.concept.dataType};
                obs.groupMembers = obs.groupMembers || [];
                obs.groupMembers.forEach(function (groupMember) {
                    stripExtraConceptInfo(groupMember);
                });
            };

            var searchWithoutEncounterDate = function (visitUuid) {
                return $q.when({"data": {"results": []}})
            };

            this.search = function (visitUuid, encounterDate) {
                return $q.when({"data": {"results": []}})
            };

            this.find = function (params) {
                return $q.when({"data":{
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
                }});
            };
            this.findByEncounterUuid = function (encounterUuid) {
                return $q.when({"data": {"results": []}})
            };

            this.getEncountersForEncounterType = function (patientUuid, encounterTypeUuid) {
                return $q.when({"data": {"results": []}})
            };

            this.getDigitized = function (patientUuid) {
                return $q.when({"data": {"results": []}});
            };

            this.discharge = function (encounterData) {
                return $q.when({"data": {"results": []}});
            };
        }]);

