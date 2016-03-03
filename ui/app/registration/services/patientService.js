'use strict';

angular.module('bahmni.registration')
    .factory('patientService', ['$http', '$rootScope','$bahmniCookieStore','$q', 'patientServiceStrategy', function ($http, $rootScope, $bahmniCookieStore, $q, patientServiceStrategy) {
        var openmrsUrl = Bahmni.Registration.Constants.openmrsUrl;
        var baseOpenMRSRESTURL = Bahmni.Registration.Constants.baseOpenMRSRESTURL;

        var search = function (query, identifier, identifierPrefix, addressFieldName, addressFieldValue, customAttributeValue,
                               offset, customAttributeFields, programAttributeFieldName, programAttributeFieldValue) {
            var config = {
                params: {
                    q: query,
                    identifier:identifier,
                    identifierPrefix: identifierPrefix,
                    s: "byIdOrNameOrVillage",
                    addressFieldName: addressFieldName,
                    addressFieldValue: addressFieldValue,
                    customAttribute: customAttributeValue,
                    startIndex: offset || 0,
                    patientAttributes: customAttributeFields,
                    programAttributeFieldName: programAttributeFieldName,
                    programAttributeFieldValue: programAttributeFieldValue
                },
                withCredentials: true
            };
            return patientServiceStrategy.search(config);
        };

        var searchByIdentifier = function(identifier){
            return $http.get(Bahmni.Common.Constants.bahmniSearchUrl + "/patient", {
                method: "GET",
                params: {identifier: identifier},
                withCredentials: true
            });
        };

        var get = function (uuid) {
            return patientServiceStrategy.get(uuid);
        };

        var generateIdentifier = function (patient) {
            return patientServiceStrategy.generateIdentifier(patient);
        };

        var getLatestIdentifier = function (sourceName) {
            var url = openmrsUrl + "/ws/rest/v1/idgen/latestidentifier";
            var config = {
                method: "GET",
                withCredentials: true,
                params: {"sourceName": sourceName},
                headers: {"Accept": "text/plain", "Content-Type": "application/json"}
            };
            return $http.get(url, config);
        };

        var setLatestIdentifier = function (sourceName, identifier) {
            var url = openmrsUrl + "/ws/rest/v1/idgen/latestidentifier";
            var data = {
                sourceName: sourceName,
                identifier: identifier
            };
            return $http.post(url, data);
        };

        var create = function (patient) {
            var data = new Bahmni.Registration.CreatePatientRequestMapper(moment()).mapFromPatient($rootScope.patientConfiguration.attributeTypes, patient);
            return patientServiceStrategy.create(data);
        };

        var update = function (patient, openMRSPatient) {
            return patientServiceStrategy.update(patient, openMRSPatient, $rootScope.patientConfiguration.attributeTypes);
        };

        var updateImage = function (uuid, image) {
            var url = baseOpenMRSRESTURL + "/personimage/";
            var data = {
                "person": {"uuid": uuid},
                "base64EncodedImage": image
            };
            var config = {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            };
            return $http.post(url, data, config);
        };

        return {
            search: search,
            searchByIdentifier: searchByIdentifier,
            create: create,
            generateIdentifier: generateIdentifier,
            getLatestIdentifier: getLatestIdentifier,
            setLatestIdentifier: setLatestIdentifier,
            update: update,
            get: get,
            updateImage: updateImage
        };
    }]);
