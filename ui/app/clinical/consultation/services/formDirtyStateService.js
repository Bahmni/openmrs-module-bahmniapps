'use strict';

angular.module('bahmni.clinical')
    .factory('formDirtyStateService', [function () {
        /**
         * Recursively collects observation values from an obs tree.
         * Handles multiSelect fields, group members, and scalar values.
         * Ignores Angular $-prefixed keys.
         */
        var collectObsValues = function (obs, values) {
            if (!obs) {
                return;
            }
            if (obs.isMultiSelect) {
                var selectedKeys = _.keys(obs.selectedObs || {}).filter(function (k) {
                    return k.indexOf('$') !== 0;
                });
                if (selectedKeys.length > 0) {
                    values.push(selectedKeys.sort());
                }
                return;
            }
            if (obs.groupMembers && obs.groupMembers.length > 0) {
                _.each(obs.groupMembers, function (member) {
                    collectObsValues(member, values);
                });
                return;
            }
            if (obs.value !== null && obs.value !== undefined) {
                var val = obs.value;
                if (val && typeof val === 'object' && val.uuid) {
                    values.push(val.uuid);
                } else {
                    values.push(val);
                }
            }
        };

        /**
         * Extracts observations from a template, handling both
         * Form2/React components (via getValue()) and traditional templates.
         */
        var getTemplateObservationsForDirtyTracking = function (template) {
            if (template.component && angular.isFunction(template.component.getValue)) {
                var formValue = template.component.getValue() || {};
                if (formValue.observations && formValue.observations.length > 0) {
                    return formValue.observations;
                }
            }
            return template.observations || [];
        };

        var getObsValuesForTemplate = function (template) {
            var values = [];
            var observations = getTemplateObservationsForDirtyTracking(template);
            _.each(observations, function (obs) {
                collectObsValues(obs, values);
            });
            return angular.toJson(values);
        };

        /**
         * Returns a JSON string representing all observation values across all templates.
         * This is the "clean state" baseline for dirty tracking.
         */
        var getObsValues = function (selectedObsTemplates) {
            var values = [];
            if (selectedObsTemplates) {
                _.each(selectedObsTemplates, function (template) {
                    var observations = getTemplateObservationsForDirtyTracking(template);
                    if (observations.length > 0) {
                        _.each(observations, function (obs) {
                            collectObsValues(obs, values);
                        });
                    }
                });
            }
            return angular.toJson(values);
        };

        /**
         * Syncs Form2/React component observations into the Angular model.
         * Called during $evalAsync to pull component state into the digest cycle.
         */
        var syncForm2Observations = function (observationForms) {
            if (observationForms) {
                _.each(observationForms, function (form) {
                    if (form.component && angular.isFunction(form.component.getValue)) {
                        var formValue = form.component.getValue() || {};
                        if (formValue.observations) {
                            var newObsJson = angular.toJson(formValue.observations);
                            var oldObsJson = angular.toJson(form.observations || []);
                            if (newObsJson !== oldObsJson) {
                                form.observations = formValue.observations;
                            }
                        }
                    }
                });
            }
        };

        /**
         * Registers DOM capture-phase listeners for Form2/React interactions.
         * Returns a state object for later deregistration.
         */
        var registerForm2SyncListeners = function (onSyncCallback) {
            var form2SyncEvents = ['input', 'change', 'keyup', 'click'];
            var doc = window.document;
            if (!doc || !doc.addEventListener) {
                return {listener: null, registered: false};
            }

            var syncOnForm2Interaction = function () {
                onSyncCallback();
            };

            _.each(form2SyncEvents, function (eventName) {
                doc.addEventListener(eventName, syncOnForm2Interaction, true);
            });

            return {
                listener: syncOnForm2Interaction,
                events: form2SyncEvents,
                registered: true
            };
        };

        /**
         * Removes DOM listeners registered by registerForm2SyncListeners.
         */
        var unregisterForm2SyncListeners = function (listenerState) {
            var doc = window.document;
            if (listenerState && listenerState.registered && doc && doc.removeEventListener && listenerState.listener) {
                _.each(listenerState.events, function (eventName) {
                    doc.removeEventListener(eventName, listenerState.listener, true);
                });
            }
        };

        /**
         * Serializes all observations from selectedObsTemplates into a JSON string.
         * Used to create the draft POST payload.
         */
        var serializeFormData = function (selectedObsTemplates) {
            var observations = [];
            if (selectedObsTemplates) {
                _.each(selectedObsTemplates, function (template) {
                    var templateObs = getTemplateObservationsForDirtyTracking(template);
                    observations = observations.concat(templateObs);
                });
            }
            return angular.toJson(observations);
        };

        /**
         * Deep-merges a single draft observation onto the live template observation.
         * Handles value, comment, isMultiSelect/selectedObs, and recursive groupMembers.
         */
        var populateObservationValues = function (templateObs, draftObs) {
            if (!templateObs || !draftObs) {
                return;
            }

            if (draftObs.value !== undefined && draftObs.value !== null) {
                templateObs.value = draftObs.value;
            }
            if (draftObs.comment) {
                templateObs.comment = draftObs.comment;
            }
            if (draftObs.isMultiSelect && draftObs.selectedObs) {
                templateObs.selectedObs = angular.copy(draftObs.selectedObs);
            }
            if (draftObs.groupMembers && draftObs.groupMembers.length > 0 &&
                templateObs.groupMembers && templateObs.groupMembers.length > 0) {
                _.each(draftObs.groupMembers, function (draftMember) {
                    var matchedMember = _.find(templateObs.groupMembers, function (templateMember) {
                        return templateMember.concept && draftMember.concept &&
                               templateMember.concept.uuid === draftMember.concept.uuid;
                    });
                    if (matchedMember) {
                        populateObservationValues(matchedMember, draftMember);
                    }
                });
            }
        };

        /**
         * Parses serialized draft data and merges observations onto selectedObsTemplates.
         * Returns a result object {success: bool, error?: string}.
         * The caller is responsible for writing to $scope.formDraft.*.
         */
        var populateFormWithDraftData = function (draftFormData, selectedObsTemplates) {
            try {
                var draftData = angular.fromJson(draftFormData);
                if (!selectedObsTemplates || !draftData) {
                    return {success: false, error: 'Missing data'};
                }

                var updatedTemplates = [];
                _.each(draftData, function (draftObs) {
                    _.each(selectedObsTemplates, function (template) {
                        var templateObs = getTemplateObservationsForDirtyTracking(template);
                        if (templateObs && templateObs.length > 0) {
                            var templateUpdated = false;
                            _.each(templateObs, function (templateMember) {
                                if (templateMember.concept && draftObs.concept &&
                                    templateMember.concept.uuid === draftObs.concept.uuid) {
                                    populateObservationValues(templateMember, draftObs);
                                    templateUpdated = true;
                                }
                            });
                            if (templateUpdated && updatedTemplates.indexOf(template) === -1) {
                                updatedTemplates.push(template);
                            }
                        }
                    });
                });

                return {success: true, updatedTemplates: updatedTemplates};
            } catch (e) {
                return {success: false, error: e.message};
            }
        };

        return {
            collectObsValues: collectObsValues,
            getObsValues: getObsValues,
            getObsValuesForTemplate: getObsValuesForTemplate,
            getTemplateObservationsForDirtyTracking: getTemplateObservationsForDirtyTracking,
            syncForm2Observations: syncForm2Observations,
            registerForm2SyncListeners: registerForm2SyncListeners,
            unregisterForm2SyncListeners: unregisterForm2SyncListeners,
            serializeFormData: serializeFormData,
            populateObservationValues: populateObservationValues,
            populateFormWithDraftData: populateFormWithDraftData
        };
    }]);
