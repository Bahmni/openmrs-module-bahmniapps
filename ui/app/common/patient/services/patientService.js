'use strict';

angular.module('bahmni.common.patient')
    .service('patientService', ['$http', 'sessionService', function ($http, sessionService) {
        this.getPatient = function (uuid) {
            var patient = $http.get(Bahmni.Common.Constants.openmrsUrl + "/ws/rest/v1/patient/" + uuid, {
                method: "GET",
                params: { v: "full" },
                withCredentials: true
            });
            return patient;
        };

        this.getRelationships = function (patientUuid) {
            return $http.get(Bahmni.Common.Constants.openmrsUrl + "/ws/rest/v1/relationship", {
                method: "GET",
                params: { person: patientUuid, v: "full" },
                withCredentials: true
            });
        };

        this.getVisits = function (patientUuid) {
            return $http.get(Bahmni.Common.Constants.openmrsUrl + "/ws/rest/v1/visit", {
                method: "GET",
                params: { patient: patientUuid, v: "full" },
                withCredentials: true
            });
        };

        this.findPatients = function (params) {
            return $http.get(Bahmni.Common.Constants.sqlUrl, {
                method: "GET",
                params: params,
                withCredentials: true
            });
        };

        this.search = function (query, offset, identifier) {
            offset = offset || 0;
            return $http.get(Bahmni.Common.Constants.bahmniSearchUrl + "/patient", {
                method: "GET",
                params: {
                    q: query,
                    startIndex: offset,
                    identifier: identifier,
                    loginLocationUuid: sessionService.getLoginLocationUuid()
                },
                withCredentials: true
            });
        };

        this.getPatientContext = function (patientUuid, programUuid, personAttributes, programAttributes, patientIdentifiers) {
            return $http.get('/openmrs/ws/rest/v1/bahmnicore/patientcontext', {
                params: {
                    patientUuid: patientUuid,
                    programUuid: programUuid,
                    personAttributes: personAttributes,
                    programAttributes: programAttributes,
                    patientIdentifiers: patientIdentifiers
                },
                withCredentials: true
            });
        };

        this.patientFirstPcrTestResult = function (uuid) {
            return $http.get(Bahmni.Common.Constants.observationsUrl, {
                params: {
                    concept: Bahmni.Common.Constants.patientFirstPcrTestResult,
                    patientUuid: uuid
                },
                withCredentials: true
            });
        };

        this.patientSecondPcrTestResult = function (uuid) {
            return $http.get(Bahmni.Common.Constants.observationsUrl, {
                params: {
                    concept: Bahmni.Common.Constants.patientSecondPcrTestResult,
                    patientUuid: uuid
                },
                withCredentials: true
            });
        };

        this.patientRepeatPcrTestResult = function (uuid) {
            return $http.get(Bahmni.Common.Constants.observationsUrl, {
                params: {
                    concept: Bahmni.Common.Constants.patientRepeatPCRResult,
                    patientUuid: uuid
                },
                withCredentials: true
            });
        };
    }]);
