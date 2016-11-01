'use strict';

angular.module('bahmni.common.patient')
    .service('patientService', ['offlineSearchDbService', '$q', 'offlineDbService', function (offlineSearchDbService, $q, offlineDbService) {
        this.getPatient = function (uuid) {
            return offlineDbService.getPatientByUuid(uuid).then(function (response) {
                response.patient.person.preferredName = response.patient.person.names[0];
                response.patient.person.preferredAddress = response.patient.person.addresses[0];
                return {"data": response.patient};
            });
        };

        this.getRelationships = function (patientUuid) {
            return $q.when({data: {}});
        };

        this.findPatients = function (params) {
            return $q.when({data: []});
        };

        this.search = function (query, offset, identifier) {
            var params = {
                q: query,
                identifier: identifier,
                startIndex: offset || 0,
                addressFieldName: Bahmni.Common.Offline.AddressFields.CITY_VILLAGE
            };
            return offlineSearchDbService.search(params);
        };

        this.getPatientContext = function (uuid) {
            var deferrable = $q.defer();
            var patientContextMapper = new Bahmni.PatientContextMapper();
            offlineDbService.getPatientByUuid(uuid).then(function (response) {
                var patientContext = patientContextMapper.map(response.patient);
                deferrable.resolve({"data": patientContext});
            });
            return deferrable.promise;
        };

        this.getRecentPatients = function (duration) {
            var params = {
                q: '',
                startIndex: 0,
                addressFieldName: Bahmni.Common.Offline.AddressFields.CITY_VILLAGE,
                duration: duration || 14
            };
            return offlineSearchDbService.search(params);
        };
    }]);
