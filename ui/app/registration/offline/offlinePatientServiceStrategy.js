'use strict';

angular.module('bahmni.registration')
    .factory('patientServiceStrategy', ['$q', 'offlinePatientServiceStrategy','eventQueue',
        function ($q, offlinePatientServiceStrategy, eventQueue) {

            var search = function (config) {
                return offlinePatientServiceStrategy.search(config).then(function(results) {
                    return results.data;
                });
            };

            var get = function (uuid) {
                return offlinePatientServiceStrategy.get(uuid).then(function(data) {
                    data.patient.person.preferredName = data.patient.person.names[0];
                    data.patient.person.preferredAddress = data.patient.person.addresses[0];
                    return offlinePatientServiceStrategy.getAttributeTypes().then(function (attributeTypes) {
                        mapAttributesToGetFormat(data.patient.person.attributes,attributeTypes);
                        return data;
                    });
                });
            };

            var create = function (data) {
                data.patient.person.auditInfo = {dateCreated: moment(data.patient.person.personDateCreated).format() || moment().format()};
                var event = {};
                if(!data.patient.person.addresses[0].uuid){
                    _.each(data.patient.person.addresses, function(address) {
                        address.uuid = Bahmni.Common.Offline.UUID.generateUuid();
                    });
                }
                if (!data.patient.uuid){
                    data.patient.person.uuid = Bahmni.Common.Offline.UUID.generateUuid();
                    _.each(data.patient.person.names, function(name) {
                        name.uuid = Bahmni.Common.Offline.UUID.generateUuid();
                    });
                    data.patient.uuid = data.patient.person.uuid;
                    event.url = Bahmni.Registration.Constants.baseOpenMRSRESTURL + "/bahmnicore/patientprofile/";
                }
                else{
                    event.url = Bahmni.Registration.Constants.baseOpenMRSRESTURL + "/bahmnicore/patientprofile/" + data.patient.uuid;
                }
                event.patientUuid = data.patient.uuid;
                eventQueue.addToEventQueue(event);
                return offlinePatientServiceStrategy.create(data);
            };

            var update = function(patient, openMRSPatient, attributeTypes) {
                var data = new Bahmni.Registration.CreatePatientRequestMapper(moment()).mapFromPatient(attributeTypes, patient);
                data.patient.person.names[0].uuid = openMRSPatient.person.names[0].uuid;
                data.patient.person.personDateCreated = undefined;
                return offlinePatientServiceStrategy.deletePatientData(data.patient.uuid).then(function () {
                        return create(data).then(function (result) {
                        result.data.patient.person.preferredName = data.patient.person.names[0];
                        result.data.patient.person.preferredAddress = data.patient.person.addresses[0];
                        mapAttributesToGetFormat(result.data.patient.person.attributes, attributeTypes);
                        return $q.when(result.data);
                    });
                });
            };

            var mapAttributesToGetFormat = function (attributes, attributeTypes) {
                angular.forEach(attributes, function (attribute){
                    if (!attribute.voided) {
                        var foundAttribute = _.find(attributeTypes, function (attributeType) {
                            return attributeType.uuid === attribute.attributeType.uuid
                        });
                        if (foundAttribute != undefined && foundAttribute.format != undefined) {
                            if ("java.lang.Integer" === foundAttribute.format || "java.lang.Float" === foundAttribute.format) {
                                attribute.value = parseFloat(attribute.value);
                            } else if ("java.lang.Boolean" === foundAttribute.format) {
                                attribute.value = (attribute.value === 'true');
                            } else if ("org.openmrs.Concept" === foundAttribute.format) {
                                var value = attribute.value;
                                attribute.value = {display: value, uuid: attribute.hydratedObject};
                            }
                        }
                    }
                });
            };

            var generateIdentifier = function(patient) {
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
