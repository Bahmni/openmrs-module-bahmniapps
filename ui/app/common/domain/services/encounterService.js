'use strict';

angular.module('bahmni.common.domain')
    .service('encounterService', ['$http', '$q', '$rootScope', 'configurations', '$bahmniCookieStore', '$log',
        function ($http, $q, $rootScope, configurations, $bahmniCookieStore, $log) {
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
                        encounter.providers.push({"uuid": providerData.uuid});
                    } else if ($rootScope.currentProvider && $rootScope.currentProvider.uuid) {
                        encounter.providers.push({"uuid": $rootScope.currentProvider.uuid});
                    }
                }
                return encounter;
            };

            var getBacteriologyGroupMembers = function (encounter) {
                var addBacteriologyMember = function (bacteriologyGroupMembers, member) {
                    bacteriologyGroupMembers = member.groupMembers.length ? bacteriologyGroupMembers.concat(member.groupMembers) :
                        bacteriologyGroupMembers.concat(member);
                    return bacteriologyGroupMembers;
                };
                return encounter.extensions && encounter.extensions.mdrtbSpecimen ? encounter.extensions.mdrtbSpecimen.map(function (observation) {
                    var bacteriologyGroupMembers = [];
                    observation.sample.additionalAttributes && observation.sample.additionalAttributes.groupMembers.forEach(function (member) {
                        bacteriologyGroupMembers = addBacteriologyMember(bacteriologyGroupMembers, member);
                    });

                    observation.report.results && observation.report.results.groupMembers.forEach(function (member) {
                        bacteriologyGroupMembers = addBacteriologyMember(bacteriologyGroupMembers, member);
                    });
                    return bacteriologyGroupMembers;
                }) : [];
            };

            var getDefaultEncounterType = function () {
                var url = Bahmni.Common.Constants.encounterTypeUrl;
                return $http.get(url + '/' + configurations.defaultEncounterType()).then(function (response) {
                    return response.data;
                });
            };

            var getEncounterTypeBasedOnLoginLocation = function (loginLocationUuid) {
                return $http.get(Bahmni.Common.Constants.entityMappingUrl, {
                    params: {
                        entityUuid: loginLocationUuid,
                        mappingType: 'location_encountertype',
                        s: 'byEntityAndMappingType'
                    },
                    withCredentials: true
                });
            };

            var getEncounterTypeBasedOnProgramUuid = function (programUuid) {
                return $http.get(Bahmni.Common.Constants.entityMappingUrl, {
                    params: {
                        entityUuid: programUuid,
                        mappingType: 'program_encountertype',
                        s: 'byEntityAndMappingType'
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

            // Helper function to find observation by concept UUID (recursive search)
            var findObservationByConceptUuid = function (observations, conceptUuid) {
                if (!observations || !Array.isArray(observations)) {
                    return null;
                }
                for (var i = 0; i < observations.length; i++) {
                    var obs = observations[i];
                    if (obs.concept && obs.concept.uuid === conceptUuid) {
                        return obs;
                    }
                    if (obs.groupMembers && obs.groupMembers.length > 0) {
                        var found = findObservationByConceptUuid(obs.groupMembers, conceptUuid);
                        if (found) {
                            return found;
                        }
                    }
                }
                return null;
            };

            // Helper function to build appointment payload from encounter
            var buildAppointmentPayload = function (encounter) {
                const RETURN_DATE_UUID = "5096AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
                const REASON_UUID = "160430AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

                // Get return date
                var returnObs = findObservationByConceptUuid(encounter.observations || [], RETURN_DATE_UUID);
                var returnDateStr = returnObs ? (returnObs.valueAsString || returnObs.value) : null;

                // Get reason
                var reasonObs = findObservationByConceptUuid(encounter.observations || [], REASON_UUID);
                var comments = reasonObs ? (reasonObs.valueAsString || reasonObs.value) : (encounter.comments || "");

                // Get appointment data from rootScope (set by form fields)
                var appointmentData = $rootScope.appointmentData || {};
                var appointmentTime = "";
                var serviceUuid = "";
                var durationMins = 15; // default duration
                
                // Find appointment data for any form (usually there's only one follow-up form)
                for (var formUuid in appointmentData) {
                    if (appointmentData[formUuid].time) {
                        appointmentTime = appointmentData[formUuid].time;
                    }
                    if (appointmentData[formUuid].serviceUuid) {
                        serviceUuid = appointmentData[formUuid].serviceUuid;
                    }
                    if (appointmentData[formUuid].durationMins) {
                        durationMins = appointmentData[formUuid].durationMins;
                    }
                    break; // Use first found
                }

                // Convert return date + time to ISO format if available
                var startDateTime = "";
                var endDateTime = "";
                
                if (returnDateStr) {
                    try {
                        // Parse the date (format: YYYY-MM-DD)
                        var dateParts = returnDateStr.split('-');
                        
                        if (dateParts.length === 3) {
                            var year = parseInt(dateParts[0], 10);
                            var month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
                            var day = parseInt(dateParts[2], 10);
                            
                            // Create date object
                            var dateObj = new Date(year, month, day);
                            
                            // Handle appointmentTime (can be string "HH:MM" or Date object from HTML5 input)
                            var timeStr = "";
                            if (appointmentTime) {
                                if (typeof appointmentTime === 'string') {
                                    // Check if it's ISO format or HH:MM
                                    if (appointmentTime.indexOf('T') !== -1 || appointmentTime.indexOf('Z') !== -1) {
                                        // ISO string, extract time
                                        var dateFromIso = new Date(appointmentTime);
                                        if (!isNaN(dateFromIso.getTime())) {
                                            var hours = dateFromIso.getHours();
                                            var minutes = dateFromIso.getMinutes();
                                            timeStr = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
                                        }
                                    } else {
                                        // Already in HH:MM format
                                        timeStr = appointmentTime.trim();
                                    }
                                } else if (appointmentTime instanceof Date) {
                                    // Extract hours and minutes from Date object
                                    var hours = appointmentTime.getHours();
                                    var minutes = appointmentTime.getMinutes();
                                    timeStr = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
                                }
                            }
                            
                            if (timeStr && timeStr !== "") {
                                var timeParts = timeStr.split(':');
                                if (timeParts.length >= 2) {
                                    var hours = parseInt(timeParts[0], 10);
                                    var minutes = parseInt(timeParts[1], 10);
                                    if (!isNaN(hours) && !isNaN(minutes)) {
                                        dateObj.setHours(hours, minutes, 0, 0);
                                    }
                                }
                            } else {
                                // Default to 9 AM if no time specified
                                dateObj.setHours(9, 0, 0, 0);
                            }
                            
                            // Convert to ISO string
                            startDateTime = dateObj.toISOString();
                            
                            // End time is start time + duration from service
                            var endDateObj = new Date(dateObj);
                            endDateObj.setMinutes(endDateObj.getMinutes() + durationMins);
                            endDateTime = endDateObj.toISOString();
                        }
                    } catch (e) {
                        $log.error('Error parsing date/time:', e, 'returnDateStr:', returnDateStr, 'appointmentTime:', appointmentTime);
                    }
                }

                // Map providers to appointment format
                var providers = [];
                if (encounter.providers && encounter.providers.length > 0) {
                    encounter.providers.forEach(function (provider) {
                        providers.push({
                            name: provider.name || "",
                            uuid: provider.uuid || "",
                            response: "ACCEPTED"
                        });
                    });
                }

                var appointmentPayload = {
                    patientUuid: encounter.patientUuid || "",
                    serviceUuid: serviceUuid || "",
                    startDateTime: startDateTime,
                    endDateTime: endDateTime,
                    providers: providers,
                    locationUuid: encounter.locationUuid || "",
                    appointmentKind: "Scheduled",
                    comments: comments || "",
                    priority: null,
                    status: "Scheduled"
                };

                return appointmentPayload;
            };

            this.create = function (encounter) {
                encounter = this.buildEncounter(encounter);

                // Build appointment payload from encounter observations and form data
                var appointmentPayload = buildAppointmentPayload(encounter);

                // Create encounter first
                return $http.post(Bahmni.Common.Constants.bahmniEncounterUrl, encounter, {
                    withCredentials: true
                }).then(function (encounterResponse) {
                    // After encounter is created, create appointment if we have valid appointment data
                    if (appointmentPayload.startDateTime && appointmentPayload.serviceUuid && appointmentPayload.patientUuid) {
                        // Construct appointment URL (fallback if constant not available)
                        var appointmentUrl = (Bahmni.Common.Constants && Bahmni.Common.Constants.appointmentUrl) || 
                                            ((Bahmni.Common.Constants && Bahmni.Common.Constants.appointmentServiceUrl) ? 
                                             Bahmni.Common.Constants.appointmentServiceUrl.replace('/appointmentService', '/appointment') : 
                                             '/openmrs/ws/rest/v1/appointment');
                        
                        // Create appointment (fire and forget - don't fail encounter creation if appointment fails)
                        return $http.post(appointmentUrl, appointmentPayload, {
                            withCredentials: true
                        }).then(function (appointmentResponse) {
                            // Appointment created successfully
                            return encounterResponse; // Return encounter response
                        }).catch(function (appointmentError) {
                            // Log error but don't fail encounter creation
                            $log.error('Appointment creation failed:', appointmentError);
                            // Still return encounter response even if appointment creation fails
                            return encounterResponse;
                        });
                    } else {
                        // Missing required fields, skip appointment creation
                        return encounterResponse;
                    }
                });
            };

            this.delete = function (encounterUuid, reason) {
                return $http.delete(Bahmni.Common.Constants.bahmniEncounterUrl + "/" + encounterUuid, {
                    params: {reason: reason}
                });
            };

            function isObsConceptClassVideoOrImage (obs) {
                return (obs.concept.conceptClass === 'Video' || obs.concept.conceptClass === 'Image');
            }

            var deleteIfImageOrVideoObsIsVoided = function (obs) {
                if (obs.voided && obs.groupMembers && !obs.groupMembers.length && obs.value
                    && isObsConceptClassVideoOrImage(obs)) {
                    var url = Bahmni.Common.Constants.RESTWS_V1 + "/bahmnicore/visitDocument?filename=" + obs.value;
                    $http.delete(url, {withCredentials: true});
                }
            };

            var stripExtraConceptInfo = function (obs) {
                deleteIfImageOrVideoObsIsVoided(obs);
                obs.concept = {uuid: obs.concept.uuid, name: obs.concept.name, dataType: obs.concept.dataType};
                obs.groupMembers = obs.groupMembers || [];
                obs.groupMembers.forEach(function (groupMember) {
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
                return $http.post(Bahmni.Common.Constants.bahmniEncounterUrl + '/find', params, {
                    withCredentials: true
                });
            };
            this.findByEncounterUuid = function (encounterUuid, params) {
                params = params || {includeAll: true};
                return $http.get(Bahmni.Common.Constants.bahmniEncounterUrl + '/' + encounterUuid, {
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
        }]);

