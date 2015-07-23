'use strict';

angular.module('bahmni.registration')
    .factory('patientService', ['$http', '$rootScope', function ($http, $rootScope) {
        var openmrsUrl = Bahmni.Registration.Constants.openmrsUrl;
        var baseOpenMRSRESTURL = Bahmni.Registration.Constants.baseOpenMRSRESTURL;

        var search = function (query, addressFieldName, addressFieldValue, customAttributeValue, offset, customAttributeFields) {
            offset = offset || 0;
            return $http.get(openmrsUrl + "/ws/rest/v1/bahmnicore/patient", {
                method: "GET",
                params: {q: query,'address_field_name': addressFieldName , 'address_field_value': addressFieldValue, 'custom_attribute': customAttributeValue, startIndex: offset, patientAttributes: customAttributeFields}     ,
                withCredentials: true
            });
        };

        var searchByIdentifier = function(identifier, offset){
            offset = offset || 0;
            return $http.get(openmrsUrl + "/ws/rest/v1/bahmnicore/patient", {
                method: "GET",
                params: {identifier: identifier},
                withCredentials: true
            });
        };

        var get = function (uuid) {
            return $http.get(openmrsUrl + "/ws/rest/v1/patientprofile/" + uuid, {
                method: "GET",
                params: {v: "full"},
                withCredentials: true
            });
        };

        var generateIdentifier = function (patient) {
            var idgenJson = {"identifierSourceName": patient.identifierPrefix.prefix};
            return $http.post(openmrsUrl + "/ws/rest/v1/idgen", idgenJson, {
                withCredentials: true,
                headers: {"Accept": "text/plain", "Content-Type": "application/json"}
            });
        };

        var create = function (patient) {
            var patientJson = new Bahmni.Registration.CreatePatientRequestMapper(moment()).mapFromPatient($rootScope.patientConfiguration.personAttributeTypes, patient);
            return $http.post(baseOpenMRSRESTURL + "/patientprofile", patientJson, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        var update = function (patient, openMRSPatient) {
            var patientJson = new Bahmni.Registration.UpdatePatientRequestMapper(moment()).mapFromPatient($rootScope.patientConfiguration.personAttributeTypes, openMRSPatient, patient);
            return $http.post(baseOpenMRSRESTURL + "/patientprofile/" + openMRSPatient.uuid, patientJson, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        var updateImage = function (uuid, image) {
            var updateImageUrl = baseOpenMRSRESTURL + "/personimage/";
            var imageRequest = {
                "person": {
                    "uuid": uuid
                },
                "base64EncodedImage": image
            };
            return $http.post(updateImageUrl, imageRequest, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        return {
            search: search,
            searchByIdentifier: searchByIdentifier,
            create: create,
            generateIdentifier: generateIdentifier,
            update: update,
            get: get,
            updateImage: updateImage
        };
    }]);
