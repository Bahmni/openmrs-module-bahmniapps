'use strict';

angular.module('bahmni.clinical')
    .factory('formDirtyStateService', ['$timeout', function ($timeout) {
        var form2State = {interacted: false, syncTimeout: null};

        var normalizeObsValue = function (value) {
            if (value === null || value === undefined) {
                return value;
            }
            if (typeof value === 'object') {
                if (value.uuid) {
                    return value.uuid;
                }

                if (value.value !== undefined && value.value !== null) {
                    return normalizeObsValue(value.value);
                }

                try {
                    return angular.toJson(value);
                } catch (e) {
                    return value;
                }
            }
            if (angular.isNumber(value)) {
                return String(value);
            }
            return value;
        };

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
                if (obs.voided) {
                    values.push(null);
                    return;
                }
                values.push(normalizeObsValue(obs.value));
            }
        };

        var getTemplateObservationsForDirtyTracking = function (template) {
            if (template.component && angular.isFunction(template.component.getValue)) {
                try {
                    var formValue = template.component.getValue() || {};
                    var componentObs = formValue.observations || [];
                    if (componentObs && componentObs.length > 0) {
                        return componentObs;
                    }
                } catch (e) { }
            }
            var templateObs = template.observations || [];
            if (templateObs.length > 0) {
                return templateObs;
            }

            return [];
        };

        var getObsValuesForTemplate = function (template) {
            var values = [];
            var observations = getTemplateObservationsForDirtyTracking(template);
            _.each(observations, function (obs) {
                collectObsValues(obs, values);
            });
            values = _.sortBy(values, function (v) { return String(v); });
            return angular.toJson(values);
        };

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
            values = _.sortBy(values, function (v) { return String(v); });
            return angular.toJson(values);
        };

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

        var registerForm2SyncListeners = function (onSyncCallback) {
            var form2SyncEvents = ['input', 'change', 'keyup', 'click'];
            var doc = window.document;
            if (!doc || !doc.addEventListener) {
                return {listener: null, registered: false};
            }

            var syncOnForm2Interaction = function () {
                form2State.interacted = true;
                if (form2State.syncTimeout) {
                    $timeout.cancel(form2State.syncTimeout);
                }
                form2State.syncTimeout = $timeout(function () {
                    form2State.syncTimeout = null;
                    onSyncCallback();
                }, 0);
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

        var unregisterForm2SyncListeners = function (listenerState) {
            if (form2State.syncTimeout) {
                $timeout.cancel(form2State.syncTimeout);
                form2State.syncTimeout = null;
            }
            var doc = window.document;
            if (listenerState && listenerState.registered && doc && doc.removeEventListener && listenerState.listener) {
                _.each(listenerState.events, function (eventName) {
                    doc.removeEventListener(eventName, listenerState.listener, true);
                });
            }
        };

        var hasForm2Interaction = function () {
            return form2State.interacted;
        };

        var resetForm2Interaction = function () {
            form2State.interacted = false;
        };

        var isRealTemplateChange = function (template, cachedVal, currentVal) {
            if (currentVal === cachedVal) {
                return false;
            }
            if (cachedVal === angular.toJson([]) && template.component && !form2State.interacted) {
                return false;
            }
            return true;
        };

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
        var persistentBaseline = {};

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

        var setPersistentBaseline = function (patientUuid, cleanState, cleanStateExtras) {
            if (patientUuid) {
                persistentBaseline[patientUuid] = {
                    cleanState: cleanState,
                    extraObservations: cleanStateExtras
                };
            }
        };
        var getPersistentBaseline = function (patientUuid) {
            return (patientUuid && persistentBaseline[patientUuid]) ? persistentBaseline[patientUuid] : null;
        };

        var clearPersistentBaseline = function (patientUuid) {
            if (patientUuid) {
                delete persistentBaseline[patientUuid];
            }
        };

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
            hasForm2Interaction: hasForm2Interaction,
            resetForm2Interaction: resetForm2Interaction,
            isRealTemplateChange: isRealTemplateChange,
            serializeFormData: serializeFormData,
            populateObservationValues: populateObservationValues,
            populateFormWithDraftData: populateFormWithDraftData,
            setPersistentBaseline: setPersistentBaseline,
            getPersistentBaseline: getPersistentBaseline,
            clearPersistentBaseline: clearPersistentBaseline
        };
    }]);
