'use strict';

angular.module('bahmni.common.services')
    .factory('formDraftService', ['$http', '$window', function ($http, $window) {
        var formDraftUrl = Bahmni.Common.Constants.RESTWS_V1 + '/bahmnicore/formdraft';
        var DRAFT_UPDATES_CHANNEL = 'bahmni-draft-indicator-update';

        function notifyDraftChange () {
            if (angular.isUndefined($window.BroadcastChannel)) {
                return;
            }
            try {
                var channel = new $window.BroadcastChannel(DRAFT_UPDATES_CHANNEL);
                channel.postMessage({type: 'drafts-changed'});
                channel.close();
            } catch (e) { /* unsupported environment */ }
        }

        var saveDraft = function (patientUuid, providerUuid, formData) {
            return $http.post(formDraftUrl, {
                patientUuid: patientUuid,
                providerUuid: providerUuid,
                formData: formData
            }).then(function (response) {
                notifyDraftChange();
                return response;
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
            if (!patientUuid || !providerUuid) {
                return;
            }
            return $http.delete(formDraftUrl, {
                params: {
                    patientUuid: patientUuid,
                    providerUuid: providerUuid
                },
                suppressError: true
            }).then(function (response) {
                notifyDraftChange();
                return response;
            });
        };

        var markDraftAsSaved = function (patientUuid, providerUuid) {
            return $http.patch(formDraftUrl, {}, {
                params: {
                    patientUuid: patientUuid,
                    providerUuid: providerUuid
                },
                suppressError: true
            }).then(function (response) {
                notifyDraftChange();
                return response;
            });
        };

        var parseDraftObs = function (draftData) {
            if (draftData && draftData.uuid && !draftData.markedAsSaved && draftData.formData) {
                try {
                    return angular.fromJson(draftData.formData);
                } catch (e) { /* ignore */ }
            }
            return [];
        };

        var getFormNamesFromDraft = function (draftData) {
            return _.uniq(_.compact(_.map(
                _.filter(parseDraftObs(draftData), function (obs) {
                    return obs.formNamespace === 'Bahmni' && obs.formFieldPath;
                }),
                function (obs) { return obs.formFieldPath.split('.')[0]; }
            )));
        };

        return {
            saveDraft: saveDraft,
            getDraft: getDraft,
            discardDraft: discardDraft,
            markDraftAsSaved: markDraftAsSaved,
            parseDraftObs: parseDraftObs,
            getFormNamesFromDraft: getFormNamesFromDraft
        };
    }]);
