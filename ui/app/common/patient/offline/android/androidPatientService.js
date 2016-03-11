'use strict';

angular.module('bahmni.common.patient')
    .service('patientService', ['$http','$q', function ($http, $q) {

        this.getPatient = function (uuid) {
            var patient = $http.get(Bahmni.Common.Constants.openmrsUrl + "/ws/rest/v1/patient/" + uuid, {
                method: "GET",
                params: {v: "full"},
                withCredentials: true
            });
            return patient;
        };

        this.getRelationships = function (patientUuid) {
            return $http.get(Bahmni.Common.Constants.openmrsUrl + "/ws/rest/v1/relationship", {
                method: "GET",
                params: {person: patientUuid, v: "full"},
                withCredentials: true
            });
        };

        this.findPatients = function (params) {

            return $http.get( Bahmni.Common.Constants.sqlUrl  , {
                method: "GET",
                params: params,
                withCredentials: true
            });
        };

        this.search = function (query, offset, identifier) {
            var params ={
                q: query,
                identifier:identifier,
                startIndex: offset || 0,
                addressFieldName: Bahmni.Common.Offline.AddressFields.CITY_VILLAGE
            };
            return $q.when(JSON.parse(AndroidOfflineService.search(JSON.stringify(params))));
        };

        this.getPatientContext = function (patientUuid, programUuid, personAttributes, programAttributes) {
            return $http.get('/openmrs/ws/rest/v1/bahmnicore/patientcontext', {
                params: {
                    patientUuid: patientUuid,
                    programUuid: programUuid,
                    personAttributes: personAttributes,
                    programAttributes: programAttributes
                },
                withCredentials: true
            });
        }
    }]);
