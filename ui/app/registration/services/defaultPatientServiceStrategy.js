'use strict';

angular.module('bahmni.registration')
    .service('patientServiceStrategy', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {
        var openmrsUrl = Bahmni.Registration.Constants.openmrsUrl;
        var baseOpenMRSRESTURL = Bahmni.Registration.Constants.baseOpenMRSRESTURL;
        var otpServiceUrl = Bahmni.Registration.Constants.otpServiceUrl;

        var search = function (config) {
            var defer = $q.defer();
            var patientSearchUrl = Bahmni.Common.Constants.bahmniSearchUrl + "/patient";
            if (config && config.params.identifier) {
                patientSearchUrl = Bahmni.Common.Constants.bahmniSearchUrl + "/patient/lucene";
            }
            var onResults = function (result) {
                defer.resolve(result);
            };
            $http.get(patientSearchUrl, config).success(onResults)
                .error(function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };

        var getByUuid = function (uuid) {
            var url = openmrsUrl + "/ws/rest/v1/patientprofile/" + uuid;
            var config = {
                method: "GET",
                params: {v: "full"},
                withCredentials: true
            };

            var defer = $q.defer();
            $http.get(url, config).success(function (result) {
                defer.resolve(result);
            });
            return defer.promise;
        };

        var create = function (patient, jumpAccepted) {
            var data = new Bahmni.Registration.CreatePatientRequestMapper(moment()).mapFromPatient($rootScope.patientConfiguration.attributeTypes, patient);
            var url = baseOpenMRSRESTURL + "/bahmnicore/patientprofile";
            return $http.post(url, data, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json", "Jump-Accepted": jumpAccepted}
            });
        };

        var update = function (patient, openMRSPatient, attributeTypes) {
            var deferred = $q.defer();
            var data = new Bahmni.Registration.UpdatePatientRequestMapper(moment()).mapFromPatient(attributeTypes, openMRSPatient, patient);
            var url = baseOpenMRSRESTURL + "/bahmnicore/patientprofile/" + openMRSPatient.uuid;
            var config = {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            };
            $http.post(url, data, config).then(function (result) {
                deferred.resolve(result);
            }, function (reason) {
                deferred.resolve(reason);
            });
            return deferred.promise;
        };

        var generateIdentifier = function (patient) {
            var data = {"identifierSourceName": patient.identifierPrefix ? patient.identifierPrefix.prefix : ""};
            var url = openmrsUrl + "/ws/rest/v1/idgen";
            var config = {
                withCredentials: true,
                headers: {"Accept": "text/plain", "Content-Type": "application/json"}
            };
            return $http.post(url, data, config);
        };

        const serializeData = function (data) {
            const buffer = [];
            for (let name in data) {
                if (!data.hasOwnProperty(name)) {
                    continue;
                }
                const value = data[ name ];
                buffer.push(
                    encodeURIComponent(name) +
                    "=" +
                    encodeURIComponent((value == null) ? "" : value)
                );
            }
            const source = buffer
                .join("&")
                .replace(/%20/g, "+")
            ;
            return (source);
        };

        const smsAlert = function (patient) {
            console.log("in smsalert");
            const url = otpServiceUrl + "/notificaion/sms";
            const data = {"phoneNumber": patient.phoneNumber, "message": "Welcome to Bahmni", "originator": "Bahmni"};
            const config = {
                withCredentials: true,
                headers: {"Content-Type": "application/x-www-form-urlencoded"}
            };
            return $http.post(url, serializeData(data), config);
        };

        return {
            search: search,
            get: getByUuid,
            create: create,
            update: update,
            generateIdentifier: generateIdentifier,
            smsAlert: smsAlert
        };
    }]);
