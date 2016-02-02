'use strict';

angular.module('bahmni.registration')
    .factory('patientService', ['$http', '$rootScope','$bahmniCookieStore','$q','offlinePatientService', 'offlineService', function ($http, $rootScope, $bahmniCookieStore, $q, offlinePatientService, offlineService) {
        var openmrsUrl = Bahmni.Registration.Constants.openmrsUrl;
        var baseOpenMRSRESTURL = Bahmni.Registration.Constants.baseOpenMRSRESTURL;
        var search = function (query, identifier, identifierPrefix, addressFieldName, addressFieldValue, customAttributeValue, offset, customAttributeFields) {

            var config = {
                params: {
                    q: query,
                    identifier:identifier,
                    identifierPrefix: identifierPrefix,
                    s: "byIdOrNameOrVillage",
                    address_field_name: addressFieldName,
                    address_field_value: addressFieldValue,
                    custom_attribute: customAttributeValue,
                    startIndex: offset || 0,
                    patientAttributes: customAttributeFields
                },
                withCredentials: true
            };
            var defer = $q.defer();

            if(offlineService.isOfflineApp()){
                offlinePatientService.search(config.params).then(function(result){
                    defer.resolve(result);
                });
                return defer.promise;
            }
            var url = Bahmni.Common.Constants.bahmniSearchUrl + "/patient";
            $http.get(url, config).success(function(result) {
                defer.resolve(result);
            });
            return defer.promise;
        };

        var searchByIdentifier = function(identifier){
            return $http.get(Bahmni.Common.Constants.bahmniSearchUrl + "/patient", {
                method: "GET",
                params: {identifier: identifier},
                withCredentials: true
            });
        };

        var get = function (uuid) {
            if(offlineService.isOfflineApp()){
                return offlinePatientService.get(uuid);
            }
            var url = openmrsUrl + "/ws/rest/v1/patientprofile/" + uuid;
            var config = {
                method: "GET",
                params: {v: "full"},
                withCredentials: true
            };

            var defer = $q.defer();
            $http.get(url, config).success(function(result) {
                defer.resolve(result);
            });
            return defer.promise;
        };

        var generateIdentifier = function (patient) {
            if(offlineService.isOfflineApp()) {
                return $q.when({});
            }

            var data = {"identifierSourceName": patient.identifierPrefix ? patient.identifierPrefix.prefix : ""};
            var url = openmrsUrl + "/ws/rest/v1/idgen";
            var config = {
                withCredentials: true,
                headers: {"Accept": "text/plain", "Content-Type": "application/json"}
            };
            return $http.post(url, data, config);
        };

        var getLatestIdentifier = function (sourceName) {
            var url = openmrsUrl + "/ws/rest/v1/idgen" + "/latestidentifier";
            var config = {
                method: "GET",
                withCredentials: true,
                params: {"sourceName": sourceName},
                headers: {"Accept": "text/plain", "Content-Type": "application/json"}
            };
            return $http.get(url, config);
        };

        var setLatestIdentifier = function (sourceName, identifier) {
            var url = openmrsUrl + "/ws/rest/v1/idgen" + "/latestidentifier";
            var data = {
                sourceName: sourceName,
                identifier: identifier
            };
            return $http.post(url, data);
        };

        var create = function (patient) {
            var data = new Bahmni.Registration.CreatePatientRequestMapper(moment()).mapFromPatient($rootScope.patientConfiguration.attributeTypes, patient);
            if(offlineService.isOfflineApp()){
                return offlinePatientService.create(data);
            }
            var url = baseOpenMRSRESTURL + "/patientprofile";
            var config = {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            };
            return $http.post(url, data, config);
        };

        var update = function (patient, openMRSPatient) {
            if(offlineService.isOfflineApp()){
                var data = new Bahmni.Registration.CreatePatientRequestMapper(moment()).mapFromPatient($rootScope.patientConfiguration.attributeTypes, patient);
                return offlinePatientService.update(data);
            }
            var data = new Bahmni.Registration.UpdatePatientRequestMapper(moment()).mapFromPatient($rootScope.patientConfiguration.attributeTypes, openMRSPatient, patient);
            var url = baseOpenMRSRESTURL + "/patientprofile/" + openMRSPatient.uuid;
            var config = {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            };
            var deferred = $q.defer();
             $http.post(url, data, config).success(function(result){
                deferred.resolve(result);
            });
            return deferred.promise;
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
