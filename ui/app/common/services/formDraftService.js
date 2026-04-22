'use strict';

angular.module('bahmni.common.services')
    .factory('formDraftService', ['$http', function ($http) {
        var formDraftUrl = Bahmni.Common.Constants.RESTWS_V1 + '/bahmnicore/formdraft';

        var saveDraft = function (patientUuid, providerUuid, formData) {
            return $http.post(formDraftUrl, {
                patientUuid: patientUuid,
                providerUuid: providerUuid,
                formData: formData
            });
        };

        var getDraft = function (patientUuid, providerUuid) {
            return $http.get(formDraftUrl, {
                params: {
                    patientUuid: patientUuid,
                    providerUuid: providerUuid
                },
                suppressError: true
            });
        };

        var discardDraft = function (patientUuid, providerUuid) {
            return $http.delete(formDraftUrl, {
                params: {
                    patientUuid: patientUuid,
                    providerUuid: providerUuid
                },
                suppressError: true
            });
        };

        var markDraftAsSaved = function (patientUuid, providerUuid) {
            return $http.patch(formDraftUrl, {}, {
                params: {
                    patientUuid: patientUuid,
                    providerUuid: providerUuid
                },
                suppressError: true
            });
        };

        return {
            saveDraft: saveDraft,
            getDraft: getDraft,
            discardDraft: discardDraft,
            markDraftAsSaved: markDraftAsSaved
        };
    }]);
