"use strict";

angular.module("bahmni.common.domain").service("encounterService", [
    "$http",
    "$q",
    "$rootScope",
    "configurations",
    "$bahmniCookieStore",
    function ($http, $q, $rootScope, configurations, $bahmniCookieStore) {
        this.buildEncounter = function (encounter) {
            encounter.observations = encounter.observations || [];
            encounter.observations.forEach(function (obs) {
                stripExtraConceptInfo(obs);
            });
            var bacterilogyMembers = getBacteriologyGroupMembers(encounter);
            bacterilogyMembers = bacterilogyMembers.reduce(function (mem1, mem2) {
                return mem1.concat(mem2);
            }, []);
            bacterilogyMembers.forEach(function (mem) {
                deleteIfImageOrVideoObsIsVoided(mem);
            });
            encounter.providers = encounter.providers || [];
            var providerData = $bahmniCookieStore.get(Bahmni.Common.Constants.grantProviderAccessDataCookieName);
            if (_.isEmpty(encounter.providers)) {
                if (providerData && providerData.uuid) {
                    encounter.providers.push({ uuid: providerData.uuid });
                } else if ($rootScope.currentProvider && $rootScope.currentProvider.uuid) {
                    encounter.providers.push({ uuid: $rootScope.currentProvider.uuid });
                }
            }
            return encounter;
        };

        var getBacteriologyGroupMembers = function (encounter) {
            var addBacteriologyMember = function (bacteriologyGroupMembers, member) {
                bacteriologyGroupMembers = member.groupMembers.length
          ? bacteriologyGroupMembers.concat(member.groupMembers)
          : bacteriologyGroupMembers.concat(member);
                return bacteriologyGroupMembers;
            };
            return encounter.extensions && encounter.extensions.mdrtbSpecimen
        ? encounter.extensions.mdrtbSpecimen.map(function (observation) {
            var bacteriologyGroupMembers = [];
            observation.sample.additionalAttributes &&
              observation.sample.additionalAttributes.groupMembers.forEach(function (member) {
                  bacteriologyGroupMembers = addBacteriologyMember(bacteriologyGroupMembers, member);
              });

            observation.report.results &&
              observation.report.results.groupMembers.forEach(function (member) {
                  bacteriologyGroupMembers = addBacteriologyMember(bacteriologyGroupMembers, member);
              });
            return bacteriologyGroupMembers;
        })
        : [];
        };

        var getDefaultEncounterType = function () {
            var url = Bahmni.Common.Constants.encounterTypeUrl;
            return $http.get(url + "/" + configurations.defaultEncounterType()).then(function (response) {
                return response.data;
            });
        };

        var getEncounterTypeBasedOnLoginLocation = function (loginLocationUuid) {
            return $http.get(Bahmni.Common.Constants.entityMappingUrl, {
                params: {
                    entityUuid: loginLocationUuid,
                    mappingType: "location_encountertype",
                    s: "byEntityAndMappingType"
                },
                withCredentials: true
            });
        };

        var getEncounterTypeBasedOnProgramUuid = function (programUuid) {
            return $http.get(Bahmni.Common.Constants.entityMappingUrl, {
                params: {
                    entityUuid: programUuid,
                    mappingType: "program_encountertype",
                    s: "byEntityAndMappingType"
                },
                withCredentials: true
            });
        };

        var getDefaultEncounterTypeIfMappingNotFound = function (entityMappings) {
            var encounterType = entityMappings.data.results[0] && entityMappings.data.results[0].mappings[0];
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
            } else if (loginLocationUuid) {
                return getEncounterTypeBasedOnLoginLocation(loginLocationUuid).then(function (response) {
                    return getDefaultEncounterTypeIfMappingNotFound(response);
                });
            } else {
                return getDefaultEncounterType();
            }
        };

        var getDiagnosis = function (response, counsellingForm) {
            var ICD11Obs = [];
            var counsellingIDs = counsellingForm.map(function (form) {
                return form.formFieldPath;
            });

            if (response.observations) {
                ICD11Obs = response.observations.filter(function (item) {
                    return (
                  item.concept &&
                  item.concept.name.indexOf("ICD 11 Diagnosis") !== -1 &&
                  item.formFieldPath.indexOf("Counselling Form") === -1
                    );
                }).map(function (item) {
                    return Object.assign({}, item, {
                        formFieldPath: counsellingForm.find(function (form) {
                            return form.name === item.concept.name;
                        }).formFieldPath
                    });
                });
            }

            var removedCounselling = [];

            if (response.observations) {
                removedCounselling = response.observations.filter(function (item) {
                    return counsellingIDs.indexOf(item.formFieldPath) === -1;
                });
            }
            if (ICD11Obs.length > 0) {
                var payload = Object.assign({}, response, {
                    encounterDateTime: Date.now(),
                    observations: removedCounselling.concat(ICD11Obs)
                });
                return payload;
            }
            return response;
        };

        this.sendToOdoo = function (encounterData) {
            var obs = encounterData.observations;
            if (obs && obs.length > 0) {
                var form = obs[0].formFieldPath.split(".")[0].toLowerCase();
                if (form === "optometrist assessment") {
                    encounterData.patientId = $rootScope.patientIdentifier;
                    return $http.post(Bahmni.Common.Constants.odooConnectorUrl, encounterData, {
                        withCredentials: true
                    });
                }
            }
        };

        this.create = function (encounter) {
            encounter = this.buildEncounter(encounter);
            return getCounsellingForm().then(function (res) {
                var counsellingObs = getDiagnosis(encounter, res);
                return $http.post(Bahmni.Common.Constants.bahmniEncounterUrl, counsellingObs, {
                    withCredentials: true
                });
            })
        .then(
          function (response) {
              encounter.encounterUuid = response.data.encounterUuid;
              encounter.encounterDateTime = response.data.encounterDateTime;
              encounter.observations = getGlassObs(response.data);
              this.sendToOdoo(encounter);
              return response;
          }.bind(this)
        );
        };

        var parseForm = function (form) {
            var formName = form.name;
            var formVersion = form.version;
            var data = JSON.parse(form.resources[0].value);

            var control = null;
            for (var i = 0; i < data.controls.length; i++) {
                var group = data.controls[i];
                for (var j = 0; j < group.controls.length; j++) {
                    if (group.controls[j].concept.name.indexOf("ICD 11 Diagnosis") !== -1) {
                        control = group;
                        break;
                    }
                }
                if (control) break;
            }

            if (control) {
                var controlIndex = -1;
                for (var k = 0; k < data.controls.length; k++) {
                    if (data.controls[k].id === control.id) {
                        controlIndex = k;
                        break;
                    }
                }

                var fields = [];
                for (var m = 0; m < control.controls.length; m++) {
                    var item = control.controls[m];
                    if (item.concept.name.indexOf("ICD 11 Diagnosis") !== -1) {
                        fields.push({
                            name: item.concept.name,
                            formFieldPath: formName + "." + formVersion + "/" + item.label.id + "-" + controlIndex
                        });
                    }
                }
                return fields;
            }

            return [];
        };

        function getCounsellingForm () {
            return $http.get(Bahmni.Common.Constants.latestPublishedForms, {
                params: {
                    formType: "v2"
                }
            }).then(function (response) {
                var counsellingForm = response.data.find(function (form) {
                    return form.name === "Counselling Form";
                });
                if (counsellingForm) {
                    return $http.get(Bahmni.Common.Constants.formUrl + "/" + counsellingForm.uuid, {
                        params: {
                            v: "custom:(id,uuid,name,version,published,auditInfo,resources:(value,dataType,uuid))"
                        }
                    }).then(function (res) {
                        return parseForm(res.data);
                    });
                }
            });
        }

        var GLASS_CONCEPT_NAMES = [
            "Spherical, Right Eye PG DV",
            "Spherical, Left Eye PG DV",
            "Cylinder, Right Eye PG DV",
            "Cylinder, Left Eye PG DV",
            "Axis, Right Eye PG DV",
            "Axis, Left Eye PG DV",
            "V/A with PG, Right Eye PG DV",
            "V/A with PG, Left Eye PG DV",
            "Spherical, Right Eye PG NV",
            "Spherical, Left Eye PG NV",
            "Cylinder, Right Eye PG NV",
            "Cylinder, Left Eye PG NV",
            "Axis, Right Eye PG NV",
            "Axis, Left Eye PG NV",
            "V/A with PG, Right Eye PG NV",
            "V/A with PG, Left Eye PG NV",
            "Refractive Index",
            "Lens Material",
            "Lens Form",
            "Bifocal Specifications",
            "Tint Selection"
        ];

        function getGlassObs (response) {
            var glassObs = [];

            if (response.observations) {
                response.observations.forEach((obs) => {
                    if (obs.concept && GLASS_CONCEPT_NAMES.includes(obs.concept.name)) {
                        glassObs.push(obs);
                    }
                });
            }

            return glassObs;
        }

        this.delete = function (encounterUuid, reason) {
            this.sendToOdoo({ encounterUuid: encounterUuid, reason: reason });
            return $http.delete(Bahmni.Common.Constants.bahmniEncounterUrl + "/" + encounterUuid, {
                params: { reason: reason }
            });
        };

        function isObsConceptClassVideoOrImage (obs) {
            return obs.concept.conceptClass === "Video" || obs.concept.conceptClass === "Image";
        }

        var deleteIfImageOrVideoObsIsVoided = function (obs) {
            if (obs.voided && obs.groupMembers && !obs.groupMembers.length && obs.value && isObsConceptClassVideoOrImage(obs)) {
                var url = Bahmni.Common.Constants.RESTWS_V1 + "/bahmnicore/visitDocument?filename=" + obs.value;
                $http.delete(url, { withCredentials: true });
            }
        };

        var stripExtraConceptInfo = function (obs) {
            deleteIfImageOrVideoObsIsVoided(obs);
            obs.concept = { uuid: obs.concept.uuid, name: obs.concept.name, dataType: obs.concept.dataType };
            obs.groupMembers = obs.groupMembers || [];
            obs.groupMembers.forEach(function (groupMember) {
                stripExtraConceptInfo(groupMember);
            });
        };

        var searchWithoutEncounterDate = function (visitUuid) {
            return $http.post(
        Bahmni.Common.Constants.bahmniEncounterUrl + "/find",
                {
                    visitUuids: [visitUuid],
                    includeAll: Bahmni.Common.Constants.includeAllObservations
                },
                {
                    withCredentials: true
                }
      );
        };

        this.search = function (visitUuid, encounterDate) {
            if (!encounterDate) {
                return searchWithoutEncounterDate(visitUuid);
            }

            return $http.get(Bahmni.Common.Constants.emrEncounterUrl, {
                params: {
                    visitUuid: visitUuid,
                    encounterDate: encounterDate,
                    includeAll: Bahmni.Common.Constants.includeAllObservations
                },
                withCredentials: true
            });
        };

        this.find = function (params) {
            return $http.post(Bahmni.Common.Constants.bahmniEncounterUrl + "/find", params, {
                withCredentials: true
            });
        };
        this.findByEncounterUuid = function (encounterUuid, params) {
            params = params || { includeAll: true };
            return $http.get(Bahmni.Common.Constants.bahmniEncounterUrl + "/" + encounterUuid, {
                params: params,
                withCredentials: true
            });
        };

        this.getEncountersForEncounterType = function (patientUuid, encounterTypeUuid) {
            return $http.get(Bahmni.Common.Constants.encounterUrl, {
                params: {
                    patient: patientUuid,
                    order: "desc",
                    encounterType: encounterTypeUuid,
                    v: "custom:(uuid,provider,visit:(uuid,startDatetime,stopDatetime),obs:(uuid,concept:(uuid,name),groupMembers:(id,uuid,obsDatetime,value,comment)))"
                },
                withCredentials: true
            });
        };

        this.getDigitized = function (patientUuid) {
            var patientDocumentEncounterTypeUuid = configurations.encounterConfig().getPatientDocumentEncounterTypeUuid();
            return $http.get(Bahmni.Common.Constants.encounterUrl, {
                params: {
                    patient: patientUuid,
                    encounterType: patientDocumentEncounterTypeUuid,
                    v: "custom:(uuid,obs:(uuid))"
                },
                withCredentials: true
            });
        };

        this.discharge = function (encounterData) {
            var encounter = this.buildEncounter(encounterData);
            return $http.post(Bahmni.Common.Constants.dischargeUrl, encounter, {
                withCredentials: true
            });
        };
    }
]);
