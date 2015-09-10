'use strict';

angular.module('bahmni.common.domain')
    .service('encounterService', ['$http', '$q', '$rootScope', 'configurations', '$bahmniCookieStore',
        function ($http, $q, $rootScope, configurations, $bahmniCookieStore) {

    this.buildEncounter = function(encounter){
        encounter.observations = encounter.observations || [];
        encounter.observations.forEach(function(obs) {
            stripExtraConceptInfo(obs);
        });

        var providerData = $bahmniCookieStore.get(Bahmni.Common.Constants.grantProviderAccessDataCookieName);
        encounter.providers = encounter.providers || [];

        if(providerData && providerData.uuid){
            encounter.providers.push( {"uuid" : providerData.uuid});
        }else if ($rootScope.currentProvider && $rootScope.currentProvider.uuid) {
            encounter.providers.push( {"uuid" : $rootScope.currentProvider.uuid });
        }
        return encounter;
    };

    var getDefaultEncounterType = function () {
        var url = Bahmni.Common.Constants.encounterTypeUrl;
        return  $http.get(url + '/' + configurations.defaultEncounterType()).then(function (response) {
            return response.data;
        });
    };

    this.getEncounterType = function (programUuid) {
        if(programUuid == null) {
            return getDefaultEncounterType();
        }
        return $http.get(Bahmni.Common.Constants.entityMappingUrl, {
            params: {
                entityUuid: programUuid,
                mappingType: 'program_encountertype',
                s: 'byEntityAndMappingType'
            },
            withCredentials: true
        }).then(function (response) {
            var encounterType=response.data.results[0].mappings[0];
            if(!encounterType) {
                encounterType = getDefaultEncounterType();
            }
            return encounterType;
        });
    };

    this.create = function (encounter) {
        encounter = this.buildEncounter(encounter);

        return $http.post(Bahmni.Common.Constants.bahmniEncounterUrl, encounter, {
            withCredentials:true
        });
    };

    this.delete = function(encounterUuid, reason) {
        return $http.delete(Bahmni.Common.Constants.bahmniEncounterUrl + "/" + encounterUuid, {
            params: {reason : reason}
        });
    };

    var stripExtraConceptInfo = function(obs) {
        obs.concept = {uuid: obs.concept.uuid, name: obs.concept.name, dataType: obs.concept.dataType };
        obs.groupMembers = obs.groupMembers || [];
        obs.groupMembers.forEach(function(groupMember) {
            stripExtraConceptInfo(groupMember);
        });
    };

            var searchWithoutEncounterDate = function (visitUuid) {
                return $http.post(Bahmni.Common.Constants.bahmniEncounterUrl + '/find', {
                    visitUuids: [visitUuid],
                    includeAll: Bahmni.Common.Constants.includeAllObservations
                }, {
                    withCredentials: true
                });
            };

    this.search = function (visitUuid,encounterDate) {
        if (!encounterDate) return searchWithoutEncounterDate(visitUuid);

        return $http.get(Bahmni.Common.Constants.emrEncounterUrl, {
        	params:{
        		visitUuid : visitUuid,
                encounterDate : encounterDate,
                includeAll : Bahmni.Common.Constants.includeAllObservations
        	},
          withCredentials : true
        });
    };

    var getEncountersOfCurrentVisit = function(patientUuid) {
        var deferredEncounters = $q.defer();
        var options = {
            method:"GET",
            params:{
                patient : patientUuid,
                includeInactive : false,
                v : "custom:(uuid,encounters:(uuid,encounterDatetime,encounterType:(uuid,name,retired)))"
            },
            withCredentials : true
        };

        $http.get(Bahmni.Common.Constants.visitUrl, options).success(function(data) {
            var encounters = [];
            if (data.results.length > 0) {
                encounters = data.results[0].encounters;
                encounters.forEach(function(enc) {
                    if (typeof enc.encounterDatetime == 'string') {
                        enc.encounterDatetime = Bahmni.Common.Util.DateUtil.parse(enc.encounterDatetime);
                    }
                    enc.encounterTypeUuid = enc.encounterType.uuid;
                });
            }
            deferredEncounters.resolve(encounters);
        }).error(function(e) {
            deferredEncounters.reject(e);
        });
        return deferredEncounters.promise;
    };

    this.identifyEncounterForType = function(patientUuid, encounterTypeUuid) {
        var searchable = $q.defer();
        getEncountersOfCurrentVisit(patientUuid).then(function(encounters) {
            if (encounters.length == 0) {
                searchable.resolve(null);
                return;
            }
            var selectedEnc = null;
            encounters.sort(function(e1, e2) {
                return e2.encounterDatetime - e1.encounterDatetime;
            });
            for (var i = 0, count =  encounters.length; i < count; i++) {
                if (encounters[i].encounterTypeUuid == encounterTypeUuid) {
                    selectedEnc = encounters[i];
                    break;
                }
            }
            searchable.resolve(selectedEnc);
        },
        function(responseError) {
            searchable.reject("Couldn't identify prerequisite encounter for this operation.");
        });
        return searchable.promise;
    };

    this.activeEncounter = function (params) {
        return $http.get(Bahmni.Common.Constants.bahmniEncounterUrl + '/active', {
            params: params,
            withCredentials : true
        });
    };

    this.find = function (params) {
        return $http.post(Bahmni.Common.Constants.bahmniEncounterUrl + '/find', params, {
            withCredentials: true
        });
    };
    this.findByEncounterUuid = function (encounterUuid) {
        return $http.get(Bahmni.Common.Constants.bahmniEncounterUrl + '/' + encounterUuid, {
            params: {includeAll : true},
            withCredentials: true
        });
    };

    this.getEncountersForEncounterType = function(patientUuid, encounterTypeUuid) {
        return $http.get(Bahmni.Common.Constants.encounterUrl, {
            params:{
                patient: patientUuid,
                encounterType: encounterTypeUuid,
                v: "custom:(uuid,provider,visit:(uuid,startDatetime,stopDatetime),obs:(uuid,concept:(uuid,name),groupMembers:(id,uuid,obsDatetime,value)))"
            },
            withCredentials : true
        });
    };

    this.getDigitized = function(patientUuid) {
    var patientDocumentEncounterTypeUuid = configurations.encounterConfig().getPatientDocumentEncounterTypeUuid();
        return $http.get(Bahmni.Common.Constants.encounterUrl, {
            params:{
                patient: patientUuid,
                encounterType: patientDocumentEncounterTypeUuid,
                v: "custom:(uuid,obs:(uuid))"
            },
            withCredentials : true
        });
    }
}]);

