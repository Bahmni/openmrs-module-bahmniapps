'use strict';
angular.module('bahmni.common.services')
    .factory('drugService', ['$http', function ($http) {
        var v = 'custom:(uuid,strength,drugReferenceMaps,name,dosageForm,concept:(uuid,name,names:(name)))';
        var search = function (drugName, conceptUuid) {
            var params = {
                v: v,
                q: drugName,
                conceptUuid: conceptUuid,
                s: "ordered"
            };
            return $http.get(Bahmni.Common.Constants.drugUrl, {
                method: "GET",
                params: params,
                withCredentials: true
            }).then(function (response) {
                return response.data.results;
            });
        };

        var getSetMembersOfConcept = function (conceptSetFullySpecifiedName, searchTerm) {
            return $http.get(Bahmni.Common.Constants.drugUrl, {
                method: "GET",
                params: {
                    v: v,
                    q: conceptSetFullySpecifiedName,
                    s: "byConceptSet",
                    searchTerm: searchTerm
                },
                withCredentials: true
            }).then(function (response) {
                return response.data.results;
            });
        };

        var getRegimen = function (patientUuid, patientProgramUuid, drugs) {
            var params = {
                patientUuid: patientUuid,
                patientProgramUuid: patientProgramUuid,
                drugs: drugs
            };

            return $http.get(Bahmni.Common.Constants.bahmniRESTBaseURL + "/drugOGram/regimen", {
                params: params,
                withCredentials: true
            });
        };

        var sendDiagnosisDrugBundle = function (bundle) {
            return $http.post(Bahmni.Common.Constants.cdssUrl, bundle, {
                withCredentials: true,
                params: { service: 'medication-order-select' }
            });
        };

        var cdssAudit = function (patientUuid, eventType, message, module) {
            var alertData = {
                patientUuid: patientUuid,
                eventType: eventType,
                message: message,
                module: module
            };
            return $http.post(Bahmni.Common.Constants.auditLogUrl, alertData, {
                withCredentials: true
            });
        };

        var getDrugConceptSourceMapping = function (drugUuid) {
            var params = {
                _id: drugUuid
            };

            return $http.get(Bahmni.Common.Constants.fhirMedicationsUrl, {
                params: params,
                withCredentials: true
            });
        };
        var getCdssEnabled = function () {
            return $http.get(Bahmni.Common.Constants.globalPropertyUrl, {
                method: "GET",
                params: {
                    property: 'cdss.enable'
                },
                withCredentials: true
            });
        };

        return {
            search: search,
            getRegimen: getRegimen,
            getSetMembersOfConcept: getSetMembersOfConcept,
            sendDiagnosisDrugBundle: sendDiagnosisDrugBundle,
            getDrugConceptSourceMapping: getDrugConceptSourceMapping,
            getCdssEnabled: getCdssEnabled,
            cdssAudit: cdssAudit
        };
    }]);
