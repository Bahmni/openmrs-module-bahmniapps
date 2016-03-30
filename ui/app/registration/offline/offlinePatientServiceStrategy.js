'use strict';

angular.module('bahmni.registration')
    .factory('patientServiceStrategy', ['$http', '$q', 'offlinePatientServiceStrategy',
        function ($http, $q, offlinePatientServiceStrategy) {

            var search = function (config) {
                return offlinePatientServiceStrategy.search(config).then(function(results) {
                    return results.data;
                });
            };

            var get = function (uuid) {
                return offlinePatientServiceStrategy.get(uuid);
            };

            var create = function (data) {
                data.patient.person.auditInfo = {dateCreated: new Date()};
                if (!data.patient.uuid){
                    data.patient.person.uuid = Bahmni.Common.Offline.UUID.generateUuid();
                    data.patient.uuid = data.patient.person.uuid;
                }
                data.patient.person.preferredName = data.patient.person.names[0];
                data.patient.person.preferredAddress = data.patient.person.addresses[0];
                return offlinePatientServiceStrategy.create(data);
            };

            var update = function(patient, openMRSPatient, attributeTypes) {
                var data = new Bahmni.Registration.CreatePatientRequestMapper(moment()).mapFromPatient(attributeTypes, patient);
                return offlinePatientServiceStrategy.deletePatientData(data.patient.uuid).then(function () {
                    return create(data).then(function (result) {
                        return $q.when(result.data);
                    });
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
