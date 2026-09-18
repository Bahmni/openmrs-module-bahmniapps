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

        var saveDraft = function (patientUuid, formData) {
            return $http.post(formDraftUrl, {
                patientUuid: patientUuid,
                formData: formData
            }).then(function (response) {
                notifyDraftChange();
                return response;
            });
        };
        var inFlightDraft = null;

        var getDraft = function (patientUuid) {
            var key = patientUuid;
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
                    patientUuid: patientUuid
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

        var getResumableDraft = function (patientUuid) {
            return getDraft(patientUuid).then(function (response) {
                var draft = response && response.data;
                return (draft && draft.uuid && !draft.markedAsSaved) ? draft : null;
            }, function () {
                return null;
            });
        };

        var hasDraftsForProvider = function () {
            return $http.get(formDraftUrl + '/list', {
                suppressError: true
            }).then(function (response) {
                return !!(response.data && response.data.length > 0);
            }, function () {
                return false;
            });
        };

        var getProviderDrafts = function () {
            return $http.get(formDraftUrl + '/list', {
                suppressError: true
            }).then(function (response) {
                return response.data;
            }, function () {
                return [];
            });
        };

        var discardDraft = function (patientUuid) {
            if (!patientUuid) {
                return;
            }
            return $http.delete(formDraftUrl, {
                params: {
                    patientUuid: patientUuid
                },
                suppressError: true
            }).then(function (response) {
                notifyDraftChange();
                return response;
            });
        };

        var markDraftAsSaved = function (patientUuid) {
            return $http.patch(formDraftUrl, {}, {
                params: {
                    patientUuid: patientUuid
                },
                suppressError: true
            }).then(function (response) {
                notifyDraftChange();
                return response;
            });
        };

        var getDiscardOnSaveConfig = function () {
            return $http.get(Bahmni.Common.Constants.globalPropertyUrl, {
                params: { property: 'bahmni.formDraft.discardOnSave' },
                suppressError: true,
                transformResponse: [function (data) {
                    return data;
                }]
            }).then(function (response) {
                return response.data === 'true';
            }, function () {
                return false;
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
            getDiscardOnSaveConfig: getDiscardOnSaveConfig,
            parseDraftObs: parseDraftObs,
            getFormNamesFromDraft: getFormNamesFromDraft,
            hasDraftsForProvider: hasDraftsForProvider,
            getProviderDrafts: getProviderDrafts
        };
    }]);
