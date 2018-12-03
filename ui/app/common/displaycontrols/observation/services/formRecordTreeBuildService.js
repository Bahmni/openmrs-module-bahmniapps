'use strict';

angular.module('bahmni.common.displaycontrol.observation')
    .service('formRecordTreeBuildService', ['formService', function (formService) {
        var self = this;

        self.build = function (bahmniObservations) {
            var obs = self.createObsGroupForForm(bahmniObservations);
            updateObservationsWithMetadata(obs);
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
                        if (obsGroup.concept.shortName == newValue.concept.shortName) {
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
            self.createGroupMembersForForm(recordTree, form, form.groupMembers);
            return form;
        };

        self.createGroupMembersForForm = function (recordTree, obsGroup, obsList) {
            _.forEach(recordTree.children, function (record) {
                if (record.control.type === 'obsControl' || record.control.type === 'obsGroupControl') {
                    var recordObservations = self.getRecordObservations(record.formFieldPath, obsList);
                    _.forEach(recordObservations, function (recordObservation) {
                        obsGroup.groupMembers.push(recordObservation);
                    });
                }
                if (record.control.type === 'section') {
                    var sectionGroup = self.createObsGroupForSection(record);
                    self.createGroupMembersForForm(record, sectionGroup, obsList);
                    obsGroup.groupMembers.push(sectionGroup);
                }
            });
        };

        self.getRecordObservations = function (obsFormFieldPath, obsList) {
            return _.remove(obsList, function (obs) {
                return obs.formFieldPath === obsFormFieldPath;
            });
        };

        self.createObsGroupForSection = function (record) {
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
