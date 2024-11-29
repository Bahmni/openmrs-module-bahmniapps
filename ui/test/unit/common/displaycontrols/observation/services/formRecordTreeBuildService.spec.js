"use strict";

describe("FormRecordTreeBuildService", function () {
    var formRecordTreeBuildService;
    var $q;
    var $scope;
    var allFormsResponse;
    var observations;
    var formService;
    var formDetailDeferred;
    var allFormsDeferred;
    var formTranslateDeferred;
    var formTranslationsDetails;

    beforeEach(module("bahmni.common.displaycontrol.observation"));
    beforeEach(inject(function (_formRecordTreeBuildService_, _$q_, _$rootScope_, _formService_) {
        formRecordTreeBuildService = _formRecordTreeBuildService_;
        formService = _formService_;
        $q = _$q_;
        $scope = _$rootScope_;
        allFormsResponse = {
            "data": [
                {
                    "version": "1",
                    "name": "test add more",
                    "uuid": "f63f4dc6-c591-4d8f-8f33-d6435ebea"
                },
                {
                    "version": "1",
                    "name": "testSectionWithAnObs",
                    "uuid": "f63f4dc6-c591-4d8f-8f33-d6435ebea"
                },
                {
                    "version": "5",
                    "name": "FormWithObsInsideSection",
                    "uuid": "f63f4dc6-c591-4d8f-8f33-d6435ebea"
                },
                {
                    "version": "5",
                    "name": "FormWithAddMoreSection",
                    "uuid": "f63f4dc6-c591-4d8f-8f33-d6435ebea"
                },
                {
                    "version": "1",
                    "name": "formWithSectionAndObs",
                    "uuid": "f63f4dc6-c591-4d8f-8f33-d6435ebea"
                },
                {
                    "version": "1",
                    "name": "sectionAndObsWithAddMore",
                    "uuid": "f63f4dc6-c591-4d8f-8f33-d6435ebea"
                },
                {
                    "version": "1",
                    "name": "obsGroupForm",
                    "uuid": "f63f4dc6-c591-4d8f-8f33-d6435ebea"
                },
                {
                    "version": "1",
                    "name": "obsGroupInSection",
                    "uuid": "f63f4dc6-c591-4d8f-8f33-d6435ebea"
                },
                {
                    "version": "1",
                    "name": "obsGroupInSectionAddMore",
                    "uuid": "f63f4dc6-c591-4d8f-8f33-d6435ebea"
                },
                {
                    "version": "1",
                    "name": "sectionInSectionWithObs",
                    "uuid": "f63f4dc6-c591-4d8f-8f33-d6435ebea"
                },
                {
                    "version": "1",
                    "name": "sectionInSectionWithObsAddMore",
                    "uuid": "f63f4dc6-c591-4d8f-8f33-d6435ebea"
                },
                {
                    "version": "1",
                    "name": "tableForm",
                    "uuid": "f63f4dc6-c591-4d8f-8f33-d6435ebea"
                },
                {
                    "version": "2",
                    "name": "tableForm",
                    "uuid": "f63f4dc6-c591-4d8f-8f33-d6435ebea"
                },
                {
                    "version": "1",
                    "name": "CodedForm",
                    "uuid": "f63f4dc6-c591-4d8f-8f33-d6435ebea"
                },
                {
                    "version": "2",
                    "name": "CodedForm",
                    "uuid": "f63f4dc6-c591-4d8f-8f33-d6435ebea"
                }
            ]
        };
        formTranslationsDetails = {
            "data": {
                "labels":{"SECTION_1":["SectionOne"],"SECTION_2":["SectionAddMore"]}
            }
        };
        formDetailDeferred = $q.defer();
        allFormsDeferred = $q.defer();
        formTranslateDeferred = $q.defer();
    }));

    it("should construct obs group for single observation from form", function () {
        var obsOne = {
            "groupMembers": [],
            "formNamespace": "Bahmni",
            "formFieldPath": "myForm.1/1-0",
            "concept": {
                "uuid": "72ae28f1-4be4-499a-a8f5-aff54a11c9e3",
                "name": "Sickling Test",
                "dataType": "Text",
                "shortName": "Sickling Test",
                "conceptClass": "LabTest",
                "hiNormal": null,
                "lowNormal": null,
                "set": false,
                "mappings": []
            },
            "valueAsString": "1",
            "conceptNameToDisplay": "Sickling Test",
            "value": "1",
            "conceptConfig": []
        };
        observations = [{
            "key": "1488782460000",
            "value": [obsOne],
            "date": "1488782460000",
            "isOpen": true
        }];
        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        $scope.$apply();

        var value = observations[0].value[0];
        expect(value.concept.shortName).toBe("myForm");
        expect(value.groupMembers.length).toBe(1);
        expect(value.groupMembers[0].concept.shortName).toBe("Sickling Test");
    });

    it("should construct obs group for multiple observations from one form", function () {
        var obsOne = {
            "groupMembers": [],
            "formNamespace": "Bahmni",
            "formFieldPath": "test.2/2-0",
            "concept": {
                "shortName": "HEIGHT"
            }
        };
        var obsTwo = {
            "groupMembers": [],
            "formNamespace": "Bahmni",
            "formFieldPath": "test.2/1-0",
            "concept": {
                "shortName": "head nose lateral"
            }

        };
        observations = [{
            "key": "1488790440000",
            "value": [obsOne, obsTwo]
        }]

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        $scope.$apply();

        expect(observations[0].value.length).toBe(1);

        var value = observations[0].value[0];
        expect(value.concept.shortName).toBe("test");
        expect(value.groupMembers.length).toBe(2);
        expect(value.groupMembers[0].concept.shortName).toBe("HEIGHT");
        expect(value.groupMembers[1].concept.shortName).toBe("head nose lateral");
    });

    it("should construct obs group for obsGroup observations from one form", function () {
        var obsGroupOne = {
            "groupMembers": [{
                "groupMembers": [{
                    "groupMembers": [],
                    "formFieldPath": "formWithObsGroupAndObs.1/14-0",
                    "concept": {
                        "shortName": "Temperature"
                    }
                }, {
                    "groupMembers": [],
                    "formFieldPath": "formWithObsGroupAndObs.1/13-0",
                    "concept": {
                        "shortName": "Temperature Abnormal"
                    }
                }],
                "formFieldPath": "formWithObsGroupAndObs.1/26-0",
                "concept": {
                    "shortName": "Blood Pressure"
                }
            }, {
                "groupMembers": [],
                "formNamespace": "Bahmni",
                "formFieldPath": "formWithObsGroupAndObs.1/15-0",
                "concept": {
                    "shortName": "Temperature"
                }
            }, {
                "groupMembers": [],
                "formFieldPath": "formWithObsGroupAndObs.1/12-0",
                "concept": {
                    "shortName": "RR"
                }
            }, {
                "groupMembers": [],
                "formFieldPath": "formWithObsGroupAndObs.1/9-0",
                "concept": {
                    "shortName": "SPO2"
                }
            }],
            "formFieldPath": "formWithObsGroupAndObs.1/3-0",
            "concept": {
                "shortName": "Vitals"
            }
        };
        var obsOne = {
            "groupMembers": [],
            "formFieldPath": "formWithObsGroupAndObs.1/1-0",
            "concept": {
                "shortName": "HEIGHT"
            }
        };
        var obsTwo = {
            "groupMembers": [],
            "formFieldPath": "formWithObsGroupAndObs.1/2-0",

            "concept": {
                "shortName": "WEIGHT"
            }
        };
        observations = [{
            "value": [obsGroupOne, obsOne, obsTwo]
        }];

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        $scope.$apply();

        expect(observations[0].value.length).toBe(1);
        var value = observations[0].value[0];
        expect(value.concept.shortName).toBe("formWithObsGroupAndObs");

        expect(value.groupMembers.length).toBe(3);
        expect(value.groupMembers[0].concept.shortName).toBe("Vitals");
        expect(value.groupMembers[0].groupMembers.length).toBe(4);
        expect(value.groupMembers[0].groupMembers[0].concept.shortName).toBe("Blood Pressure");

        expect(value.groupMembers[1].concept.shortName).toBe("HEIGHT");
        expect(value.groupMembers[2].concept.shortName).toBe("WEIGHT");

    });

    it("should construct obs group for multiple observations from different form", function () {
        observations = [{
            "key": "1488790440000",
            "value": [{
                "groupMembers": [],
                "formNamespace": "Bahmni",
                "formFieldPath": "form.2/2-0",
                "concept": {
                    "shortName": "HEIGHT"
                }
            }, {
                "groupMembers": [],
                "formNamespace": "Bahmni",
                "formFieldPath": "formOne.2/2-0",
                "concept": {
                    "shortName": "HEIGHT"
                }
            }, {
                "groupMembers": [],
                "formNamespace": "Bahmni",
                "formFieldPath": "form.2/1-0",
                "concept": {
                    "shortName": "head nose lateral"
                },
            }, {
                "groupMembers": [],
                "formNamespace": "Bahmni",
                "formFieldPath": "formOne.2/1-0",
                "concept": {
                    "shortName": "head nose lateral"
                },
            }]
        }];

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        $scope.$apply();

        expect(observations[0].value.length).toBe(2);

        var firstValue = observations[0].value[0];
        expect(firstValue.concept.shortName).toBe("form");
        expect(firstValue.groupMembers.length).toBe(2);
        expect(firstValue.groupMembers[0].concept.shortName).toBe("HEIGHT");
        expect(firstValue.groupMembers[1].concept.shortName).toBe("head nose lateral");

        var secondValue = observations[0].value[1];
        expect(secondValue.concept.shortName).toBe("formOne");
        expect(secondValue.groupMembers.length).toBe(2);
        expect(secondValue.groupMembers[0].concept.shortName).toBe("HEIGHT");
        expect(secondValue.groupMembers[1].concept.shortName).toBe("head nose lateral");
    });

    it("should get form name from form group members", function () {

        var obsOne = {
            "groupMembers": [],
            "formNamespace": "Bahmni",
            "formFieldPath": "testSectionWithAnObs.1/1-0",
            "concept": {
                "shortName": "WEIGHT",
                "name": "WEIGHT",
                "conceptClass": "weight"
            },
            "valueAsString": "50.0"
        };
        var obsTwo = {
            "groupMembers": [],
            "formNamespace": "Bahmni",
            "formFieldPath": "testSectionWithAnObs.1/1-1",
            "concept": {
                "shortName": "WEIGHT",
                "name": "WEIGHT",
                "conceptClass": "weight"
            },
            "valueAsString": "100.0"
        };

        var groupMembers = [obsOne, obsTwo];

        var formName = formRecordTreeBuildService.getFormName(groupMembers);

        expect(formName).toBe("testSectionWithAnObs");

    });

    it("should get form version from form group members", function () {

        var obsOne = {
            "groupMembers": [],
            "formNamespace": "Bahmni",
            "formFieldPath": "testSectionWithAnObs.1/1-0",
            "concept": {
                "shortName": "WEIGHT",
                "name": "WEIGHT",
                "conceptClass": "weight"
            },
            "valueAsString": "50.0"
        };
        var obsTwo = {
            "groupMembers": [],
            "formNamespace": "Bahmni",
            "formFieldPath": "testSectionWithAnObs.1/1-1",
            "concept": {
                "shortName": "WEIGHT",
                "name": "WEIGHT",
                "conceptClass": "weight"
            },
            "valueAsString": "100.0"
        };

        var groupMembers = [obsOne, obsTwo];

        var formVersion = formRecordTreeBuildService.getFormVersion(groupMembers);

        expect(formVersion).toBe("1");

    });

    it("should get form information from allFormsResponse data by using form name and form version", function () {

        var form = formRecordTreeBuildService.getFormByFormName(allFormsResponse.data, "test add more", "1");

        expect(form.uuid).toBe("f63f4dc6-c591-4d8f-8f33-d6435ebea");

    });

    it("should construct form for obsControl with add more inside section", function () {
        var obsOne = {
            "groupMembers": [],
            "formNamespace": "Bahmni",
            "formFieldPath": "FormWithObsInsideSection.5/2-0",
            "concept": {
                "shortName": "WEIGHT",
                "name": "WEIGHT",
                "conceptClass": "weight"
            },
            "valueAsString": "54"
        };
        var obsTwo = {
            "groupMembers": [],
            "formNamespace": "Bahmni",
            "formFieldPath": "FormWithObsInsideSection.5/2-1",
            "concept": {
                "shortName": "WEIGHT",
                "name": "WEIGHT",
                "conceptClass": "weight"
            },
            "valueAsString": "55"
        };
        var obsThree = {
            "groupMembers": [],
            "formNamespace": "Bahmni",
            "formFieldPath": "FormWithObsInsideSection.5/2-2",
            "concept": {
                "shortName": "WEIGHT",
                "name": "WEIGHT",
                "conceptClass": "weight"
            },
            "valueAsString": "56"
        };
        observations = [{
            "value": [obsOne, obsTwo, obsThree]
        }];

        formTranslationsDetails = {
            "data": {
                "labels": {"SECTION_1":["french1"]}
            }
        };

        var formDetailsResponse = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "FormWithObsInsideSection"
                    })
                }]
            }

        };
        var recordTree = {
            "children": [
                {
                    "active": true,
                    "children": [
                        {
                            "control": {
                                "concept": {
                                    "name": "Weight",
                                    "units": "Kg"
                                },
                                "id": "2",
                                "label": {
                                    "id": "2",
                                    "type": "label",
                                    "units": "(Kg)",
                                    "value": "Weight"
                                },
                                "properties": {},
                                "type": "obsControl"
                            },
                            "formFieldPath": "FormWithObsInsideSection.5/2-0",
                            "valueAsString": "54"
                        },
                        {
                            "control": {
                                "concept": {
                                    "name": "Weight",
                                    "units": "Kg"
                                },
                                "id": "2",
                                "label": {
                                    "id": "2",
                                    "type": "label",
                                    "units": "(Kg)",
                                    "value": "Weight"
                                },
                                "properties": {},
                                "type": "obsControl"
                            },
                            "formFieldPath": "FormWithObsInsideSection.5/2-1",
                            "valueAsString": "55"
                        },
                        {
                            "control": {
                                "concept": {
                                    "name": "Weight",
                                    "units": "Kg"
                                },
                                "id": "2",
                                "label": {
                                    "id": "2",
                                    "type": "label",
                                    "units": "(Kg)",
                                    "value": "Weight"
                                },
                                "properties": {},
                                "type": "obsControl"
                            },
                            "formFieldPath": "FormWithObsInsideSection.5/2-2",
                            "valueAsString": "56"
                        }
                    ],
                    "control": {
                        "label": {
                            "id": "1",
                            "value": "SectionOne",
                            "translationKey": "SECTION_1"
                        },
                        "type": "section"
                    },
                    "formFieldPath": "FormWithObsInsideSection.5/1-0",
                    "showAddMore": false
                }
            ],
            "formFieldPath": ""
        };

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);
        spyOn(formService, "getFormTranslate").and.returnValue(formTranslateDeferred.promise);

        window.getRecordTree = function () {
            return recordTree;
        };

        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        formDetailDeferred.resolve(formDetailsResponse);
        formTranslateDeferred.resolve(formTranslationsDetails);
        $scope.$apply();


        var value = observations[0].value[0];
        expect(value.concept.shortName).toBe("FormWithObsInsideSection");
        expect(value.groupMembers.length).toBe(1);

        var sectionValue = value.groupMembers[0];
        expect(sectionValue.groupMembers[0].concept.shortName).toBe("WEIGHT");
        expect(sectionValue.groupMembers[1].concept.shortName).toBe("WEIGHT");
        expect(sectionValue.groupMembers[2].concept.shortName).toBe("WEIGHT");

        expect(sectionValue.groupMembers[0].valueAsString).toBe("54");
        expect(sectionValue.groupMembers[1].valueAsString).toBe("55");
        expect(sectionValue.groupMembers[2].valueAsString).toBe("56");

    });

    it("should construct form for add more section having one obs", function () {
        var obsOne = {
            "groupMembers": [],
            "formNamespace": "Bahmni",
            "formFieldPath": "FormWithAddMoreSection.5/1-0/2-0",
            "concept": {
                "shortName": "WEIGHT",
                "name": "WEIGHT",
                "conceptClass": "weight"
            },
            "valueAsString": "54"
        };
        var obsTwo = {
            "groupMembers": [],
            "formNamespace": "Bahmni",
            "formFieldPath": "FormWithAddMoreSection.5/1-1/2-0",
            "concept": {
                "shortName": "WEIGHT",
                "name": "WEIGHT",
                "conceptClass": "weight"
            },
            "valueAsString": "55"
        };
        observations = [{
            "value": [obsOne, obsTwo]
        }];

        var formDetailsResponse = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "FormWithAddMoreSection"
                    })
                }]
            }

        };

        var recordTree = {
            "children": [
                {
                    "active": true,
                    "children": [
                        {
                            "control": {
                                "concept": {
                                    "name": "Weight",
                                    "units": "Kg"
                                },
                                "id": "2",
                                "label": {
                                    "id": "2",
                                    "type": "label",
                                    "units": "(Kg)",
                                    "value": "Weight"
                                },
                                "properties": {},
                                "type": "obsControl"
                            },
                            "formFieldPath": "FormWithAddMoreSection.5/1-0/2-0",
                            "valueAsString": "54"
                        }
                    ],
                    "control": {
                        "label": {
                            "id": "1",
                            "value": "SectionOne",
                            "translationKey": "SECTION_1"
                        },
                        "type": "section"
                    },
                    "formFieldPath": "FormWithAddMoreSection.5/1-0",
                    "showAddMore": true
                },
                {
                    "active": true,
                    "children": [
                        {
                            "control": {
                                "concept": {
                                    "name": "Weight",
                                    "units": "Kg"
                                },
                                "id": "2",
                                "label": {
                                    "id": "2",
                                    "type": "label",
                                    "units": "(Kg)",
                                    "value": "Weight"
                                },
                                "properties": {},
                                "type": "obsControl"
                            },
                            "formFieldPath": "FormWithAddMoreSection.5/1-1/2-0",
                            "valueAsString": "55"
                        }
                    ],
                    "control": {
                        "label": {
                            "id": "1",
                            "value": "SectionAddMore",
                            "translationKey": "SECTION_2"
                        },
                        "type": "section"
                    },
                    "formFieldPath": "FormWithAddMoreSection.5/1-1",
                    "showAddMore": true
                }
            ],
            "formFieldPath": ""
        }

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);
        spyOn(formService, "getFormTranslate").and.returnValue(formTranslateDeferred.promise);
        window.getRecordTree = function () {
            return recordTree;
        };

        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        formDetailDeferred.resolve(formDetailsResponse);
        formTranslateDeferred.resolve(formTranslationsDetails);
        $scope.$apply();


        var value = observations[0].value[0];
        expect(value.concept.shortName).toBe("FormWithAddMoreSection");
        expect(value.groupMembers.length).toBe(2);

        var sectionValue = value.groupMembers[0];
        expect(sectionValue.concept.shortName).toBe("SectionOne");
        expect(sectionValue.groupMembers[0].concept.shortName).toBe("WEIGHT");
        expect(sectionValue.groupMembers[0].valueAsString).toBe("54");

        var addMoreSection = value.groupMembers[1];
        expect(addMoreSection.concept.shortName).toBe("SectionAddMore");
        expect(addMoreSection.groupMembers[0].concept.shortName).toBe("WEIGHT");
        expect(addMoreSection.groupMembers[0].valueAsString).toBe("55");

    });

    it("should construct form for obsControl and section with obsControl", function () {
        var obsOne = {
            "groupMembers": [],
            "formFieldPath": "formWithSectionAndObs.1/2-0",
            "concept": {
                "uuid": "A5090A",
                "name": "HEIGHT",
                "dataType": "Numeric",
                "shortName": "HEIGHT"
            },
            "valueAsString": "160.0"
        };
        var obsTwo = {
            "groupMembers": [],
            "formFieldPath": "formWithSectionAndObs.1/3-0",
            "concept": {
                "uuid": "A5089A",
                "name": "WEIGHT",
                "dataType": "Numeric",
                "shortName": "WEIGHT"
            },
            "valueAsString": "100.0"
        };
        observations = [{
            "value": [obsOne, obsTwo]
        }];

        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "formWithSectionAndObs"
                    })
                }]
            }
        };

        var recordTree = {
            "children": [
                {
                    "active": true,
                    "children": [
                        {
                            "control": {
                                "concept": {
                                    "name": "WEIGHT",
                                    "units": "(cms)"
                                },
                                "id": "3",
                                "label": {
                                    "id": "3",
                                    "type": "label",
                                    "units": "(cms)",
                                    "value": "WEIGHT"
                                },
                                "properties": {},
                                "type": "obsControl"
                            },
                            "formFieldPath": "formWithSectionAndObs.1/3-0",
                            "valueAsString": "100.0"
                        }
                    ],
                    "control": {
                        "label": {
                            "id": "1",
                            "value": "SectionOne",
                            "translationKey": "SECTION_1"
                        },
                        "type": "section"
                    },
                    "formFieldPath": "formWithSectionAndObs.1/1-0",
                    "showAddMore": true
                },
                {
                    "control": {
                        "concept": {
                            "name": "HEIGHT",
                            "units": "(cms)"
                        },
                        "id": "2",
                        "label": {
                            "id": "2",
                            "type": "label",
                            "units": "(cms)",
                            "value": "HEIGHT"
                        },
                        "properties": {},
                        "type": "obsControl"
                    },
                    "formFieldPath": "formWithSectionAndObs.1/2-0",
                    "valueAsString": "160.0"
                }
            ],
            "formFieldPath": ""
        };

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);
        spyOn(formService, "getFormTranslate").and.returnValue(formTranslateDeferred.promise);
        window.getRecordTree = function () {
            return recordTree;
        };

        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        formDetailDeferred.resolve(formDetails);
        formTranslateDeferred.resolve(formTranslationsDetails);

        $scope.$apply();

        var formGroup = observations[0].value[0];
        expect(formGroup.concept.shortName).toBe("formWithSectionAndObs");
        expect(formGroup.groupMembers.length).toBe(2);

        var memberSectionGroup = formGroup.groupMembers[0];
        expect(memberSectionGroup.concept.shortName).toBe("SectionOne");
        expect(memberSectionGroup.groupMembers.length).toBe(1);


        var sectionMemberObs = memberSectionGroup.groupMembers[0];
        expect(sectionMemberObs.concept.shortName).toBe("WEIGHT");
        expect(sectionMemberObs.valueAsString).toBe("100.0");

        var memberObs = formGroup.groupMembers[1];
        expect(memberObs.concept.shortName).toBe("HEIGHT");
        expect(memberObs.valueAsString).toBe("160.0");
    });

    it("should construct form for obsControl and section with obsControl with add more", function () {
        var obsOne = {
            "groupMembers": [],
            "formFieldPath": "sectionAndObsWithAddMore.1/1-0/2-0",
            "concept": {
                "uuid": "A5090A",
                "name": "HEIGHT",
                "dataType": "Numeric",
                "shortName": "HEIGHT"
            },
            "valueAsString": "160.0"
        };
        var obsTwo = {
            "groupMembers": [],
            "formFieldPath": "sectionAndObsWithAddMore.1/1-1/2-0",
            "concept": {
                "uuid": "A5090A",
                "name": "HEIGHT",
                "dataType": "Numeric",
                "shortName": "HEIGHT"
            },
            "valueAsString": "180.0"
        };
        var obsThree = {
            "groupMembers": [],
            "formFieldPath": "sectionAndObsWithAddMore.1/3-0",
            "concept": {
                "uuid": "A5089A",
                "name": "WEIGHT",
                "dataType": "Numeric",
                "shortName": "WEIGHT"
            },
            "valueAsString": "50.0"
        };

        var obsFour = {
            "groupMembers": [],
            "formFieldPath": "sectionAndObsWithAddMore.1/3-1",
            "concept": {
                "uuid": "A5089A",
                "name": "WEIGHT",
                "dataType": "Numeric",
                "shortName": "WEIGHT"
            },
            "valueAsString": "60.0"
        };
        observations = [{
            "value": [obsOne, obsTwo, obsThree, obsFour]
        }];

        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "sectionAndObsWithAddMore"
                    })
                }]
            }
        };

        var recordTree = {
            "children": [
                {
                    "active": true,
                    "children": [
                        {
                            "control": {
                                "concept": {
                                    "name": "HEIGHT",
                                    "units": "(cms)"
                                },
                                "id": "2",
                                "label": {
                                    "id": "2",
                                    "type": "label",
                                    "units": "(cms)",
                                    "value": "HEIGHT"
                                },
                                "properties": {},
                                "type": "obsControl"
                            },
                            "formFieldPath": "sectionAndObsWithAddMore.1/1-0/2-0",
                            "valueAsString": "160.0"
                        }
                    ],
                    "control": {
                        "label": {
                            "id": "1",
                            "value": "SectionOne",
                            "translationKey": "SECTION_1"
                        },
                        "type": "section"
                    },
                    "formFieldPath": "sectionAndObsWithAddMore.1/1-0",
                    "showAddMore": true
                },
                {
                    "active": true,
                    "children": [
                        {
                            "control": {
                                "concept": {
                                    "name": "HEIGHT",
                                    "units": "(cms)"
                                },
                                "id": "2",
                                "label": {
                                    "id": "2",
                                    "type": "label",
                                    "units": "(cms)",
                                    "value": "HEIGHT"
                                },
                                "properties": {},
                                "type": "obsControl"
                            },
                            "formFieldPath": "sectionAndObsWithAddMore.1/1-1/2-0",
                            "valueAsString": "180.0"
                        }
                    ],
                    "control": {
                        "label": {
                            "id": "1",
                            "value": "SectionAddMore",
                            "translationKey": "SECTION_2"
                        },
                        "type": "section"
                    },
                    "formFieldPath": "sectionAndObsWithAddMore.1/1-1",
                    "showAddMore": true
                },
                {
                    "control": {
                        "concept": {
                            "name": "WEIGHT",
                            "units": "(cms)"
                        },
                        "id": "3",
                        "label": {
                            "id": "3",
                            "type": "label",
                            "units": "(cms)",
                            "value": "WEIGHT"
                        },
                        "properties": {},
                        "type": "obsControl"
                    },
                    "formFieldPath": "sectionAndObsWithAddMore.1/3-0",
                    "valueAsString": "50.0"
                },
                {
                    "control": {
                        "concept": {
                            "name": "WEIGHT",
                            "units": "(cms)"
                        },
                        "id": "3",
                        "label": {
                            "id": "3",
                            "type": "label",
                            "units": "(cms)",
                            "value": "WEIGHT"
                        },
                        "properties": {},
                        "type": "obsControl"
                    },
                    "formFieldPath": "sectionAndObsWithAddMore.1/3-1",
                    "valueAsString": "60.0"
                }
            ],
            "formFieldPath": ""
        };

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);
        spyOn(formService, "getFormTranslate").and.returnValue(formTranslateDeferred.promise);

        window.getRecordTree = function () {
            return recordTree;
        };

        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        formDetailDeferred.resolve(formDetails);
        formTranslateDeferred.resolve(formTranslationsDetails);

        $scope.$apply();

        var formGroup = observations[0].value[0];
        expect(formGroup.concept.shortName).toBe("sectionAndObsWithAddMore");
        expect(formGroup.groupMembers.length).toBe(4);

        var memberSectionGroup = formGroup.groupMembers[0];
        expect(memberSectionGroup.concept.shortName).toBe("SectionOne");
        expect(memberSectionGroup.groupMembers.length).toBe(1);

        var sectionMemberObs = memberSectionGroup.groupMembers[0];
        expect(sectionMemberObs.concept.shortName).toBe("HEIGHT");
        expect(sectionMemberObs.valueAsString).toBe("160.0");

        var memberSectionAddMoreGroup = formGroup.groupMembers[1];
        expect(memberSectionAddMoreGroup.concept.shortName).toBe("SectionAddMore");
        expect(memberSectionAddMoreGroup.groupMembers.length).toBe(1);

        var sectionAddMoreMemberObs = memberSectionAddMoreGroup.groupMembers[0];
        expect(sectionAddMoreMemberObs.concept.shortName).toBe("HEIGHT");
        expect(sectionAddMoreMemberObs.valueAsString).toBe("180.0");

        var memberObs = formGroup.groupMembers[2];
        expect(memberObs.concept.shortName).toBe("WEIGHT");
        expect(memberObs.valueAsString).toBe("50.0");

        var memberObsAddMore = formGroup.groupMembers[3];
        expect(memberObsAddMore.concept.shortName).toBe("WEIGHT");
        expect(memberObsAddMore.valueAsString).toBe("60.0");
    });

    it("should construct form for obsGroup", function () {
        var obsOne = {
            "groupMembers": [{
                "groupMembers": [],
                "formFieldPath": "obsGroupForm.1/2-0",
                "concept": {
                    "uuid": "A5090A",
                    "name": "HEIGHT",
                    "dataType": "Numeric",
                    "shortName": "HEIGHT"
                },
                "valueAsString": "170.0"
            },
                {
                    "groupMembers": [],
                    "formFieldPath": "obsGroupForm.1/3-0",
                    "concept": {
                        "uuid": "A5090A",
                        "name": "WEIGHT",
                        "dataType": "Numeric",
                        "shortName": "WEIGHT"
                    },
                    "valueAsString": "55.0"
                }
            ],
            "formFieldPath": "obsGroupForm.1/1-0",
            "concept": {
                "uuid": "A5090A",
                "name": "ObsGroupOne",
                "dataType": "Numeric",
                "shortName": "ObsGroupOne"
            },
            "valueAsString": "170.0, 55.0"
        };

        observations = [{
            "value": [obsOne]
        }];

        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "obsGroupForm"
                    })
                }]
            }
        };

        var recordTree = {
            "children": [
                {
                    "active": true,
                    "children": [
                        {
                            "control": {
                                "concept": {
                                    "name": "WEIGHT",
                                    "units": "(cms)"
                                },
                                "id": "3",
                                "label": {
                                    "id": "3",
                                    "type": "label",
                                    "units": "(cms)",
                                    "value": "WEIGHT"
                                },
                                "properties": {},
                                "type": "obsControl"
                            },
                            "formFieldPath": "obsGroupForm.1/3-0",
                            "valueAsString": "55.0"
                        },
                        {
                            "control": {
                                "concept": {
                                    "name": "HEIGHT",
                                    "units": "(cms)"
                                },
                                "id": "2",
                                "label": {
                                    "id": "2",
                                    "type": "label",
                                    "units": "(cms)",
                                    "value": "HEIGHT"
                                },
                                "properties": {},
                                "type": "obsControl"
                            },
                            "formFieldPath": "obsGroupForm.1/2-0",
                            "valueAsString": "170.0"
                        }
                    ],
                    "control": {
                        "label": {
                            "id": "1",
                            "value": "ObsGroupOne"
                        },
                        "type": "obsGroupControl"
                    },
                    "formFieldPath": "obsGroupForm.1/1-0",
                    "showAddMore": false
                }
            ],
            "formFieldPath": ""
        };

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);
        spyOn(formService, "getFormTranslate").and.returnValue(formTranslateDeferred.promise);

        window.getRecordTree = function () {
            return recordTree;
        };

        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        formDetailDeferred.resolve(formDetails);
        formTranslateDeferred.resolve(formTranslationsDetails);

        $scope.$apply();

        var formGroup = observations[0].value[0];
        expect(formGroup.concept.shortName).toBe("obsGroupForm");
        expect(formGroup.groupMembers.length).toBe(1);

        var memberObsGroup = formGroup.groupMembers[0];
        expect(memberObsGroup.concept.shortName).toBe("ObsGroupOne");
        expect(memberObsGroup.groupMembers.length).toBe(2);

        var memberObsOne = memberObsGroup.groupMembers[0];
        expect(memberObsOne.concept.shortName).toBe("HEIGHT");
        expect(memberObsOne.valueAsString).toBe("170.0");

        var memberObsTwo = memberObsGroup.groupMembers[1];
        expect(memberObsTwo.concept.shortName).toBe("WEIGHT");
        expect(memberObsTwo.valueAsString).toBe("55.0");

    });

    it("should construct form for obsGroup inside section", function () {
        var obsOne = {
            "groupMembers": [{
                "groupMembers": [],
                "formFieldPath": "obsGroupInSection.1/2-0",
                "concept": {
                    "uuid": "A5090A",
                    "name": "HEIGHT",
                    "dataType": "Numeric",
                    "shortName": "HEIGHT"
                },
                "valueAsString": "170.0"
            },
                {
                    "groupMembers": [],
                    "formFieldPath": "obsGroupInSection.1/3-0",
                    "concept": {
                        "uuid": "A5090A",
                        "name": "WEIGHT",
                        "dataType": "Numeric",
                        "shortName": "WEIGHT"
                    },
                    "valueAsString": "55.0"
                }
            ],
            "formFieldPath": "obsGroupInSection.1/1-0",
            "concept": {
                "uuid": "A5090A",
                "name": "ObsGroupOne",
                "dataType": "Numeric",
                "shortName": "ObsGroupOne"
            },
            "valueAsString": "170.0, 55.0"
        };

        observations = [{
            "value": [obsOne]
        }];

        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "obsGroupForm"
                    })
                }]
            }
        };

        formTranslationsDetails = {
            "data": {
                "labels":{"SECTION_1":["SectionOne"],"SECTION_2":["SectionAddMore"]}
            }
        };

        var recordTree = {
            "children": [
                {
                    "active": true,
                    "children": [
                        {
                            "active": true,
                            "children": [
                                {
                                    "control": {
                                        "concept": {
                                            "name": "WEIGHT",
                                            "units": "(cms)"
                                        },
                                        "id": "3",
                                        "label": {
                                            "id": "3",
                                            "type": "label",
                                            "units": "(cms)",
                                            "value": "WEIGHT"
                                        },
                                        "properties": {},
                                        "type": "obsControl"
                                    },
                                    "formFieldPath": "obsGroupInSection.1/3-0",
                                    "valueAsString": "55.0"
                                },
                                {
                                    "control": {
                                        "concept": {
                                            "name": "HEIGHT",
                                            "units": "(cms)"
                                        },
                                        "id": "2",
                                        "label": {
                                            "id": "2",
                                            "type": "label",
                                            "units": "(cms)",
                                            "value": "HEIGHT"
                                        },
                                        "properties": {},
                                        "type": "obsControl"
                                    },
                                    "formFieldPath": "obsGroupInSection.1/2-0",
                                    "valueAsString": "170.0"
                                }
                            ],
                            "control": {
                                "label": {
                                    "id": "1",
                                    "value": "ObsGroupOne"
                                },
                                "type": "obsGroupControl"
                            },
                            "formFieldPath": "obsGroupInSection.1/1-0",
                            "showAddMore": false
                        }
                    ],
                    "control": {
                        "label": {
                            "id": "4",
                            "value": "SectionOne",
                            "translationKey": "SECTION_1"
                        },
                        "type": "section"
                    },
                    "formFieldPath": "obsGroupInSection.1/4-0",
                    "showAddMore": false
                }
            ],
            "formFieldPath": ""
        };

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);
        spyOn(formService, "getFormTranslate").and.returnValue(formTranslateDeferred.promise);

        window.getRecordTree = function () {
            return recordTree;
        };

        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        formDetailDeferred.resolve(formDetails);
        formTranslateDeferred.resolve(formTranslationsDetails);

        $scope.$apply();

        var formGroup = observations[0].value[0];
        expect(formGroup.concept.shortName).toBe("obsGroupInSection");
        expect(formGroup.groupMembers.length).toBe(1);

        var memberSection = formGroup.groupMembers[0];
        expect(memberSection.concept.shortName).toBe("SectionOne");
        expect(memberSection.groupMembers.length).toBe(1);

        var memberObsGroup = memberSection.groupMembers[0];
        expect(memberObsGroup.concept.shortName).toBe("ObsGroupOne");
        expect(memberObsGroup.groupMembers.length).toBe(2);

        var memberObsOne = memberObsGroup.groupMembers[1];
        expect(memberObsOne.concept.shortName).toBe("WEIGHT");
        expect(memberObsOne.valueAsString).toBe("55.0");

    });

    it("should construct form for obsGroup inside section with add more", function () {
        var obsOne = {
            "groupMembers": [{
                "groupMembers": [],
                "formFieldPath": "obsGroupInSectionAddMore.1/4-0/2-0",
                "concept": {
                    "uuid": "A5090A",
                    "name": "HEIGHT",
                    "dataType": "Numeric",
                    "shortName": "HEIGHT"
                },
                "valueAsString": "170.0"
            }
            ],
            "formFieldPath": "obsGroupInSectionAddMore.1/4-0/1-0",
            "concept": {
                "uuid": "A5090A",
                "name": "ObsGroupOne",
                "dataType": "Numeric",
                "shortName": "ObsGroupOne"
            },
            "valueAsString": "170.0"
        };
        var obsTwo = {
            "groupMembers": [{
                "groupMembers": [],
                "formFieldPath": "obsGroupInSectionAddMore.1/4-1/2-0",
                "concept": {
                    "uuid": "A5090A",
                    "name": "HEIGHT",
                    "dataType": "Numeric",
                    "shortName": "HEIGHT"
                },
                "valueAsString": "175.0"
            }
            ],
            "formFieldPath": "obsGroupInSectionAddMore.1/4-1/1-0",
            "concept": {
                "uuid": "A5090A",
                "name": "ObsGroupOne",
                "dataType": "Numeric",
                "shortName": "ObsGroupOne"
            },
            "valueAsString": "175.0"
        };

        observations = [{
            "value": [obsOne, obsTwo]
        }];

        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "obsGroupInSectionAddMore"
                    })
                }]
            }
        };

        var recordTree = {
            "children": [
                {
                    "active": true,
                    "children": [
                        {
                            "control": {
                                "label": {
                                    "id": "1",
                                    "value": "ObsGroupOne"
                                },
                                "type": "obsGroupControl"
                            },
                            "formFieldPath": "obsGroupInSectionAddMore.1/4-0/1-0",
                            "active": true,
                            "children": [
                                {
                                    "control": {
                                        "concept": {
                                            "name": "HEIGHT",
                                            "units": "(cms)"
                                        },
                                        "id": "2",
                                        "label": {
                                            "id": "2",
                                            "type": "label",
                                            "units": "(cms)",
                                            "value": "HEIGHT"
                                        },
                                        "properties": {},
                                        "type": "obsControl"
                                    },
                                    "formFieldPath": "obsGroupInSectionAddMore.1/4-0/2-0",
                                    "valueAsString": "170.0"
                                }
                            ],
                            "showAddMore": false
                        }
                    ],
                    "control": {
                        "label": {
                            "id": "4",
                            "value": "SectionOne",
                            "translationKey": "SECTION_1"
                        },
                        "type": "section"
                    },
                    "formFieldPath": "obsGroupInSectionAddMore.1/4-0",
                    "showAddMore": true
                },
                {
                    "active": true,
                    "children": [
                        {
                            "control": {
                                "label": {
                                    "id": "1",
                                    "value": "ObsGroupOne"
                                },
                                "type": "obsGroupControl"
                            },
                            "formFieldPath": "obsGroupInSectionAddMore.1/4-1/1-0",
                            "active": true,
                            "children": [
                                {
                                    "control": {
                                        "concept": {
                                            "name": "HEIGHT",
                                            "units": "(cms)"
                                        },
                                        "id": "2",
                                        "label": {
                                            "id": "2",
                                            "type": "label",
                                            "units": "(cms)",
                                            "value": "HEIGHT"
                                        },
                                        "properties": {},
                                        "type": "obsControl"
                                    },
                                    "formFieldPath": "obsGroupInSectionAddMore.1/4-1/2-0",
                                    "valueAsString": "175.0"
                                }
                            ],
                            "showAddMore": false
                        }
                    ],
                    "control": {
                        "label": {
                            "id": "4",
                            "value": "SectionAddMore",
                            "translationKey": "SECTION_2"
                        },
                        "type": "section"
                    },
                    "formFieldPath": "obsGroupInSectionAddMore.1/4-1",
                    "showAddMore": true
                }
            ],
            "formFieldPath": ""
        };

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);
        spyOn(formService, "getFormTranslate").and.returnValue(formTranslateDeferred.promise);

        window.getRecordTree = function () {
            return recordTree;
        };

        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        formDetailDeferred.resolve(formDetails);
        formTranslateDeferred.resolve(formTranslationsDetails);

        $scope.$apply();

        var formGroup = observations[0].value[0];
        expect(formGroup.concept.shortName).toBe("obsGroupInSectionAddMore");
        expect(formGroup.groupMembers.length).toBe(2);

        var memberSectionOne = formGroup.groupMembers[0];
        expect(memberSectionOne.concept.shortName).toBe("SectionOne");
        expect(memberSectionOne.groupMembers.length).toBe(1);

        var memberObsGroupOne = memberSectionOne.groupMembers[0];
        expect(memberObsGroupOne.concept.shortName).toBe("ObsGroupOne");
        expect(memberObsGroupOne.groupMembers.length).toBe(1);

        var memberObsOne = memberObsGroupOne.groupMembers[0];
        expect(memberObsOne.concept.shortName).toBe("HEIGHT");
        expect(memberObsOne.valueAsString).toBe("170.0");

        var memberSectionTwo = formGroup.groupMembers[1];
        expect(memberSectionTwo.concept.shortName).toBe("SectionAddMore");
        expect(memberSectionTwo.groupMembers.length).toBe(1);

        var memberObsGroupTwo = memberSectionTwo.groupMembers[0];
        expect(memberObsGroupTwo.concept.shortName).toBe("ObsGroupOne");
        expect(memberObsGroupTwo.groupMembers.length).toBe(1);

        var memberObsTwo = memberObsGroupTwo.groupMembers[0];
        expect(memberObsTwo.concept.shortName).toBe("HEIGHT");
        expect(memberObsTwo.valueAsString).toBe("175.0");
    });

    it("should construct form for section inside section with obs", function () {
        var obsOne = {
            "groupMembers": [],
            "formFieldPath": "sectionInSectionWithObs.1/4-0",
            "concept": {
                "uuid": "A5090A",
                "name": "HEIGHT",
                "dataType": "Numeric",
                "shortName": "HEIGHT"
            },
            "valueAsString": "170.0"
        };
        var obsTwo = {
            "groupMembers": [],
            "formFieldPath": "sectionInSectionWithObs.1/3-0",
            "concept": {
                "uuid": "A5090A",
                "name": "WEIGHT",
                "dataType": "Numeric",
                "shortName": "WEIGHT"
            },
            "valueAsString": "55.0"
        };

        observations = [{
            "value": [obsOne, obsTwo]
        }];

        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "obsGroupInSectionAddMore"
                    })
                }]
            }
        };

        formTranslationsDetails = {
            "data": {
                "labels":{"SECTION_1":["SectionOne"],"SECTION_2":["SectionTwo"]}
            }
        };

        var recordTree = {
            "children": [
                {
                    "active": true,
                    "children": [
                        {
                            "active": true,
                            "children": [
                                {
                                    "control": {
                                        "concept": {
                                            "name": "WEIGHT",
                                            "units": "(cms)"
                                        },
                                        "id": "3",
                                        "label": {
                                            "id": "3",
                                            "type": "label",
                                            "units": "(cms)",
                                            "value": "WEIGHT"
                                        },
                                        "properties": {},
                                        "type": "obsControl"
                                    },
                                    "formFieldPath": "sectionInSectionWithObs.1/3-0",
                                    "valueAsString": "55.0"
                                }
                            ],
                            "control": {
                                "label": {
                                    "id": "2",
                                    "value": "SectionTwo",
                                    "translationKey": "SECTION_2"
                                },
                                "type": "section"
                            },
                            "formFieldPath": "sectionInSectionWithObs.1/2-0",
                            "showAddMore": false
                        },
                        {
                            "control": {
                                "concept": {
                                    "name": "HEIGHT",
                                    "units": "(cms)"
                                },
                                "id": "4",
                                "label": {
                                    "id": "4",
                                    "type": "label",
                                    "units": "(cms)",
                                    "value": "HEIGHT"
                                },
                                "properties": {},
                                "type": "obsControl"
                            },
                            "formFieldPath": "sectionInSectionWithObs.1/4-0",
                            "valueAsString": "170.0"
                        }
                    ],
                    "control": {
                        "label": {
                            "id": "1",
                            "value": "SectionOne",
                            "translationKey": "SECTION_1"
                        },
                        "type": "section"
                    },
                    "formFieldPath": "sectionInSectionWithObs.1/1-0",
                    "showAddMore": false
                }
            ],
            "formFieldPath": ""
        };

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);
        spyOn(formService, "getFormTranslate").and.returnValue(formTranslateDeferred.promise);

        window.getRecordTree = function () {
            return recordTree;
        };

        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        formDetailDeferred.resolve(formDetails);
        formTranslateDeferred.resolve(formTranslationsDetails);

        $scope.$apply();

        var formGroup = observations[0].value[0];
        expect(formGroup.concept.shortName).toBe("sectionInSectionWithObs");
        expect(formGroup.groupMembers.length).toBe(1);


        var memberSectionGroup = formGroup.groupMembers[0];
        expect(memberSectionGroup.concept.shortName).toBe("SectionOne");
        expect(memberSectionGroup.groupMembers.length).toBe(2);

        var memberInMemberSectionGroup = memberSectionGroup.groupMembers[0];
        expect(memberInMemberSectionGroup.concept.shortName).toBe("SectionTwo");
        expect(memberInMemberSectionGroup.groupMembers.length).toBe(1);


        var sectionMemberObs = memberInMemberSectionGroup.groupMembers[0];
        expect(sectionMemberObs.concept.shortName).toBe("WEIGHT");
        expect(sectionMemberObs.valueAsString).toBe("55.0");

        var memberObs = memberSectionGroup.groupMembers[1];
        expect(memberObs.concept.shortName).toBe("HEIGHT");
        expect(memberObs.valueAsString).toBe("170.0");

    });

    it("should construct form for section inside section with obs having add more", function () {
        var obsOne = {
            "groupMembers": [],
            "formFieldPath": "sectionInSectionWithObsAddMore.1/4-0",
            "concept": {
                "uuid": "A5090A",
                "name": "HEIGHT",
                "dataType": "Numeric",
                "shortName": "HEIGHT"
            },
            "valueAsString": "170.0"
        };
        var obsTwo = {
            "groupMembers": [],
            "formFieldPath": "sectionInSectionWithObsAddMore.1/2-0/3-0",
            "concept": {
                "uuid": "A5090A",
                "name": "WEIGHT",
                "dataType": "Numeric",
                "shortName": "WEIGHT"
            },
            "valueAsString": "55.0"
        };

        var obsThree = {
            "groupMembers": [],
            "formFieldPath": "sectionInSectionWithObsAddMore.1/2-1/3-0",
            "concept": {
                "uuid": "A5090A",
                "name": "WEIGHT",
                "dataType": "Numeric",
                "shortName": "WEIGHT"
            },
            "valueAsString": "65.0"
        };

        observations = [{
            "value": [obsOne, obsTwo, obsThree]
        }];

        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "sectionInSectionWithObsAddMore"
                    })
                }]
            }
        };

        formTranslationsDetails = {
            "data": {
                "labels":{"SECTION_1":["SectionOne"],"SECTION_2":["SectionTwo"], "SECTION_3":["SectionTwoAddMore"]}
            }
        };


        var recordTree = {
            "children": [
                {
                    "active": true,
                    "children": [
                        {
                            "active": true,
                            "children": [
                                {
                                    "control": {
                                        "concept": {
                                            "name": "WEIGHT",
                                            "units": "(cms)"
                                        },
                                        "id": "3",
                                        "label": {
                                            "id": "3",
                                            "type": "label",
                                            "units": "(cms)",
                                            "value": "WEIGHT"
                                        },
                                        "properties": {},
                                        "type": "obsControl"
                                    },
                                    "formFieldPath": "sectionInSectionWithObsAddMore.1/2-0/3-0",
                                    "valueAsString": "55.0"
                                }
                            ],
                            "control": {
                                "label": {
                                    "id": "2",
                                    "value": "SectionTwo",
                                    "translationKey": "SECTION_2"
                                },
                                "type": "section"
                            },
                            "formFieldPath": "sectionInSectionWithObsAddMore.1/2-0",
                            "showAddMore": true
                        },
                        {
                            "active": true,
                            "children": [
                                {
                                    "control": {
                                        "concept": {
                                            "name": "WEIGHT",
                                            "units": "(cms)"
                                        },
                                        "id": "3",
                                        "label": {
                                            "id": "3",
                                            "type": "label",
                                            "units": "(cms)",
                                            "value": "WEIGHT"
                                        },
                                        "properties": {},
                                        "type": "obsControl"
                                    },
                                    "formFieldPath": "sectionInSectionWithObsAddMore.1/2-1/3-0",
                                    "valueAsString": "65.0"
                                }
                            ],
                            "control": {
                                "label": {
                                    "id": "2",
                                    "value": "SectionTwoAddMore",
                                    "translationKey": "SECTION_3"
                                },
                                "type": "section"
                            },
                            "formFieldPath": "sectionInSectionWithObsAddMore.1/2-1",
                            "showAddMore": true
                        },
                        {
                            "control": {
                                "concept": {
                                    "name": "HEIGHT",
                                    "units": "(cms)"
                                },
                                "id": "4",
                                "label": {
                                    "id": "4",
                                    "type": "label",
                                    "units": "(cms)",
                                    "value": "HEIGHT"
                                },
                                "properties": {},
                                "type": "obsControl"
                            },
                            "formFieldPath": "sectionInSectionWithObsAddMore.1/4-0",
                            "valueAsString": "170.0"
                        }
                    ],
                    "control": {
                        "label": {
                            "id": "1",
                            "value": "SectionOne",
                            "translationKey": "SECTION_1"
                        },
                        "type": "section"
                    },
                    "formFieldPath": "sectionInSectionWithObsAddMore.1/1-0",
                    "showAddMore": false
                }
            ],
            "formFieldPath": ""
        };

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);
        spyOn(formService, "getFormTranslate").and.returnValue(formTranslateDeferred.promise);

        window.getRecordTree = function () {
            return recordTree;
        };

        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        formDetailDeferred.resolve(formDetails);
        formTranslateDeferred.resolve(formTranslationsDetails);

        $scope.$apply();

        var formGroup = observations[0].value[0];
        expect(formGroup.concept.shortName).toBe("sectionInSectionWithObsAddMore");
        expect(formGroup.groupMembers.length).toBe(1);


        var memberSectionGroup = formGroup.groupMembers[0];
        expect(memberSectionGroup.concept.shortName).toBe("SectionOne");
        expect(memberSectionGroup.groupMembers.length).toBe(3);

        var memberInMemberSectionGroupOne = memberSectionGroup.groupMembers[0];
        expect(memberInMemberSectionGroupOne.concept.shortName).toBe("SectionTwo");
        expect(memberInMemberSectionGroupOne.groupMembers.length).toBe(1);

        var sectionMemberObs = memberInMemberSectionGroupOne.groupMembers[0];
        expect(sectionMemberObs.concept.shortName).toBe("WEIGHT");
        expect(sectionMemberObs.valueAsString).toBe("55.0");

        var memberInMemberSectionGroupTwo = memberSectionGroup.groupMembers[1];
        expect(memberInMemberSectionGroupTwo.concept.shortName).toBe("SectionTwoAddMore");
        expect(memberInMemberSectionGroupTwo.groupMembers.length).toBe(1);

        var sectionMemberObsTwo = memberInMemberSectionGroupTwo.groupMembers[0];
        expect(sectionMemberObsTwo.concept.shortName).toBe("WEIGHT");
        expect(sectionMemberObsTwo.valueAsString).toBe("65.0");

        var memberObs = memberSectionGroup.groupMembers[2];
        expect(memberObs.concept.shortName).toBe("HEIGHT");
        expect(memberObs.valueAsString).toBe("170.0");

    });

    it("should not fetch form details when form is not present", function () {
        var obsOne = {
            "groupMembers": [],
            "formFieldPath": "non existing form.1/4-0",
            "concept": {
                "uuid": "A5090A",
                "name": "HEIGHT",
                "dataType": "Numeric",
                "shortName": "HEIGHT"
            },
            "valueAsString": "170.0"
        };

        observations = [{"value": [obsOne]}];

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail");

        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        $scope.$apply();

        expect(formService.getAllForms.calls.any()).toBeTruthy();
        expect(formService.getFormDetail.calls.any()).toBeFalsy();
    });

    it("should not make call to updateObservationsWithRecordTree where no form definition response comes", function () {
        var obsOne = {
            "groupMembers": [],
            "formNamespace": "Bahmni",
            "formFieldPath": "FormWithObsInsideSection.5/2-0",
            "concept": {
                "shortName": "WEIGHT",
                "name": "WEIGHT",
                "conceptClass": "weight"
            },
            "valueAsString": "54"
        };

        var formDetailsResponse = {
            "data": {
                "resources": [{}]
            }

        };
        observations = [{"value": [obsOne]}];

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);
        spyOn(formRecordTreeBuildService, "updateObservationsWithRecordTree");

        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        formDetailDeferred.resolve(formDetailsResponse);
        $scope.$apply();

        expect(formRecordTreeBuildService.updateObservationsWithRecordTree.calls.any()).toBeFalsy();

    });

    it("should remove obs from obsList of given formFieldPath", function () {
        var obsOne = {
            "groupMembers": [],
            "formFieldPath": "sectionInSectionWithObsAddMore.1/4-0",
            "concept": {
                "uuid": "A5090A",
                "name": "HEIGHT",
                "dataType": "Numeric",
                "shortName": "HEIGHT"
            },
            "valueAsString": "170.0"
        };
        var obsTwo = {
            "groupMembers": [],
            "formFieldPath": "sectionInSectionWithObsAddMore.1/2-0/3-0",
            "concept": {
                "uuid": "A5090A",
                "name": "WEIGHT",
                "dataType": "Numeric",
                "shortName": "WEIGHT"
            },
            "valueAsString": "55.0"
        };

        var obsThree = {
            "groupMembers": [],
            "formFieldPath": "sectionInSectionWithObsAddMore.1/2-1/3-0",
            "concept": {
                "uuid": "A5090A",
                "name": "WEIGHT",
                "dataType": "Numeric",
                "shortName": "WEIGHT"
            },
            "valueAsString": "65.0"
        };

        var obsList = [obsOne, obsTwo, obsThree];

        var recordObservations = formRecordTreeBuildService.getRecordObservations("sectionInSectionWithObsAddMore.1/2-1/3-0", obsList);
        expect(recordObservations[0]).toBe(obsThree);
        expect(obsList.length).toBe(2);
    });

    it('should construct form for table with two columns having one obs each', function () {
        var obsOne = {
            "groupMembers": [],
            "formFieldPath": "tableForm.1/4-0",
            "concept": {
                "uuid": "A5090A",
                "name": "HEIGHT",
                "dataType": "Numeric",
                "shortName": "HEIGHT"
            },
            "valueAsString": "170.0"
        };
        var obsTwo = {
            "groupMembers": [],
            "formFieldPath": "tableForm.1/5-0",
            "concept": {
                "uuid": "A5090A",
                "name": "WEIGHT",
                "dataType": "Numeric",
                "shortName": "WEIGHT"
            },
            "valueAsString": "55.0"
        };

        observations = [{
            "value": [obsOne, obsTwo]
        }];

        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "sectionInSectionWithObsAddMore"
                    })
                }]
            }
        };

        formTranslationsDetails = {
            "data": {
                "labels":{"SECTION_1":["SectionOne"],"SECTION_2":["SectionAddMore"],"TABLE_1":["Table"],"COLUMN_1":["Column1"],"COLUMN_2":["Column2"]},
            }
        };

        var recordTree = {
            "children": [
                {
                    "active": true,
                    "children": [
                        {
                            "control": {
                                "label": {
                                    "id": "5",
                                    "value": "WEIGHT",
                                    "type": "label",
                                    "units": "(cms)"
                                },
                                "type": "obsControl",
                                "concept": {
                                    "name": "WEIGHT",
                                    "units": "(cms)"
                                },
                                "id": "5",
                                "properties": {
                                    "location": {
                                        "column": 0,
                                        "row": 0
                                    }
                                }
                            },
                            "formFieldPath": "tableForm.1/5-0",
                            "valueAsString": "55.0"
                        },
                        {
                            "control": {
                                "concept": {
                                    "name": "HEIGHT",
                                    "units": "(cms)"
                                },
                                "id": "4",
                                "label": {
                                    "id": "4",
                                    "type": "label",
                                    "units": "(cms)",
                                    "value": "HEIGHT"
                                },
                                "properties": {
                                    "location": {
                                        "column": 1,
                                        "row": 0
                                    }
                                },
                                "type": "obsControl"
                            },
                            "formFieldPath": "tableForm.1/4-0",
                            "valueAsString": "170.0"
                        }
                    ],
                    "control": {
                        "label": {
                            "id": "1",
                            "value": "Table",
                            "translationKey": "TABLE_1"
                        },
                        "type": "table",
                        "columnHeaders" :[
                            {
                                "label": {
                                    "id": "2",
                                    "value": "Column1"
                                },
                                "value": "Column1",
                                "type": "label",
                                "translationKey": "COLUMN_1"
                            },
                            {
                                "label": {
                                    "id": "3",
                                    "value": "Column2"
                                },
                                "value": "Column2",
                                "type": "label",
                                "translationKey": "COLUMN_2"
                            }
                        ],
                    },
                    "formFieldPath": "tableForm.1/1-0",
                    "showAddMore": false
                }
            ],
            "formFieldPath": ""
        };

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);
        spyOn(formService, "getFormTranslate").and.returnValue(formTranslateDeferred.promise);

        window.getRecordTree = function () {
            return recordTree;
        };

        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        formDetailDeferred.resolve(formDetails);
        formTranslateDeferred.resolve(formTranslationsDetails);

        $scope.$apply();

        var formGroup = observations[0].value[0];
        expect(formGroup.concept.shortName).toBe("tableForm");
        expect(formGroup.groupMembers.length).toBe(1);


        var tableGroup = formGroup.groupMembers[0];
        expect(tableGroup.concept.shortName).toBe("Table");
        expect(tableGroup.groupMembers.length).toBe(2);

        var firstColumnGroup = tableGroup.groupMembers[0];
        expect(firstColumnGroup.concept.shortName).toBe("Column1");
        expect(firstColumnGroup.groupMembers.length).toBe(1);

        var obsInColumnOne = firstColumnGroup.groupMembers[0];
        expect(obsInColumnOne.concept.shortName).toBe("WEIGHT");
        expect(obsInColumnOne.valueAsString).toBe("55.0");

        var secondColumnGroup = tableGroup.groupMembers[1];
        expect(secondColumnGroup.concept.shortName).toBe("Column2");
        expect(secondColumnGroup.groupMembers.length).toBe(1);

        var obsInColumnTwo = secondColumnGroup.groupMembers[0];
        expect(obsInColumnTwo.concept.shortName).toBe("HEIGHT");
        expect(obsInColumnTwo.valueAsString).toBe("170.0");

    });

    it('should construct form for table with two columns having one obs in only one column', function () {
        var obsOne = {
            "groupMembers": [],
            "formFieldPath": "tableForm.2/5-0",
            "concept": {
                "uuid": "A5090A",
                "name": "WEIGHT",
                "dataType": "Numeric",
                "shortName": "WEIGHT"
            },
            "valueAsString": "55.0"
        };

        observations = [{
            "value": [obsOne]
        }];

        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "sectionInSectionWithObsAddMore"
                    })
                }]
            }
        };

        formTranslationsDetails = {
            "data": {
                "labels":{"SECTION_1":["SectionOne"],"SECTION_2":["SectionAddMore"],"TABLE_1":["Table"],"COLUMN_1":["Column1"],"COLUMN_2":["Column2"]},
            }
        };

        var recordTree = {
            "children": [
                {
                    "active": true,
                    "children": [
                        {
                            "control": {
                                "label": {
                                    "id": "5",
                                    "value": "WEIGHT",
                                    "type": "label",
                                    "units": "(cms)"
                                },
                                "type": "obsControl",
                                "concept": {
                                    "name": "WEIGHT",
                                    "units": "(cms)"
                                },
                                "id": "5",
                                "properties": {
                                    "location": {
                                        "column": 0,
                                        "row": 0
                                    }
                                }
                            },
                            "formFieldPath": "tableForm.2/5-0",
                            "valueAsString": "55.0"
                        }
                    ],
                    "control": {
                        "label": {
                            "id": "1",
                            "value": "Table",
                            "translationKey": "TABLE_1"
                        },
                        "type": "table",
                        columnHeaders: [
                            {
                                "label": {
                                    "id": "2",
                                    "value": "Column1"
                                },
                                "value": "Column1",
                                "type": "label",
                                "translationKey": "COLUMN_1"
                            },
                            {
                                "label": {
                                    "id": "3",
                                    "value": "Column2"
                                },
                                "value": "Column2",
                                "type": "label",
                                "translationKey": "COLUMN_2"
                            },
                        ]
                    },
                    "formFieldPath": "tableForm.2/1-0",
                    "showAddMore": false,

                }
            ],
            "formFieldPath": ""
        };

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);
        spyOn(formService, "getFormTranslate").and.returnValue(formTranslateDeferred.promise);

        window.getRecordTree = function () {
            return recordTree;
        };

        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        formDetailDeferred.resolve(formDetails);
        formTranslateDeferred.resolve(formTranslationsDetails);

        $scope.$apply();

        var formGroup = observations[0].value[0];
        expect(formGroup.concept.shortName).toBe("tableForm");
        expect(formGroup.groupMembers.length).toBe(1);

        var tableGroup = formGroup.groupMembers[0];
        expect(tableGroup.concept.shortName).toBe("Table");
        expect(tableGroup.groupMembers.length).toBe(1);

        var firstColumnGroup = tableGroup.groupMembers[0];
        expect(firstColumnGroup.concept.shortName).toBe("Column1");
        expect(firstColumnGroup.groupMembers.length).toBe(1);

        var obsInColumnOne = firstColumnGroup.groupMembers[0];
        expect(obsInColumnOne.concept.shortName).toBe("WEIGHT");
        expect(obsInColumnOne.valueAsString).toBe("55.0");

    });

    it('should construct form for multi select observation', function () {
        var obsOne = {
            "groupMembers": [],
            "formFieldPath": "CodedForm.1/5-0",
            "concept": {
                "uuid": "A5090A",
                "name": "Speciality",
                "dataType": "Coded",
                "shortName": "MD, Medical History"
            },
            "valueAsString": "Susceptible"
        };

        var obsTwo = {
            "groupMembers": [],
            "formFieldPath": "CodedForm.1/5-0",
            "concept": {
                "uuid": "A5090A",
                "name": "Speciality",
                "dataType": "Coded",
                "shortName": "MD, Medical History"
            },
            "valueAsString": "Resistant"
        };

        observations = [{
            "value": [obsOne, obsTwo]
        }];

        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "CodedForm"
                    })
                }]
            }
        };

        var recordTree = {
            "formFieldPath": "",
            "children": [
                {
                    "valueMapper": {},
                    "control": {
                        "type": "obsControl",
                        "label": {
                            "translationKey": "MD,_MEDICAL_HISTORY_6",
                            "id": "6",
                            "units": "",
                            "type": "label",
                            "value": "MD, Medical History"
                        },
                        "properties": {
                            "multiSelect": true
                        },
                        "id": "6",
                        "concept": {
                            "name": "MD, Medical History"
                        }
                    },
                    "formFieldPath": "CodedForm.1/5-0",
                    "showAddMore": true
                }
            ]
        };

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);
        spyOn(formService, "getFormTranslate").and.returnValue(formTranslateDeferred.promise);

        window.getRecordTree = function () {
            return recordTree;
        };

        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        formDetailDeferred.resolve(formDetails);
        formTranslateDeferred.resolve(formTranslationsDetails);

        $scope.$apply();

        var formGroup = observations[0].value[0];
        expect(formGroup.concept.shortName).toBe("CodedForm");
        expect(formGroup.groupMembers.length).toBe(1);

        var obsMemberOne = formGroup.groupMembers[0];
        expect(obsMemberOne.concept.shortName).toBe("MD, Medical History");
        expect(obsMemberOne.type).toBe("multiSelect");
        expect(obsMemberOne.groupMembers.length).toBe(2);
        expect(obsMemberOne.groupMembers[0].valueAsString).toBe("Susceptible");
        expect(obsMemberOne.groupMembers[1].valueAsString).toBe("Resistant");
    });

    it('should construct form for multi select observation inside obsGroup', function () {
        var obsOne = {
            "groupMembers": [],
            "formFieldPath": "CodedForm.1/1-0/5-0",
            "concept": {
                "uuid": "A5090A",
                "name": "Speciality",
                "dataType": "Coded",
                "shortName": "MD, Medical History"
            },
            "valueAsString": "Susceptible"
        };

        var obsTwo = {
            "groupMembers": [],
            "formFieldPath": "CodedForm.1/1-0/5-0",
            "concept": {
                "uuid": "A5090A",
                "name": "Speciality",
                "dataType": "Coded",
                "shortName": "MD, Medical History"
            },
            "valueAsString": "Resistant"
        };

        var obsGroupOne = {
            "type": null,
            "formFieldPath": "CodedForm.1/1-0",
            "concept": {
                "name": "Obs Group ",
                "dataType": "N/A",
                "shortName": "My Obs Group",
                "conceptClass": "Misc",
                "set": true
            },
            "groupMembers": [obsOne, obsTwo]
        };

        observations = [{
            "value": [obsGroupOne]
        }];

        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "CodedForm"
                    })
                }]
            }
        };

        var recordTree = {
            "formFieldPath": "",
            "children": [
                {
                    "control": {
                        "type": "obsGroupControl",
                        "label": {
                            "type": "label",
                            "value": "My Obs Group",
                            "id": "1"
                        },
                        "id": "1",
                        "children": [
                            {
                                "control": {
                                    "type": "obsControl",
                                    "concept": {
                                        "name": "MD, Medical History"
                                    },
                                    "label": {
                                        "type": "label",
                                        "value": "Resistant",
                                        "id": "5"
                                    },
                                    "id": "5"
                                },
                                "formFieldPath": "CodedForm.1/1-0/5-0"
                            },
                            {
                                "control": {
                                    "type": "obsControl",
                                    "concept": {
                                        "name": "MD, Medical History"
                                    },
                                    "label": {
                                        "type": "label",
                                        "value": "Susceptible",
                                        "id": "5"
                                    },
                                    "id": "5"
                                },
                                "formFieldPath": "CodedForm.1/1-0/5-0"
                            }
                        ],
                        "formFieldPath": "CodedForm.1/1-0"
                    }
                }
            ]
        };

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);
        spyOn(formService, "getFormTranslate").and.returnValue(formTranslateDeferred.promise);

        window.getRecordTree = function () {
            return recordTree;
        };

        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        formDetailDeferred.resolve(formDetails);
        formTranslateDeferred.resolve(formTranslationsDetails);

        $scope.$apply();

        var formGroup = observations[0].value[0];
        expect(formGroup.concept.shortName).toBe("CodedForm");
        expect(formGroup.groupMembers.length).toBe(1);

        var obsGroup = formGroup.groupMembers[0];
        expect(obsGroup.concept.shortName).toBe("My Obs Group");
        expect(obsGroup.groupMembers.length).toBe(1);

        var obsMemberOne = obsGroup.groupMembers[0];
        expect(obsMemberOne.concept.shortName).toBe("MD, Medical History");
        expect(obsMemberOne.type).toBe("multiSelect");
        expect(obsMemberOne.groupMembers[0].valueAsString).toBe("Susceptible");
        expect(obsMemberOne.groupMembers[1].valueAsString).toBe("Resistant");
    });

    it('should construct form for multi select observation inside obsGroup having add more', function () {
        var obsOne = {
            "groupMembers": [],
            "formFieldPath": "CodedForm.1/1-0/5-0",
            "concept": {
                "uuid": "A5090A",
                "name": "Speciality",
                "dataType": "Coded",
                "shortName": "MD, Medical History"
            },
            "valueAsString": "Susceptible"
        };

        var obsTwo = {
            "groupMembers": [],
            "formFieldPath": "CodedForm.1/1-0/5-0",
            "concept": {
                "uuid": "A5090A",
                "name": "Speciality",
                "dataType": "Coded",
                "shortName": "MD, Medical History"
            },
            "valueAsString": "Resistant"
        };

        var obsThree = {
            "groupMembers": [],
            "formFieldPath": "CodedForm.1/1-1/5-0",
            "concept": {
                "uuid": "A5090A",
                "name": "Speciality",
                "dataType": "Coded",
                "shortName": "MD, Medical History"
            },
            "valueAsString": "Resistant"
        };

        var obsFour = {
            "groupMembers": [],
            "formFieldPath": "CodedForm.1/1-1/5-0",
            "concept": {
                "uuid": "A5090A",
                "name": "Speciality",
                "dataType": "Coded",
                "shortName": "MD, Medical History"
            },
            "valueAsString": "Susceptible"
        };

        var obsGroupOne = {
            "type": null,
            "formFieldPath": "CodedForm.1/1-0",
            "concept": {
                "name": "Obs Group ",
                "dataType": "N/A",
                "shortName": "My Obs Group",
                "conceptClass": "Misc",
                "set": true
            },
            "groupMembers": [obsOne, obsTwo]
        };

        var obsGroupTwo = {
            "type": null,
            "formFieldPath": "CodedForm.1/1-1",
            "concept": {
                "name": "Obs Group ",
                "dataType": "N/A",
                "shortName": "My Obs Group Add More",
                "conceptClass": "Misc",
                "set": true
            },
            "groupMembers": [obsThree, obsFour]
        };

        observations = [{
            "value": [obsGroupOne, obsGroupTwo]
        }];

        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "CodedForm"
                    })
                }]
            }
        };

        var recordTree = {
            "formFieldPath": "",
            "children": [
                {
                    "control": {
                        "type": "obsGroupControl",
                        "label": {
                            "type": "label",
                            "value": "My Obs Group",
                            "id": "1"
                        },
                        "id": "1",
                        "children": [
                            {
                                "control": {
                                    "type": "obsControl",
                                    "concept": {
                                        "name": "MD, Medical History"
                                    },
                                    "label": {
                                        "type": "label",
                                        "value": "Resistant",
                                        "id": "5"
                                    },
                                    "id": "5"
                                },
                                "formFieldPath": "CodedForm.1/1-0/5-0"
                            },
                            {
                                "control": {
                                    "type": "obsControl",
                                    "concept": {
                                        "name": "MD, Medical History"
                                    },
                                    "label": {
                                        "type": "label",
                                        "value": "Susceptible",
                                        "id": "5"
                                    },
                                    "id": "5"
                                },
                                "formFieldPath": "CodedForm.1/1-0/5-0"
                            }
                        ],
                        "formFieldPath": "CodedForm.1/1-0"
                    }
                }
            ]
        };

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);
        spyOn(formService, "getFormTranslate").and.returnValue(formTranslateDeferred.promise);

        window.getRecordTree = function () {
            return recordTree;
        };

        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        formDetailDeferred.resolve(formDetails);
        formTranslateDeferred.resolve(formTranslationsDetails);

        $scope.$apply();

        var formGroup = observations[0].value[0];

        expect(formGroup.concept.shortName).toBe("CodedForm");
        expect(formGroup.groupMembers.length).toBe(2);

        var obsGroup1 = formGroup.groupMembers[0];

        expect(obsGroup1.concept.shortName).toBe("My Obs Group");
        expect(obsGroup1.groupMembers.length).toBe(1);

        var multiSelectOne = obsGroup1.groupMembers[0];

        expect(multiSelectOne.concept.shortName).toBe("MD, Medical History");
        expect(multiSelectOne.type).toBe("multiSelect");
        expect(multiSelectOne.formFieldPath).toBe("CodedForm.1/1-0/5-0");
        expect(multiSelectOne.groupMembers[0].valueAsString).toBe("Susceptible");
        expect(multiSelectOne.groupMembers[1].valueAsString).toBe("Resistant");

        var obsGroup2 = formGroup.groupMembers[1];

        expect(obsGroup2.concept.shortName).toBe("My Obs Group Add More");
        expect(obsGroup2.groupMembers.length).toBe(1);

        var multiSelectTwo = obsGroup2.groupMembers[0];

        expect(multiSelectTwo.concept.shortName).toBe("MD, Medical History");
        expect(multiSelectTwo.formFieldPath).toBe("CodedForm.1/1-1/5-0");
        expect(multiSelectTwo.type).toBe("multiSelect");
        expect(multiSelectTwo.groupMembers[0].valueAsString).toBe("Resistant");
        expect(multiSelectTwo.groupMembers[1].valueAsString).toBe("Susceptible");
    });

    it('should return form name when list of form group members are passed', function () {
        var obsOne = {
            "groupMembers": [],
            "formFieldPath": "CodedForm.1/1-0/5-0",
            "concept": {
                "uuid": "A5090A",
                "name": "Speciality",
                "dataType": "Coded",
                "shortName": "MD, Medical History"
            },
            "valueAsString": "Susceptible"
        };

        var obsTwo = {
            "groupMembers": [],
            "formFieldPath": "CodedForm.1/1-0/5-0",
            "concept": {
                "uuid": "A5090A",
                "name": "Speciality",
                "dataType": "Coded",
                "shortName": "MD, Medical History"
            },
            "valueAsString": "Resistant"
        };
        var members = [obsOne, obsTwo];
        var formName = formRecordTreeBuildService.getFormName(members);
        expect(formName).toBe('CodedForm');
    });

    it('should return form version when list of form group members are passed with form field paths as null', function () {
        var obsOne = {
            "groupMembers": [],
            "formFieldPath": null,
            "concept": {
                "uuid": "A5090A",
                "name": "Speciality",
                "dataType": "Coded",
                "shortName": "MD, Medical History"
            },
            "valueAsString": "Susceptible"
        };

        var obsTwo = {
            "groupMembers": [],
            "formFieldPath": null,
            "concept": {
                "uuid": "A5090A",
                "name": "Speciality",
                "dataType": "Coded",
                "shortName": "MD, Medical History"
            },
            "valueAsString": "Resistant"
        };
        var members = [obsOne, obsTwo];
        var formName = formRecordTreeBuildService.getFormName(members);
        expect(formName).toBe(undefined);
    });

    it('should return form name when list of form group members are passed', function () {
        var obsOne = {
            "groupMembers": [],
            "formFieldPath": "CodedForm.5/1-0/5-0",
            "concept": {
                "uuid": "A5090A",
                "name": "Speciality",
                "dataType": "Coded",
                "shortName": "MD, Medical History"
            },
            "valueAsString": "Susceptible"
        };

        var obsTwo = {
            "groupMembers": [],
            "formFieldPath": "CodedForm.5/1-0/5-0",
            "concept": {
                "uuid": "A5090A",
                "name": "Speciality",
                "dataType": "Coded",
                "shortName": "MD, Medical History"
            },
            "valueAsString": "Resistant"
        };
        var members = [obsOne, obsTwo];
        var formVersion = formRecordTreeBuildService.getFormVersion(members);
        expect(formVersion).toBe('5');
    });

    it('should return form name when list of form group members are passed with form field paths as null', function () {
        var obsOne = {
            "groupMembers": [],
            "formFieldPath": null,
            "concept": {
                "uuid": "A5090A",
                "name": "Speciality",
                "dataType": "Coded",
                "shortName": "MD, Medical History"
            },
            "valueAsString": "Susceptible"
        };

        var obsTwo = {
            "groupMembers": [],
            "formFieldPath": null,
            "concept": {
                "uuid": "A5090A",
                "name": "Speciality",
                "dataType": "Coded",
                "shortName": "MD, Medical History"
            },
            "valueAsString": "Resistant"
        };
        var members = [obsOne, obsTwo];
        var formVersion = formRecordTreeBuildService.getFormVersion(members);
        expect(formVersion).toBe(undefined);
    });

    it("should return both form1 and form2 obs from build", function () {
        var obsOne = {
            "groupMembers": [],
            "formFieldPath": "formWithSectionAndObs.1/2-0",
            "concept": {
                "uuid": "A5090A",
                "name": "HEIGHT",
                "dataType": "Numeric",
                "shortName": "HEIGHT"
            },
            "valueAsString": "160.0"
        };
        var obsTwo = {
            "groupMembers": [],
            "formFieldPath": "formWithSectionAndObs.1/3-0",
            "concept": {
                "uuid": "A5089A",
                "name": "WEIGHT",
                "dataType": "Numeric",
                "shortName": "WEIGHT"
            },
            "valueAsString": "100.0"
        };
        var formOneObs = {
            "groupMembers": [{
                "groupMembers": [],
                "concept": {
                    "uuid": "A5089A",
                    "name": "Pressure",
                    "dataType": "Numeric",
                    "shortName": "Pressure"
                },
                "valueAsString": "10.0"
            }],
            "concept": {
                "uuid": "A5089A",
                "name": "TestForm1",
                "dataType": "N/A",
                "shortName": "TestForm1",
                "conceptClass": "Misc"
            }
        };
        observations = [{
            "value": [obsOne, obsTwo, formOneObs]
        }];

        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "formWithSectionAndObs"
                    })
                }]
            }
        };

        var recordTree = {
            "children": [
                {
                    "active": true,
                    "children": [
                        {
                            "control": {
                                "concept": {
                                    "name": "WEIGHT",
                                    "units": "(cms)"
                                },
                                "id": "3",
                                "label": {
                                    "id": "3",
                                    "type": "label",
                                    "units": "(cms)",
                                    "value": "WEIGHT"
                                },
                                "properties": {},
                                "type": "obsControl"
                            },
                            "formFieldPath": "formWithSectionAndObs.1/3-0",
                            "valueAsString": "100.0"
                        }
                    ],
                    "control": {
                        "label": {
                            "id": "1",
                            "value": "SectionOne",
                            "translationKey": "SECTION_1"
                        },
                        "type": "section"
                    },
                    "formFieldPath": "formWithSectionAndObs.1/1-0",
                    "showAddMore": true
                },
                {
                    "control": {
                        "concept": {
                            "name": "HEIGHT",
                            "units": "(cms)"
                        },
                        "id": "2",
                        "label": {
                            "id": "2",
                            "type": "label",
                            "units": "(cms)",
                            "value": "HEIGHT"
                        },
                        "properties": {},
                        "type": "obsControl"
                    },
                    "formFieldPath": "formWithSectionAndObs.1/2-0",
                    "valueAsString": "160.0"
                }
            ],
            "formFieldPath": ""
        };

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);
        spyOn(formService, "getFormTranslate").and.returnValue(formTranslateDeferred.promise);

        window.getRecordTree = function () {
            return recordTree;
        };

        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        formDetailDeferred.resolve(formDetails);
        formTranslateDeferred.resolve(formTranslationsDetails);

        $scope.$apply();

        expect(observations[0].value.length).toBe(2);
    });

    it("should construct form 2 hierarchy when both form 1 and form 2 observations are present", function () {
        var obsOne = {
            "groupMembers": [],
            "formFieldPath": "formWithSectionAndObs.1/2-0",
            "concept": {
                "uuid": "A5090A",
                "name": "HEIGHT",
                "dataType": "Numeric",
                "shortName": "HEIGHT"
            },
            "valueAsString": "160.0"
        };
        var obsTwo = {
            "groupMembers": [],
            "formFieldPath": "formWithSectionAndObs.1/3-0",
            "concept": {
                "uuid": "A5089A",
                "name": "WEIGHT",
                "dataType": "Numeric",
                "shortName": "WEIGHT"
            },
            "valueAsString": "100.0"
        };
        var form1Obs = {
            "groupMembers": [{
                "groupMembers": [],
                "concept": {
                    "uuid": "A5089A",
                    "name": "Pressure",
                    "dataType": "Numeric",
                    "shortName": "Pressure"
                },
                "valueAsString": "10.0"
            }],
            "concept": {
                "uuid": "A5089A",
                "name": "TestForm1",
                "dataType": "N/A",
                "shortName": "TestForm1",
                "conceptClass": "Misc"
            }
        };
        observations = [{
            "value": [obsOne, obsTwo, form1Obs]
        }];

        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "formWithSectionAndObs"
                    })
                }]
            }
        };

        var recordTree = {
            "children": [
                {
                    "active": true,
                    "children": [
                        {
                            "control": {
                                "concept": {
                                    "name": "WEIGHT",
                                    "units": "(cms)"
                                },
                                "id": "3",
                                "label": {
                                    "id": "3",
                                    "type": "label",
                                    "units": "(cms)",
                                    "value": "WEIGHT"
                                },
                                "properties": {},
                                "type": "obsControl"
                            },
                            "formFieldPath": "formWithSectionAndObs.1/3-0",
                            "valueAsString": "100.0"
                        }
                    ],
                    "control": {
                        "label": {
                            "id": "1",
                            "value": "SectionOne",
                            "translationKey": "SECTION_1"
                        },
                        "type": "section"
                    },
                    "formFieldPath": "formWithSectionAndObs.1/1-0",
                    "showAddMore": true
                },
                {
                    "control": {
                        "concept": {
                            "name": "HEIGHT",
                            "units": "(cms)"
                        },
                        "id": "2",
                        "label": {
                            "id": "2",
                            "type": "label",
                            "units": "(cms)",
                            "value": "HEIGHT"
                        },
                        "properties": {},
                        "type": "obsControl"
                    },
                    "formFieldPath": "formWithSectionAndObs.1/2-0",
                    "valueAsString": "160.0"
                }
            ],
            "formFieldPath": ""
        };

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);
        spyOn(formService, "getFormTranslate").and.returnValue(formTranslateDeferred.promise);

        window.getRecordTree = function () {
            return recordTree;
        };

        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        formDetailDeferred.resolve(formDetails);
        formTranslateDeferred.resolve(formTranslationsDetails);

        $scope.$apply();

        expect(observations[0].value.length).toBe(2);

        var formOneConceptSet = observations[0].value[0];
        expect(formOneConceptSet.concept.name).toBe("TestForm1");

        var formGroup = observations[0].value[1];
        expect(formGroup.concept.shortName).toBe("formWithSectionAndObs");

        expect(formGroup.groupMembers.length).toBe(2);
        var memberSectionGroup = formGroup.groupMembers[0];
        expect(memberSectionGroup.concept.shortName).toBe("SectionOne");

        expect(memberSectionGroup.groupMembers.length).toBe(1);
        var sectionMemberObs = memberSectionGroup.groupMembers[0];
        expect(sectionMemberObs.concept.shortName).toBe("WEIGHT");

        expect(sectionMemberObs.valueAsString).toBe("100.0");
        var memberObs = formGroup.groupMembers[1];
        expect(memberObs.concept.shortName).toBe("HEIGHT");

        expect(memberObs.valueAsString).toBe("160.0");
    });

    it('should return multiSelect observations with out hierarchy when hasNoHierarchy is true', function () {

        const obsOne = {
            "groupMembers": [],
            "formFieldPath": "CodedForm.1/5-0",
            "concept": {
                "uuid": "A5090A",
                "name": "Speciality",
                "dataType": "Coded",
                "shortName": "MD, Medical History"
            },
            "valueAsString": "Susceptible"
        };

        const obsTwo = {
            "groupMembers": [],
            "formFieldPath": "CodedForm.1/5-0",
            "concept": {
                "uuid": "A5090A",
                "name": "Speciality",
                "dataType": "Coded",
                "shortName": "MD, Medical History"
            },
            "valueAsString": "Resistant"
        };

        observations = [{
            "value": [obsOne, obsTwo]
        }];

        const formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "CodedForm"
                    })
                }]
            }
        };

        const recordTree = {
            "formFieldPath": "",
            "children": [
                {
                    "active": true,
                    "children": [
                        {
                            "valueMapper": {},
                            "control": {
                                "type": "obsControl",
                                "label": {
                                    "translationKey": "MD,_MEDICAL_HISTORY_6",
                                    "id": "6",
                                    "units": "",
                                    "type": "label",
                                    "value": "MD, Medical History"
                                },
                                "properties": {
                                    "multiSelect": true
                                },
                                "id": "6",
                                "concept": {
                                    "name": "MD, Medical History"
                                }
                            },
                            "formFieldPath": "CodedForm.1/5-0",
                            "showAddMore": false
                        }
                    ],
                    "control": {
                        "label": {
                            "id": "1",
                            "value": "SectionOne"
                        },
                        "type": "section"
                    },
                    "formFieldPath": "CodedForm.1/1-0",
                    "showAddMore": false
                }
            ]
        };

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);
        window.getRecordTree = function () {
            return recordTree;
        };

        formRecordTreeBuildService.build(observations, true);
        allFormsDeferred.resolve(allFormsResponse);
        formDetailDeferred.resolve(formDetails);
        $scope.$apply();


        expect(observations[0].value.length).toBe(1);

        let multiSelectObservation = observations[0].value[0];

        expect(multiSelectObservation.concept.shortName).toBe("MD, Medical History");
        expect(multiSelectObservation.groupMembers.length).toBe(2);
        expect(multiSelectObservation.type).toBe("multiSelect");
        expect(multiSelectObservation.groupMembers[0].valueAsString).toBe("Susceptible");
        expect(multiSelectObservation.groupMembers[1].valueAsString).toBe("Resistant");
    });

    it('should return observations with out hierarchy when hasNoHierarchy is true', function () {

        const obsOne = {
            "groupMembers": [],
            "formFieldPath": "CodedForm.1/5-0",
            "concept": {
                "uuid": "A5090A",
                "name": "Speciality",
                "dataType": "Coded",
                "shortName": "MD, Medical History"
            },
            "valueAsString": "Susceptible"
        };

        const obsTwo = {
            "groupMembers": [],
            "formFieldPath": "CodedForm.1/6-0",
            "concept": {
                "uuid": "A5090A",
                "name": "Dummy Observation",
                "dataType": "Coded",
                "shortName": "Dummy Observation"
            },
            "valueAsString": "Resistant"
        };

        observations = [{
            "value": [obsOne, obsTwo]
        }];

        const formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "CodedForm"
                    })
                }]
            }
        };

        const recordTree = {
            "formFieldPath": "",
            "children": [
                {
                    "active": true,
                    "children": [
                        {
                            "valueMapper": {},
                            "control": {
                                "type": "obsControl",
                                "label": {
                                    "translationKey": "MD,_MEDICAL_HISTORY_6",
                                    "id": "6",
                                    "units": "",
                                    "type": "label",
                                    "value": "MD, Medical History"
                                },
                                "properties": {},
                                "id": "6",
                                "concept": {
                                    "name": "MD, Medical History"
                                }
                            },
                            "formFieldPath": "CodedForm.1/5-0",
                            "showAddMore": false
                        },
                        {
                            "valueMapper": {},
                            "control": {
                                "type": "obsControl",
                                "label": {
                                    "translationKey": "MD,_MEDICAL_HISTORY_6",
                                    "id": "6",
                                    "units": "",
                                    "type": "label",
                                    "value": "Dummy Observation"
                                },
                                "properties": {},
                                "id": "6",
                                "concept": {
                                    "name": "Dummy Observation"
                                }
                            },
                            "formFieldPath": "CodedForm.1/6-0",
                            "showAddMore": false
                        }
                    ],
                    "control": {
                        "label": {
                            "id": "1",
                            "value": "SectionOne"
                        },
                        "type": "section"
                    },
                    "formFieldPath": "CodedForm.1/1-0",
                    "showAddMore": false
                }
            ]
        };

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);
        window.getRecordTree = function () {
            return recordTree;
        };

        formRecordTreeBuildService.build(observations, true);
        allFormsDeferred.resolve(allFormsResponse);
        formDetailDeferred.resolve(formDetails);
        $scope.$apply();

        expect(observations[0].value.length).toBe(2);

        const observationOne = observations[0].value[0];
        const observationTwo = observations[0].value[1];

        expect(observationOne.concept.shortName).toBe("MD, Medical History");
        expect(observationOne.formFieldPath).toBe("CodedForm.1/5-0");
        expect(observationOne.valueAsString).toBe("Susceptible");

        expect(observationTwo.concept.shortName).toBe("Dummy Observation");
        expect(observationTwo.formFieldPath).toBe("CodedForm.1/6-0");
        expect(observationTwo.valueAsString).toBe("Resistant");
    });

    it("should construct form 2 hirearchy with translated name for section", function () {
        var obsOne = {
            "groupMembers": [],
            "formFieldPath": "testSectionWithAnObs.1/4-0",
            "concept": {
                "uuid": "A5090A",
                "name": "HEIGHT",
                "dataType": "Numeric",
                "shortName": "HEIGHT"
            },
            "valueAsString": "170.0"
        };

        observations = [{
            "value": [obsOne]
        }];

        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "obsGroupInSectionAddMore"
                    })
                }]
            }
        };

        var formTranslationsDetails = {
            "data" : {
                "labels":{"SECTION_1":["french name"]}
            }
        };

        var recordTree = {
            "children": [
                {
                    "active": true,
                    "children": [
                        {
                            "control": {
                                "concept": {
                                    "name": "HEIGHT",
                                    "units": "(cms)"
                                },
                                "id": "4",
                                "label": {
                                    "id": "4",
                                    "type": "label",
                                    "units": "(cms)",
                                    "value": "HEIGHT"
                                },
                                "properties": {},
                                "type": "obsControl"
                            },
                            "formFieldPath": "testSectionWithAnObs.1/4-0",
                            "valueAsString": "170.0"
                        }
                    ],
                    "control": {
                        "label": {
                            "id": "1",
                            "value": "SectionOne",
                            "translationKey": "SECTION_1"
                        },
                        "type": "section"
                    },
                    "formFieldPath": "testSectionWithAnObs.1/1-0",
                    "showAddMore": false
                }
            ],
            "formFieldPath": ""
        };

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);
        spyOn(formService, "getFormTranslate").and.returnValue(formTranslateDeferred.promise);
        window.getRecordTree = function () {
            return recordTree;
        };

        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        formDetailDeferred.resolve(formDetails);
        formTranslateDeferred.resolve(formTranslationsDetails);
        $scope.$apply();

        var formGroup = observations[0].value[0];
        expect(formGroup.concept.shortName).toBe("testSectionWithAnObs");
        expect(formGroup.groupMembers.length).toBe(1);

        var memberSectionGroup = formGroup.groupMembers[0];
        expect(memberSectionGroup.concept.shortName).toBe("french name");

    });
    it("should construct form 2 hirearchy with translated name for section inside section", function () {
        var obsOne = {
            "groupMembers": [],
            "formFieldPath": "sectionInSectionWithObs.1/4-0",
            "concept": {
                "uuid": "A5090A",
                "name": "HEIGHT",
                "dataType": "Numeric",
                "shortName": "HEIGHT"
            },
            "valueAsString": "170.0"
        };
        var obsTwo = {
            "groupMembers": [],
            "formFieldPath": "sectionInSectionWithObs.1/3-0",
            "concept": {
                "uuid": "A5090A",
                "name": "WEIGHT",
                "dataType": "Numeric",
                "shortName": "WEIGHT"
            },
            "valueAsString": "55.0"
        };

        observations = [{
            "value": [obsOne, obsTwo]
        }];

        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "obsGroupInSectionAddMore"
                    })
                }]
            }
        };

        var formTranslationsDetails = {
            "data" :{
                "labels":{"SECTION_1":["french1"],"SECTION_2":["french2"]}
            }
        };

        var recordTree = {
            "children": [
                {
                    "active": true,
                    "children": [
                        {
                            "active": true,
                            "children": [
                                {
                                    "control": {
                                        "concept": {
                                            "name": "WEIGHT",
                                            "units": "(cms)"
                                        },
                                        "id": "3",
                                        "label": {
                                            "id": "3",
                                            "type": "label",
                                            "units": "(cms)",
                                            "value": "WEIGHT"
                                        },
                                        "properties": {},
                                        "type": "obsControl"
                                    },
                                    "formFieldPath": "sectionInSectionWithObs.1/3-0",
                                    "valueAsString": "55.0"
                                }
                            ],
                            "control": {
                                "label": {
                                    "id": "2",
                                    "value": "SectionTwo",
                                    "translationKey": "SECTION_2"
                                },
                                "type": "section"
                            },
                            "formFieldPath": "sectionInSectionWithObs.1/2-0",
                            "showAddMore": false
                        },
                        {
                            "control": {
                                "concept": {
                                    "name": "HEIGHT",
                                    "units": "(cms)"
                                },
                                "id": "4",
                                "label": {
                                    "id": "4",
                                    "type": "label",
                                    "units": "(cms)",
                                    "value": "HEIGHT"
                                },
                                "properties": {},
                                "type": "obsControl"
                            },
                            "formFieldPath": "sectionInSectionWithObs.1/4-0",
                            "valueAsString": "170.0"
                        }
                    ],
                    "control": {
                        "label": {
                            "id": "1",
                            "value": "SectionOne",
                            "translationKey": "SECTION_1"
                        },
                        "type": "section"
                    },
                    "formFieldPath": "sectionInSectionWithObs.1/1-0",
                    "showAddMore": false
                }
            ],
            "formFieldPath": ""
        };

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);
        spyOn(formService, "getFormTranslate").and.returnValue(formTranslateDeferred.promise);
        window.getRecordTree = function () {
            return recordTree;
        };

        formRecordTreeBuildService.build(observations);
        allFormsDeferred.resolve(allFormsResponse);
        formDetailDeferred.resolve(formDetails);
        formTranslateDeferred.resolve(formTranslationsDetails);
        $scope.$apply();

        var formGroup = observations[0].value[0];
        expect(formGroup.concept.shortName).toBe("sectionInSectionWithObs");
        expect(formGroup.groupMembers.length).toBe(1);

        var memberSectionGroup = formGroup.groupMembers[0];
        expect(memberSectionGroup.concept.shortName).toBe("french1");
        expect(memberSectionGroup.groupMembers.length).toBe(2);

        var memberInMemberSectionGroup = memberSectionGroup.groupMembers[0];
        expect(memberInMemberSectionGroup.concept.shortName).toBe("french2");
        expect(memberInMemberSectionGroup.groupMembers.length).toBe(1);

        var sectionMemberObs = memberInMemberSectionGroup.groupMembers[0];
        expect(sectionMemberObs.concept.shortName).toBe("WEIGHT");
        expect(sectionMemberObs.valueAsString).toBe("55.0");

        var memberObs = memberSectionGroup.groupMembers[1];
        expect(memberObs.concept.shortName).toBe("HEIGHT");
        expect(memberObs.valueAsString).toBe("170.0");

    });
});
