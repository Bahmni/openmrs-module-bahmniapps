'use strict';

angular.module('bahmni.common.displaycontrol.observation')
    .service('formRecordTreeBuildService', ['formService', '$window', function (formService, $window) {
        var self = this;
        self.formBuildFroms = [];
        self.build = function (bahmniObservations, hasNoHierarchy) {
            _.forEach(bahmniObservations, function (obs) {
                obs.value = self.preProcessMultiSelectObs(obs.value);
            });

            if (!hasNoHierarchy) {
                formService.getAllForms().then(function (response) {
                    var formBuildFroms = response.data;
                    // This block builds hierarchy for the passed bahmniObservations
                    var obs = self.createObsGroupForForm(bahmniObservations, formBuildFroms);
                    updateObservationsWithFormDefinition(obs, formBuildFroms);
                });
            }
        };

        self.createMultiSelectObservation = function (observations) {
            var multiSelectObject = new Bahmni.Common.Obs.MultiSelectObservation(observations, {multiSelect: true});
            multiSelectObject.formFieldPath = observations[0].formFieldPath;
            multiSelectObject.encounterUuid = observations[0].encounterUuid;
            return multiSelectObject;
        };

        self.preProcessMultiSelectObs = function (value) {
            var clonedGroupMembers = _.cloneDeep(value);
            _.forEach(clonedGroupMembers, function (member) {
                if (member && member.groupMembers.length === 0) {
                    var obsWithSameFormFieldPath = self.getRecordObservations(member.formFieldPath, value);
                    if (obsWithSameFormFieldPath.length > 1) {
                        var multiSelectObject = self.createMultiSelectObservation(obsWithSameFormFieldPath);
                        value.push(multiSelectObject);
                    } else if (obsWithSameFormFieldPath.length === 1) {
                        value.push(obsWithSameFormFieldPath[0]);
                    }
                } else if (member.groupMembers.length > 0) {
                    var obsGroups = self.getRecordObservations(member.formFieldPath, value);
                    _.forEach(obsGroups, function (obsGroup) {
                        obsGroup.groupMembers = self.preProcessMultiSelectObs(obsGroup.groupMembers);
                        value.push(obsGroup);
                    });
                }
            });
            return value;
        };

        self.createObsGroupForForm = function (observations, formBuilderFroms) {
            _.forEach(observations, function (obs) {
                var newValues = [];
                _.forEach(obs.value, function (value) {
                    if (!value.formFieldPath) {
                        newValues.push(value);
                        return;
                    }
                    var obsGroup = {
                        "groupMembers": [],
                        "concept": {
                            "shortName": "",
                            "conceptClass": null
                        },
                        "encounterUuid": ""

                    };
                    var formName = value.formFieldPath.split('.')[0];
                    var formBuilderForm = formBuilderFroms.find(function (form) { return form.name ===
                        formName; });
                    obsGroup.concept.shortName = formName;
                    var locale = localStorage.getItem("NG_TRANSLATE_LANG_KEY") || "en";
                    var formNameTranslations = formBuilderForm && formBuilderForm.nameTranslation
                        ? JSON.parse(formBuilderForm.nameTranslation) : [];
                    if (formNameTranslations.length > 0) {
                        var currentLabel = formNameTranslations
                            .find(function (formNameTranslation) {
                                return formNameTranslation.locale === locale;
                            });
                        if (currentLabel) {
                            obsGroup.concept.shortName = currentLabel.display;
                        }
                    }
                    obsGroup.encounterUuid = value.encounterUuid;
                    var previousObsGroupFound;
                    _.forEach(newValues, function (newValue) {
                        if (obsGroup.concept.shortName === newValue.concept.shortName) {
                            newValue.groupMembers.push(value);
                            previousObsGroupFound = true;
                        }
                    });
                    if (previousObsGroupFound) {
                        return;
                    }
                    obsGroup.groupMembers.push(value);
                    newValues.push(obsGroup);
                });
                obs.value = newValues;
            });
            return observations;
        };

        var updateObservationsWithFormDefinition = function (observations, formBuildFroms) {
            var allForms = formBuildFroms;
            _.forEach(observations, function (observation) {
                var forms = [];
                _.forEach(observation.value, function (form) {
                    if (form.concept.conceptClass) {
                        forms.push(form);
                        return;
                    }
                    var observationForm = self.getFormByFormName(allForms, self.getFormName(form.groupMembers), self.getFormVersion(form.groupMembers));
                    if (!observationForm) {
                        return;
                    }
                    formService.getFormDetail(observationForm.uuid, {v: "custom:(resources:(value))"}).then(function (response) {
                        var formDetailsAsString = _.get(response, 'data.resources[0].value');
                        if (formDetailsAsString) {
                            var formDef = JSON.parse(formDetailsAsString);
                            formDef.version = observationForm.version;
                            var locale = $window.localStorage["NG_TRANSLATE_LANG_KEY"] || "en";
                            return formService.getFormTranslate(formDef.name, formDef.version, locale, formDef.uuid)
                                .then(function (response) {
                                    var translationData = response.data;
                                    forms.push(self.updateObservationsWithRecordTree(formDef, form, translationData));
                                    observation.value = forms;
                                });
                        }
                        observation.value = forms;
                    });
                });
            });
        };

        self.getFormByFormName = function (formList, formName, formVersion) {
            return _.find(formList, function (form) {
                return form.name === formName && form.version === formVersion;
            });
        };

        self.getFormName = function (members) {
            var member = _.find(members, function (member) {
                return member.formFieldPath !== null;
            });
            return member ? member.formFieldPath.split('.')[0] : undefined;
        };

        self.getFormVersion = function (members) {
            var member = _.find(members, function (member) {
                return member.formFieldPath !== null;
            });
            return member ? member.formFieldPath.split('.')[1].split('/')[0] : undefined;
        };

        self.updateObservationsWithRecordTree = function (formDef, form, translationData) {
            var recordTree = getRecordTree(formDef, form.groupMembers);
            recordTree = JSON.parse(JSON.stringify(recordTree));
            self.createGroupMembers(recordTree, form, form.groupMembers, translationData);
            return form;
        };

        self.createColumnGroupsForTable = function (record, columns, tableGroup, obsList, translationData) {
            _.forEach(columns, function (column, index) {
                var obsGroup = {
                    "groupMembers": [],
                    "concept": {
                        "shortName": "",
                        "conceptClass": null
                    }
                };
                var translationKey = column.translationKey;
                var defaultShortName = column.value;
                obsGroup.concept.shortName = self.getTranslatedShortName(translationData, translationKey, obsGroup, defaultShortName);
                var columnRecord = self.getColumnObs(index, record);
                column.children = columnRecord;
                self.createGroupMembers(column, obsGroup, obsList, translationData);
                if (obsGroup.groupMembers.length > 0) {
                    tableGroup.groupMembers.push(obsGroup);
                }
            });
        };

        self.getTranslatedShortName = function (translationData, translationKey, obsGroup, defaultShortName) {
            if (self.isTranslationKeyPresent(translationData, translationKey)) {
                return translationData.labels[translationKey][0];
            }
            return defaultShortName;
        };

        self.isTranslationKeyPresent = function (translationData, translationKey) {
            return translationData && translationData.labels &&
                translationData.labels[translationKey][0] !== translationKey;
        };

        self.getColumnObs = function (columnIndex, record) {
            var columnChildren = [];
            _.map(record.children, function (child) {
                if (child.control.properties && child.control.properties.location.column === columnIndex) {
                    columnChildren.push(child);
                }
            });
            return columnChildren;
        };

        self.createGroupMembers = function (recordTree, obsGroup, obsList, translationData) {
            _.forEach(recordTree.children, function (record) {
                if (record.control.type === 'obsControl' || record.control.type === 'obsGroupControl') {
                    var recordObservations = self.getRecordObservations(record.formFieldPath, obsList);
                    _.forEach(recordObservations, function (recordObservation) {
                        obsGroup.groupMembers.push(recordObservation);
                    });
                }
                else if (record.control.type === 'section') {
                    var sectionGroup = self.createObsGroup(record, translationData);
                    self.createGroupMembers(record, sectionGroup, obsList, translationData);
                    if (sectionGroup.groupMembers.length > 0) {
                        obsGroup.groupMembers.push(sectionGroup);
                    }
                }
                else if (record.control.type === "table") {
                    var tableGroup = self.createObsGroup(record, translationData);
                    var columns = record.control.columnHeaders;
                    self.createColumnGroupsForTable(record, columns, tableGroup, obsList, translationData);
                    if (tableGroup.groupMembers.length > 0) {
                        obsGroup.groupMembers.push(tableGroup);
                    }
                }
            });
        };

        self.getTableColumns = function (record) {
            return _.filter(record.control.columnHeaders, function (child) {
                return child.type === "label";
            });
        };

        self.getRecordObservations = function (obsFormFieldPath, obsList) {
            return _.remove(obsList, function (obs) {
                return obs.formFieldPath && obs.formFieldPath === obsFormFieldPath;
            });
        };

        self.createObsGroup = function (record, translationData) {
            var obsGroup = {
                "groupMembers": [],
                "concept": {
                    "shortName": "",
                    "conceptClass": null
                }
            };
            var translationKey = record.control.label.translationKey;
            var defaultShortName = record.control.label.value;
            obsGroup.concept.shortName =
                self.getTranslatedShortName(translationData, translationKey, obsGroup, defaultShortName);
            return obsGroup;
        };
    }]);
