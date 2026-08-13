'use strict';

angular.module('bahmni.common.services')
    .factory('formDraftService', ['$http', '$window', '$q', function ($http, $window, $q) {
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
        var inFlightDraft = null;

        var getDraft = function (patientUuid, providerUuid) {
            var key = patientUuid + ':' + providerUuid;
            if (inFlightDraft && inFlightDraft.key === key) {
                return inFlightDraft.promise;
            }
            var clearInFlight = function () {
                if (inFlightDraft && inFlightDraft.key === key) {
                    inFlightDraft = null;
                }
            };
            var promise = $http.get(formDraftUrl, {
                params: {
                    patientUuid: patientUuid,
                    providerUuid: providerUuid
                },
                suppressError: true
            }).then(function (response) {
                clearInFlight();
                return response;
            }, function (error) {
                clearInFlight();
                return $q.reject(error);
            });
            inFlightDraft = {key: key, promise: promise};
            return promise;
        };

        var getResumableDraft = function (patientUuid, providerUuid) {
            return getDraft(patientUuid, providerUuid).then(function (response) {
                var draft = response && response.data;
                return (draft && draft.uuid && !draft.markedAsSaved) ? draft : null;
            }, function () {
                return null;
            });
        };

        var hasDraftsForProvider = function (providerUuid) {
            if (!providerUuid) {
                return $q.when(false);
            }
            return $http.get(formDraftUrl + '/list', {
                params: {
                    providerUuid: providerUuid
                },
                suppressError: true
            }).then(function (response) {
                return !!(response.data && response.data.length > 0);
            }, function () {
                return false;
            });
        };

        var getProviderDrafts = function (providerUuid) {
            if (!providerUuid) {
                return $q.when([]);
            }
            return $http.get(formDraftUrl + '/list', {
                params: {
                    providerUuid: providerUuid
                },
                suppressError: true
            }).then(function (response) {
                return response.data;
            }, function () {
                return [];
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
                    var parsed = angular.fromJson(draftData.formData);
                    if (angular.isString(parsed)) {
                        parsed = angular.fromJson(parsed);
                    }
                    if (angular.isArray(parsed)) {
                        return parsed;
                    }
                    console.warn('formDraftService: draft formData is not an observation array', draftData.uuid);
                } catch (e) {
                    console.warn('formDraftService: could not parse draft formData', draftData.uuid, e.message);
                }
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
            getResumableDraft: getResumableDraft,
            discardDraft: discardDraft,
            markDraftAsSaved: markDraftAsSaved,
            parseDraftObs: parseDraftObs,
            getFormNamesFromDraft: getFormNamesFromDraft,
            hasDraftsForProvider: hasDraftsForProvider,
            getProviderDrafts: getProviderDrafts
        };
    }]);
