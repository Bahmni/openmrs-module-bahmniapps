'use strict';

angular.module('bahmni.common.displaycontrol.observation')
    .service('formRecordTreeBuildService', ['formService', function (formService) {
        var self = this;

        self.build = function (bahmniObservations) {
            var obs = self.preProcessMultipleSelectObsToObs(bahmniObservations);
            obs = self.createObsGroupForForm(obs);
            updateObservationsWithMetadata(obs);
        };

        self.preProcessMultipleSelectObsToObs = function (observations) {
            _.forEach(observations, function (obs) {
                _.forEach(obs.value, function (value) {
                    if (value.type === "multiSelect") {
                        var clonedGroupMembers = _.cloneDeep(value.groupMembers);
                        _.forEach(clonedGroupMembers, function (member) {
                            if (member) {
                                var obsWithSameFormFieldPath = self.getRecordObservations(member.formFieldPath, value.groupMembers);
                                if (obsWithSameFormFieldPath.length > 1) {
                                    var multiSelectObject = new Bahmni.Common.Obs.MultiSelectObservation(obsWithSameFormFieldPath, {multiSelect: true});
                                    multiSelectObject.formFieldPath = obsWithSameFormFieldPath[0].formFieldPath;
                                    multiSelectObject.encounterUuid = obsWithSameFormFieldPath[0].encounterUuid;
                                    obs.value.push(multiSelectObject);
                                }
                                else if (obsWithSameFormFieldPath.length === 1) {
                                    obs.value.push(obsWithSameFormFieldPath[0]);
                                }
                            }
                        });
                    }
                    else if (value.groupMembers.length > 0) {
                        value = self.preProcessMultipleSelectObsToObs([{"value": value.groupMembers}]);
                    }
                });
                _.remove(obs.value, function (member) {
                    return member.type === "multiSelect" && !member.formFieldPath;
                });
            });
            return observations;
        };

        self.createObsGroupForForm = function (observations) {
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
                    obsGroup.concept.shortName = value.formFieldPath.split('.')[0];
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

        var updateObservationsWithMetadata = function (observations) {
            formService.getAllForms().then(function (response) {
                var allForms = response.data;
                _.forEach(observations, function (observation) {
                    var forms = [];
                    _.forEach(observation.value, function (form) {
                        var observationForm = self.getFormByFormName(allForms, self.getFormName(form.groupMembers), self.getFormVersion(form.groupMembers));
                        if (!observationForm) {
                            return;
                        }
                        formService.getFormDetail(observationForm.uuid, {v: "custom:(resources:(value))"}).then(function (response) {
                            var formDetailsAsString = _.get(response, 'data.resources[0].value');
                            if (formDetailsAsString) {
                                var metadata = JSON.parse(formDetailsAsString);
                                metadata.version = observationForm.version;
                                forms.push(self.updateObservationsWithRecordTree(metadata, form));
                            }
                            observation.value = forms;
                        });
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
                return member.formFieldPath !== undefined;
            });
            return member ? member.formFieldPath.split('.')[0] : undefined;
        };

        self.getFormVersion = function (members) {
            var member = _.find(members, function (member) {
                return member.formFieldPath !== undefined;
            });
            return member ? member.formFieldPath.split('.')[1].split('/')[0] : undefined;
        };

        self.updateObservationsWithRecordTree = function (metadata, form) {
            var recordTree = getRecordTree(metadata, form.groupMembers);
            recordTree = JSON.parse(JSON.stringify(recordTree));
            self.createGroupMembers(recordTree, form, form.groupMembers);
            return form;
        };

        self.createColumnGroupsForTable = function (record, columns, tableGroup, obsList) {
            _.forEach(columns, function (column, index) {
                var obsGroup = {
                    "groupMembers": [],
                    "concept": {
                        "shortName": "",
                        "conceptClass": null
                    }
                };
                obsGroup.concept.shortName = column.control.value;
                var columnRecord = self.getColumnObs(index, record);
                column.children = columnRecord;
                self.createGroupMembers(column, obsGroup, obsList);
                if (obsGroup.groupMembers.length > 0) {
                    tableGroup.groupMembers.push(obsGroup);
                }
            });
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

        self.createGroupMembers = function (recordTree, obsGroup, obsList) {
            _.forEach(recordTree.children, function (record) {
                if (record.control.type === 'obsControl' || record.control.type === 'obsGroupControl') {
                    var recordObservations = self.getRecordObservations(record.formFieldPath, obsList);
                    _.forEach(recordObservations, function (recordObservation) {
                        obsGroup.groupMembers.push(recordObservation);
                    });
                }
                else if (record.control.type === 'section') {
                    var sectionGroup = self.createObsGroup(record);
                    self.createGroupMembers(record, sectionGroup, obsList);
                    if (sectionGroup.groupMembers.length > 0) {
                        obsGroup.groupMembers.push(sectionGroup);
                    }
                }
                else if (record.control.type === "table") {
                    var tableGroup = self.createObsGroup(record);
                    var columns = self.getTableColumns(record);
                    self.createColumnGroupsForTable(record, columns, tableGroup, obsList);
                    obsGroup.groupMembers.push(tableGroup);
                }
            });
        };

        self.getTableColumns = function (record) {
            return _.filter(record.children, function (child) {
                return child.control.type === "label";
            });
        };

        self.getRecordObservations = function (obsFormFieldPath, obsList) {
            return _.remove(obsList, function (obs) {
                return obs.formFieldPath === obsFormFieldPath;
            });
        };

        self.createObsGroup = function (record) {
            var obsGroup = {
                "groupMembers": [],
                "concept": {
                    "shortName": "",
                    "conceptClass": null
                }
            };
            obsGroup.concept.shortName = record.control.label.value;
            return obsGroup;
        };
    }]);
