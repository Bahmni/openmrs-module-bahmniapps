'use strict';

angular.module('bahmni.registration')
    .factory('patientServiceStrategy', ['$q', 'offlinePatientServiceStrategy', 'eventQueue', '$rootScope', 'offlineService', 'offlineDbService', 'androidDbService',
        function ($q, offlinePatientServiceStrategy, eventQueue, $rootScope, offlineService, offlineDbService, androidDbService) {
            if (offlineService.isOfflineApp()) {
                if (offlineService.isAndroidApp()) {
                    offlineDbService = androidDbService;
                }
            }
            var search = function (config) {
                return offlinePatientServiceStrategy.search(config).then(function (results) {
                    return results.data;
                });
            };

            var get = function (uuid) {
                return offlinePatientServiceStrategy.get(uuid).then(function (data) {
                    var patientData = JSON.parse(JSON.stringify(data));
                    patientData.patient.person.preferredName = patientData.patient.person.names[0];
                    patientData.patient.person.preferredAddress = patientData.patient.person.addresses[0];
                    return offlinePatientServiceStrategy.getAttributeTypes().then(function (attributeTypes) {
                        mapAttributesToGetFormat(patientData.patient.person.attributes, attributeTypes);
                        return patientData;
                    });
                });
            };

            var create = function (patient) {
                var allIdentifiers = _.concat(patient.extraIdentifiers, patient.primaryIdentifier);
                var data = new Bahmni.Registration.CreatePatientRequestMapper(moment()).mapFromPatient($rootScope.patientConfiguration.attributeTypes, patient);
                var extraIdentifiersForSearch = {};
                patient.extraIdentifiers.forEach(function (extraIdentifier) {
                    var name = extraIdentifier.identifierType.name || extraIdentifier.identifierType.display;
                    extraIdentifiersForSearch[name] = extraIdentifier.identifier;
                });
                data.patient.identifiers = allIdentifiers;
                angular.forEach(data.patient.identifiers, function (identifier) {
                    identifier.primaryIdentifier = patient.primaryIdentifier.identifier;
                    identifier.extraIdentifiers = extraIdentifiersForSearch;
                });
                return createWithOutMapping(data);
            };

            var createWithOutMapping = function (data) {
                data.patient.identifiers = _.filter(data.patient.identifiers, function (identifier) {
                    return !_.isEmpty(identifier.identifierType.identifierSources) || (identifier.identifier !== undefined);
                });

                data.patient.person.birthtime = data.patient.person.birthtime ? moment(data.patient.person.birthtime).format("YYYY-MM-DDTHH:mm:ss.SSSZZ") : null;
                data.patient.person.auditInfo = {dateCreated: moment(data.patient.person.personDateCreated).format() || moment().format()};
                if ($rootScope.currentProvider) {
                    data.patient.person.auditInfo = data.patient.person.auditInfo || {};
                    data.patient.person.auditInfo.creator = $rootScope.currentProvider;
                    data.patient.auditInfo = data.patient.auditInfo || {};
                    data.patient.auditInfo.creator = $rootScope.currentProvider;
                }
                data.patient.person.personDateCreated = undefined;
                var event = {};
                if (!data.patient.person.addresses[0].uuid) {
                    _.each(data.patient.person.addresses, function (address) {
                        address.uuid = Bahmni.Common.Offline.UUID.generateUuid();
                    });
                }
                if (!data.patient.uuid) {
                    data.patient.person.uuid = Bahmni.Common.Offline.UUID.generateUuid();
                    _.each(data.patient.person.names, function (name) {
                        name.uuid = Bahmni.Common.Offline.UUID.generateUuid();
                    });
                    data.patient.uuid = data.patient.person.uuid;
                    event.url = Bahmni.Registration.Constants.baseOpenMRSRESTURL + "/bahmnicore/patientprofile/";
                } else {
                    event.url = Bahmni.Registration.Constants.baseOpenMRSRESTURL + "/bahmnicore/patientprofile/" + data.patient.uuid;
                }
                event.dbName = offlineDbService.getCurrentDbName();
                event.patientUuid = data.patient.uuid;
                return offlinePatientServiceStrategy.create(data).then(function (response) {
                    eventQueue.addToEventQueue(event);
                    return response;
                }, function (response) {
                    return $q.reject(response);
                });
            };

            var update = function (patient, openMRSPatient, attributeTypes) {
                var data = new Bahmni.Registration.CreatePatientRequestMapper(moment()).mapFromPatient(attributeTypes, patient);
                data.patient.identifiers = _.concat(patient.extraIdentifiers, patient.primaryIdentifier);
                var openmrsIdentifier = openMRSPatient.identifiers;
                var extraIdentifiersForSearch = {};
                patient.extraIdentifiers.forEach(function (extraIdentifier) {
                    var name = extraIdentifier.identifierType.name || extraIdentifier.identifierType.display;
                    extraIdentifiersForSearch[name] = extraIdentifier.identifier;
                });
                angular.forEach(data.patient.identifiers, function (identifier) {
                    var matchedOpenMRSIdentifier = _.find(openmrsIdentifier, {'identifierType': {'uuid': identifier.identifierType.uuid}});
                    identifier.selectedIdentifierSource = matchedOpenMRSIdentifier && matchedOpenMRSIdentifier.selectedIdentifierSource;
                    identifier.primaryIdentifier = patient.primaryIdentifier.identifier;
                    identifier.extraIdentifiers = extraIdentifiersForSearch;
                });
                data.patient.person.names[0].uuid = openMRSPatient.person.names[0].uuid;
                return offlinePatientServiceStrategy.deletePatientData(data.patient.uuid).then(function () {
                    return createWithOutMapping(data).then(function (result) {
                        var patientData = JSON.parse(JSON.stringify(result.data));
                        patientData.patient.person.preferredName = data.patient.person.names[0];
                        patientData.patient.person.preferredAddress = data.patient.person.addresses[0];
                        mapAttributesToGetFormat(patientData.patient.person.attributes, attributeTypes);
                        return $q.when({"data": patientData});
                    });
                });
            };

            var mapAttributesToGetFormat = function (attributes, attributeTypes) {
                angular.forEach(attributes, function (attribute) {
                    if (!attribute.voided) {
                        var foundAttribute = _.find(attributeTypes, function (attributeType) {
                            return attributeType.uuid === attribute.attributeType.uuid;
                        });
                        if (foundAttribute && foundAttribute.format) {
                            if (foundAttribute.format === "java.lang.Integer" || foundAttribute.format === "java.lang.Float") {
                                attribute.value = parseFloat(attribute.value);
                            } else if (foundAttribute.format === "java.lang.Boolean") {
                                attribute.value = (attribute.value === true);
                            } else if (foundAttribute.format === "org.openmrs.Concept") {
                                var value = attribute.value;
                                attribute.value = {display: value, uuid: attribute.hydratedObject};
                            }
                        }
                    }
                });
            };

            var generateIdentifier = function () {
                return $q.when({});
            };

            return {
                search: search,
                get: get,
                create: create,
                update: update,
                generateIdentifier: generateIdentifier
            };
        }]);
