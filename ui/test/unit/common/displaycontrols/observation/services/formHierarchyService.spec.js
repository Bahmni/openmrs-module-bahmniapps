'use strict';

describe("FormHierarchyService", function () {
    var formHierarchyService;
    var $q;
    var $scope;
    var observations;
    var allForms;
    var formService;
    beforeEach(module('bahmni.common.displaycontrol.observation'));
    beforeEach(inject(function (_formHierarchyService_, _$q_, _$rootScope_, _formService_) {
        formHierarchyService = _formHierarchyService_;
        formService = _formService_;
        $q = _$q_;
        $scope = _$rootScope_;
        allForms = {
                "data": [
                    {
                        "version": "1",
                        "name": "test section inside section",
                        "uuid": "f2d48fb3-75c7-4ab5-93d0-413b9bdcd9cd"
                    },
                    {
                        "version": "1",
                        "name": "test section with an obs",
                        "uuid": "7defedec-d983-4b59-a1a7-cb40cf6b0cf1"
                    },
                    {
                        "version": "1",
                        "name": "test section with an obs and outside obs",
                        "uuid": "8930383a-69ec-4a27-a7f9-1238ae8a3b48"
                    },
                    {
                        "version": "1",
                        "name": "test section with obs group",
                        "uuid": "1b734eb2-f9d0-479a-adb9-da10661343b6"
                    },
                    {
                        "version": "1",
                        "name": "test single",
                        "uuid": "5fc39965-9788-4ffc-bfdb-10d7cf13ad3b"
                    },
                    {
                        "version": "2",
                        "name": "test section with an obs",
                        "uuid": "version2"
                    },
                    {
                        "version": "3",
                        "name": "test single",
                        "uuid": "0e6d396c-133c-45c3-8ca6-340b691ada4f"
                    },
                    {
                        "version": "4",
                        "name": "test single",
                        "uuid": "24484918-aceb-461c-b81c-81102979b3b5"
                    },
                    {
                        "version": "5",
                        "name": "test single",
                        "uuid": "6f458b2f-cf2e-463a-b49e-6bd4c8dcaaea"
                    },
                    {
                        "version": "1",
                        "name": "test single option id",
                        "uuid": "f63f4dc6-c591-4d8f-8f33-d6435ebefeca"
                    },
                    {
                        "version": "1",
                        "name": "test add more",
                        "uuid": "f63f4dc6-c591-4d8f-8f33-d6435ebea"
                    }
                ]
        };
    }));

    it("should process multiple select type to observation", function () {
        var observations = [{
            "key": "1488782460000",
            "value": [{
                "type": "multiSelect",
                "concept": {
                    "uuid": "c4517f49-3f10-11e4-adec-0800271c1b75",
                    "shortName": "P/A Presenting Part"
                },
                "groupMembers": [{
                    "groupMembers": [],
                    "concept": {
                        "uuid": "c4517f49-3f10-11e4-adec-0800271c1b75",
                        "shortName": "P/A Presenting Part"
                    },
                    "formFieldPath": "test single.5/2-0",
                    "valueAsString": "Breech",
                    "value": {
                        "uuid": "c45329de-3f10-11e4-adec-0800271c1b75",
                        "shortName": "Breech"
                    },
                    "conceptConfig": {"multiSelect": true}
                }],
                "conceptConfig": {"multiSelect": true}
            }]
        }];

        formHierarchyService.build(observations);

        var value = observations[0].value[0];
        expect(value.concept.shortName).toBe("test single");
        expect(value.groupMembers.length).toBe(1);
        expect(value.groupMembers[0].concept.shortName).toBe("P/A Presenting Part");
    });

    it("should construct dummy obs group for single observation from form", function () {
        var observations = [{
            "key": "1488782460000",
            "value": [{
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
            }],
            "date": "1488782460000",
            "isOpen": true
        }];

        formHierarchyService.build(observations);

        var value = observations[0].value[0];
        expect(value.concept.shortName).toBe("myForm");
        expect(value.groupMembers.length).toBe(1);
        expect(value.groupMembers[0].concept.shortName).toBe("Sickling Test");
    });

    it('should construct dummy obs group for single observation from form within multiple observations', function () {
        var observations = [{
            "value": [{
                "targetObsRelation": null,
                "groupMembers": [{
                    "formNamespace": null,
                    "formFieldPath": null,
                    "concept": {
                        "name": "SPO2 Data",
                        "shortName": "SPO2",
                    },
                    "valueAsString": "100.0",
                    "conceptNameToDisplay": "SPO2",
                }],
                "formNamespace": null,
                "formFieldPath": null,
                "concept": {
                    "name": "Vitals",
                    "shortName": "Vitals",
                },
            }, {
                "groupMembers": [],
                "formNamespace": "Bahmni",
                "formFieldPath": "test.1/1-0",
                "concept": {
                    "name": "HEAD Nose lateral",
                    "shortName": "head nose lateral",
                }
            }]
        }];

        formHierarchyService.build(observations);

        var firstValue = observations[0].value[0];
        expect(firstValue.concept.shortName).toBe('Vitals');
        expect(firstValue.groupMembers.length).toBe(1);
        expect(firstValue.groupMembers[0].concept.shortName).toBe("SPO2");

        var secondValue = observations[0].value[1];
        expect(secondValue.concept.shortName).toBe('test');
        expect(secondValue.groupMembers.length).toBe(1);
        expect(secondValue.groupMembers[0].concept.shortName).toBe("head nose lateral");
    });

    it('should construct dummy obs group for multiple observations from one form', function () {
        var observations = [{
            "key": "1488790440000",
            "value": [{
                "groupMembers": [],
                "formNamespace": "Bahmni",
                "formFieldPath": "test.2/2-0",
                "concept": {
                    "shortName": "HEIGHT"
                }
            }, {
                "groupMembers": [],
                "formNamespace": "Bahmni",
                "formFieldPath": "test.2/1-0",
                "concept": {
                    "shortName": "head nose lateral"
                }

            }]
        }]

        formHierarchyService.build(observations);

        expect(observations[0].value.length).toBe(1);

        var firstValue = observations[0].value[0];
        expect(firstValue.concept.shortName).toBe('test');
        expect(firstValue.groupMembers.length).toBe(2);
        expect(firstValue.groupMembers[0].concept.shortName).toBe("HEIGHT");
        expect(firstValue.groupMembers[1].concept.shortName).toBe("head nose lateral");
    });

    it('should construct dummy obs group for obsGroup observations from one form', function () {
        var observations = [{
            "value": [{
                "groupMembers": [{
                    "groupMembers": [{
                        "groupMembers": [],
                        "formFieldPath": "hello.1/14-0",
                        "concept": {
                            "shortName": "Temperature"
                        }
                    }, {
                        "groupMembers": [],
                        "formFieldPath": "hello.1/13-0",
                        "concept": {
                            "shortName": "Temperature Abnormal"
                        }
                    }],
                    "formFieldPath": "hello.1/26-0",
                    "concept": {
                        "shortName": "Blood Pressure"
                    }
                }, {
                    "groupMembers": [],
                    "formNamespace": "Bahmni",
                    "formFieldPath": "hello.1/15-0",
                    "concept": {
                        "shortName": "Temperature"
                    }
                }, {
                    "groupMembers": [],
                    "formFieldPath": "hello.1/12-0",
                    "concept": {
                        "shortName": "RR"
                    }
                }, {
                    "groupMembers": [],
                    "formFieldPath": "hello.1/9-0",
                    "concept": {
                        "shortName": "SPO2"
                    }
                }],
                "formFieldPath": "hello.1/3-0",
                "concept": {
                    "shortName": "Vitals"
                }
            }, {
                "groupMembers": [],
                "formFieldPath": "hello.1/1-0",
                "concept": {
                    "shortName": "HEIGHT"
                }
            }, {
                "groupMembers": [],
                "formFieldPath": "hello.1/2-0",

                "concept": {
                    "shortName": "WEIGHT"
                }
            }]
        }];


        formHierarchyService.build(observations);

        expect(observations[0].value.length).toBe(1);
        var firstValue = observations[0].value[0];
        expect(firstValue.concept.shortName).toBe('hello');

        expect(firstValue.groupMembers.length).toBe(3);
        expect(firstValue.groupMembers[0].concept.shortName).toBe("Vitals");
        expect(firstValue.groupMembers[0].groupMembers.length).toBe(4);
        expect(firstValue.groupMembers[0].groupMembers[0].concept.shortName)
            .toBe("Blood Pressure");

        expect(firstValue.groupMembers[1].concept.shortName).toBe("HEIGHT");
        expect(firstValue.groupMembers[2].concept.shortName).toBe("WEIGHT");

    });

    it('should construct dummy obs group for multiple observations from different form', function () {
        var observations = [{
            "key": "1488790440000",
            "value": [{
                "groupMembers": [],
                "formNamespace": "Bahmni",
                "formFieldPath": "test.2/2-0",
                "concept": {
                    "shortName": "HEIGHT"
                }
            }, {
                "groupMembers": [],
                "formNamespace": "Bahmni",
                "formFieldPath": "test1.2/2-0",
                "concept": {
                    "shortName": "HEIGHT"
                }
            }, {
                "groupMembers": [],
                "formNamespace": "Bahmni",
                "formFieldPath": "test.2/1-0",
                "concept": {
                    "shortName": "head nose lateral"
                },
            }, {
                "groupMembers": [],
                "formNamespace": "Bahmni",
                "formFieldPath": "test1.2/1-0",
                "concept": {
                    "shortName": "head nose lateral"
                },
            }]
        }]

        formHierarchyService.build(observations);

        expect(observations[0].value.length).toBe(2);

        var firstValue = observations[0].value[0];
        expect(firstValue.concept.shortName).toBe('test');
        expect(firstValue.groupMembers.length).toBe(2);
        expect(firstValue.groupMembers[0].concept.shortName).toBe("HEIGHT");
        expect(firstValue.groupMembers[1].concept.shortName).toBe("head nose lateral");

        var secondValue = observations[0].value[1];
        expect(secondValue.concept.shortName).toBe('test1');
        expect(secondValue.groupMembers.length).toBe(2);
        expect(secondValue.groupMembers[0].concept.shortName).toBe("HEIGHT");
        expect(secondValue.groupMembers[1].concept.shortName).toBe("head nose lateral");
    });

    it("should display information when add more obs controls exist", function () {
        var observations = [{
            "value": [{
                "groupMembers": [{
                    "groupMembers": [],
                    "formNamespace": "Bahmni",
                    "formFieldPath": "test section with an obs.1/1-0",
                    "concept": {
                        "shortName": "WEIGHT",
                        "name": "WEIGHT",
                        "conceptClass": "weight"
                    },
                    "valueAsString": "50.0"
                },{
                    "groupMembers": [],
                    "formNamespace": "Bahmni",
                    "formFieldPath": "test section with an obs.1/1-1",
                    "concept": {
                        "shortName": "WEIGHT",
                        "name": "WEIGHT",
                        "conceptClass": "weight"
                    },
                    "valueAsString": "100.0"
                },{
                    "groupMembers": [],
                    "formNamespace": "Bahmni",
                    "formFieldPath": "test section with an obs.1/1-2",
                    "concept": {
                        "shortName": "WEIGHT",
                        "name": "WEIGHT",
                        "conceptClass": "weight"
                    },
                    "valueAsString": "150.0"
                }], "concept": {"shortName": "test add more", "conceptClass": null},
                "encounterUuid": "123"
            }]
        }];
        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "test add more",
                        "controls": [{
                            "type": "obsControl",
                            "label": {"type": "label", "value": "WEIGHT"},
                            "id": "1"
                        }]
                    })
                }]
            }

        };

        var formDetailDeferred = $q.defer();
        var allFormsDeferred = $q.defer();

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);

        formHierarchyService.build(observations);
        allFormsDeferred.resolve(allForms);
        formDetailDeferred.resolve(formDetails);
        $scope.$apply();

        var value = observations[0].value[0];
        expect(value.concept.shortName).toBe("test add more");
        expect(value.groupMembers.length).toBe(3);

        expect(value.groupMembers[0].concept.shortName).toBe("WEIGHT");
        expect(value.groupMembers[1].concept.shortName).toBe("WEIGHT");
        expect(value.groupMembers[2].concept.shortName).toBe("WEIGHT");

        expect(value.groupMembers[0].valueAsString).toBe("50.0");
        expect(value.groupMembers[1].valueAsString).toBe("100.0");
        expect(value.groupMembers[2].valueAsString).toBe("150.0");

    });

    it("should display information in sequence as input for add more obs controls", function () {
        var observations = [{
            "value": [{
                "groupMembers": [{
                    "groupMembers": [],
                    "formNamespace": "Bahmni",
                    "formFieldPath": "test section with an obs.1/1-2",
                    "concept": {
                        "shortName": "WEIGHT",
                        "name": "WEIGHT",
                        "conceptClass": "weight"
                    },
                    "valueAsString": "150.0"
                },{
                    "groupMembers": [],
                    "formNamespace": "Bahmni",
                    "formFieldPath": "test section with an obs.1/1-1",
                    "concept": {
                        "shortName": "WEIGHT",
                        "name": "WEIGHT",
                        "conceptClass": "weight"
                    },
                    "valueAsString": "100.0"
                },{
                    "groupMembers": [],
                    "formNamespace": "Bahmni",
                    "formFieldPath": "test section with an obs.1/1-0",
                    "concept": {
                        "shortName": "WEIGHT",
                        "name": "WEIGHT",
                        "conceptClass": "weight"
                    },
                    "valueAsString": "50.0"
                }], "concept": {"shortName": "test add more", "conceptClass": null},
                "encounterUuid": "123"
            }]
        }];
        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "test add more",
                        "controls": [{
                            "type": "obsControl",
                            "label": {"type": "label", "value": "WEIGHT"},
                            "id": "1"
                        }]
                    })
                }]
            }

        };

        var formDetailDeferred = $q.defer();
        var allFormsDeferred = $q.defer();

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);

        formHierarchyService.build(observations);
        allFormsDeferred.resolve(allForms);
        formDetailDeferred.resolve(formDetails);
        $scope.$apply();

        var value = observations[0].value[0];
        expect(value.concept.shortName).toBe("test add more");
        expect(value.groupMembers.length).toBe(3);

        expect(value.groupMembers[0].concept.shortName).toBe("WEIGHT");
        expect(value.groupMembers[1].concept.shortName).toBe("WEIGHT");
        expect(value.groupMembers[2].concept.shortName).toBe("WEIGHT");

        expect(value.groupMembers[0].valueAsString).toBe("50.0");
        expect(value.groupMembers[1].valueAsString).toBe("100.0");
        expect(value.groupMembers[2].valueAsString).toBe("150.0");

    });

    it("should construct dummy obs group for single observation in section from form", function () {
        observations = [{
            "value": [{
                "groupMembers": [{
                    "groupMembers": [],
                    "formNamespace": "Bahmni",
                    "formFieldPath": "test section with an obs.1/3-0",
                    "concept": {
                        "shortName": "WEIGHT",
                        "name": "WEIGHT",
                        "conceptClass": "weight"
                    },
                    "valueAsString": "50.0"
                }], "concept": {"shortName": "test section with an obs", "conceptClass": null},
                "encounterUuid": "123"
            }]
        }];
        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "test section with an obs",
                        "controls": [{
                            "type": "section",
                            "label": {"type": "label", "value": "Outer Section"},
                            "id": "2",
                            "controls": [{
                                "type": "obsControl",
                                "label": {"type": "label", "value": "WEIGHT"},
                                "id": "3"
                            }]
                        }]
                    })
                }]
            }

        };

        var formDetailDeferred = $q.defer();
        var allFormsDeferred = $q.defer();

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);

        formHierarchyService.build(observations);
        allFormsDeferred.resolve(allForms)
        formDetailDeferred.resolve(formDetails);
        $scope.$apply();

        var dummyObsGroup = observations[0].value[0];
        expect(dummyObsGroup.concept.shortName).toBe("test section with an obs");

        var layer1FirstGroupMember = dummyObsGroup.groupMembers[0];
        expect(layer1FirstGroupMember.concept.shortName).toBe("Outer Section");
        expect(layer1FirstGroupMember.groupMembers.length).toBe(1);

        var layer2FirstGroupMember = layer1FirstGroupMember.groupMembers[0];
        expect(layer2FirstGroupMember.concept.shortName).toBe("WEIGHT");
        expect(layer2FirstGroupMember.valueAsString).toBe("50.0");
    });

    it("should construct dummy obs group for section and non-inside section obs from form", function () {
        //given
        observations = [{
            "value": [{
                "groupMembers": [{
                    "groupMembers": [],
                    "formFieldPath": "test section with an obs and outside obs.1/2-0",
                    "concept": {
                        "uuid": "5090AAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                        "name": "HEIGHT",
                        "dataType": "Numeric",
                        "shortName": "HEIGHT"
                    },
                    "valueAsString": "30.0"
                }, {
                    "groupMembers": [],
                    "formFieldPath": "test section with an obs and outside obs.1/3-0",
                    "concept": {
                        "uuid": "5089AAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                        "name": "WEIGHT",
                        "dataType": "Numeric",
                        "shortName": "WEIGHT"
                    },
                    "valueAsString": "50.0"
                }], "concept": {"shortName": "test section with an obs and outside obs", "conceptClass": null}
            }]
        }];

        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "test section with an obs and outside obs",
                        "controls": [{
                            "type": "section",
                            "label": {"type": "label", "value": "Outer Section"},
                            "id": "1",
                            "controls": [{
                                "type": "obsControl",
                                "label": {"type": "label", "value": "HEIGHT"},
                                "id": "2"
                            }]
                        }, {
                            "type": "obsControl",
                            "label": {"type": "label", "value": "WEIGHT"},
                            "id": "3"
                        }]
                    })
                }]
            }
        };

        var formDetailDeferred = $q.defer();
        var allFormsDeferred = $q.defer();

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);

        formHierarchyService.build(observations);
        allFormsDeferred.resolve(allForms)
        formDetailDeferred.resolve(formDetails);
        $scope.$apply();

        //then
        var dummyObsGroup = observations[0].value[0];
        expect(dummyObsGroup.concept.shortName).toBe("test section with an obs and outside obs");

        var layer1FirstGroupMember = dummyObsGroup.groupMembers[0];
        expect(layer1FirstGroupMember.concept.shortName).toBe("Outer Section");
        expect(layer1FirstGroupMember.groupMembers.length).toBe(1);

        var layer1SecondGroupMember = dummyObsGroup.groupMembers[1];
        expect(layer1SecondGroupMember.concept.shortName).toBe("WEIGHT");
        expect(layer1SecondGroupMember.valueAsString).toBe("50.0");

        var layer2FirstGroupMember = layer1FirstGroupMember.groupMembers[0];
        expect(layer2FirstGroupMember.concept.shortName).toBe("HEIGHT");
        expect(layer2FirstGroupMember.valueAsString).toBe("30.0");

    });

    it("should construct dummy obs group for section inside section with obs from form", function () {
        //given
        observations = [{
            "value": [{
                "groupMembers": [{
                    "groupMembers": [],
                    "formFieldPath": "test section inside section.1/2-0",
                    "concept": {
                        "uuid": "5090AAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                        "name": "HEIGHT",
                        "dataType": "Numeric",
                        "shortName": "HEIGHT"
                    },
                    "valueAsString": "160.0"
                }, {
                    "groupMembers": [],
                    "formFieldPath": "test section inside section.1/3-0",
                    "concept": {
                        "uuid": "5089AAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                        "name": "WEIGHT",
                        "dataType": "Numeric",
                        "shortName": "WEIGHT"
                    },
                    "valueAsString": "100.0"
                }], "concept": {"shortName": "test section inside section", "conceptClass": null}
            }]
        }];

        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "test inside section with obs",
                        "controls": [{
                            "type": "section",
                            "label": {"type": "label", "value": "Outer Section"},
                            "id": "1",
                            "controls": [{
                                "type": "obsControl",
                                "label": {"type": "label", "value": "HEIGHT"},
                                "id": "2"
                            }, {
                                "type": "section",
                                "label": {"type": "label", "value": "Inner Section"},
                                "id": "4",
                                "controls": [{
                                    "type": "obsControl",
                                    "label": {"type": "label", "value": "WEIGHT"},
                                    "id": "3"
                                }]
                            }]

                        }]
                    })
                }]
            }
        };

        var formDetailDeferred = $q.defer();
        var allFormsDeferred = $q.defer();

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);

        formHierarchyService.build(observations);
        allFormsDeferred.resolve(allForms)
        formDetailDeferred.resolve(formDetails);
        $scope.$apply();

        //then
        var dummyObsGroup = observations[0].value[0];
        expect(dummyObsGroup.concept.shortName).toBe("test section inside section");

        var layer1FirstGroupMember = dummyObsGroup.groupMembers[0];
        expect(layer1FirstGroupMember.concept.shortName).toBe("Outer Section");
        expect(layer1FirstGroupMember.groupMembers.length).toBe(2);


        var layer2FirstGroupMember = layer1FirstGroupMember.groupMembers[0];
        expect(layer2FirstGroupMember.concept.shortName).toBe("HEIGHT");
        expect(layer2FirstGroupMember.valueAsString).toBe("160.0");

        var layer2SecondGroupMember = layer1FirstGroupMember.groupMembers[1];
        expect(layer2SecondGroupMember.concept.shortName).toBe("Inner Section");
        expect(layer2SecondGroupMember.groupMembers.length).toBe(1);

        var layer3FirstGroupMember = layer2SecondGroupMember.groupMembers[0];
        expect(layer3FirstGroupMember.concept.shortName).toBe("WEIGHT");
        expect(layer3FirstGroupMember.valueAsString).toBe("100.0");
    });

    it("should construct dummy obs group for section inside section with obs group from form", function () {
        //given
        observations = [{
            "value": [{
                "groupMembers": [{
                    "groupMembers": [{
                        "groupMembers": [],
                        "formFieldPath": "test section inside section with obs group.1/1-0",
                        "concept": {
                            "uuid": "5090AAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                            "name": "HEIGHT",
                            "dataType": "Numeric",
                            "shortName": "HEIGHT"
                        },
                        "valueAsString": "160.0"
                    }, {
                        "groupMembers": [],
                        "formFieldPath": "test section inside section with obs group.1/2-0",
                        "concept": {
                            "uuid": "5090AAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                            "name": "HEIGHT",
                            "dataType": "Numeric",
                            "shortName": "HEIGHT Abnormal"
                        },
                        "valueAsString": "No"
                    }],
                    "formFieldPath": "test section inside section with obs group.1/3-0",
                    "concept": {
                        "uuid": "5090AAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                        "name": "HEIGHT",
                        "dataType": "Numeric",
                        "shortName": "HEIGHT DATA"
                    },
                    "valueAsString": "160.0"
                }, {
                    "groupMembers": [{
                        "groupMembers": [],
                        "formFieldPath": "test section with obs group.1/4-0",
                        "concept": {
                            "uuid": "5089AAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                            "name": "WEIGHT",
                            "dataType": "Numeric",
                            "shortName": "WEIGHT"
                        },
                        "valueAsString": "100.0"
                    }, {
                        "groupMembers": [],
                        "formFieldPath": "test section with obs group.1/5-0",
                        "concept": {
                            "uuid": "5089AAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                            "name": "WEIGHT",
                            "dataType": "Numeric",
                            "shortName": "WEIGHT Abnormal"
                        },
                        "valueAsString": "Yes"
                    }],
                    "formFieldPath": "test section with obs group.1/6-0",
                    "concept": {
                        "uuid": "5089AAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                        "name": "WEIGHT",
                        "dataType": "Numeric",
                        "shortName": "WEIGHT DATA"
                    },
                    "valueAsString": "100.0"
                }], "concept": {"shortName": "test section with obs group", "conceptClass": null}
            }]
        }];

        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "test section with obs group",
                        "controls": [{
                            "type": "section",
                            "label": {"type": "label", "value": "Outer Section"},
                            "id": "1",
                            "controls": [{
                                "type": "obsGroupControl",
                                "label": {"type": "label", "value": "HEIGHT DATA"},
                                "id": "3"
                            }, {
                                "type": "section",
                                "label": {"type": "label", "value": "Inner Section"},
                                "id": "4",
                                "controls": [{
                                    "type": "obsControl",
                                    "label": {"type": "label", "value": "WEIGHT DATA"},
                                    "id": "6"
                                }]
                            }]

                        }]
                    })
                }]
            }
        };

        var formDetailDeferred = $q.defer();
        var allFormsDeferred = $q.defer();

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);

        formHierarchyService.build(observations);
        allFormsDeferred.resolve(allForms)
        formDetailDeferred.resolve(formDetails);
        $scope.$apply();

        //then
        var dummyObsGroup = observations[0].value[0];
        expect(dummyObsGroup.concept.shortName).toBe("test section with obs group");

        var layer1FirstGroupMember = dummyObsGroup.groupMembers[0];
        expect(layer1FirstGroupMember.concept.shortName).toBe("Outer Section");
        expect(layer1FirstGroupMember.groupMembers.length).toBe(2);


        var layer2FirstGroupMember = layer1FirstGroupMember.groupMembers[0];
        expect(layer2FirstGroupMember.concept.shortName).toBe("HEIGHT DATA");
        expect(layer2FirstGroupMember.groupMembers.length).toBe(2);

        var layer3FirstGroupMemberInLayer2FirstMember = layer2FirstGroupMember.groupMembers[0];
        expect(layer3FirstGroupMemberInLayer2FirstMember.concept.shortName).toBe("HEIGHT");
        expect(layer3FirstGroupMemberInLayer2FirstMember.valueAsString).toBe("160.0");

        var layer3SecondGroupMemberInLayer2FirstMember = layer2FirstGroupMember.groupMembers[1];
        expect(layer3SecondGroupMemberInLayer2FirstMember.concept.shortName).toBe("HEIGHT Abnormal");
        expect(layer3SecondGroupMemberInLayer2FirstMember.valueAsString).toBe("No");

        var layer2SecondGroupMember = layer1FirstGroupMember.groupMembers[1];
        expect(layer2SecondGroupMember.concept.shortName).toBe("Inner Section");
        expect(layer2SecondGroupMember.groupMembers.length).toBe(1);

        var layer3FirstGroupMemberInLayer2SecondMember = layer2SecondGroupMember.groupMembers[0];
        expect(layer3FirstGroupMemberInLayer2SecondMember.concept.shortName).toBe("WEIGHT DATA");
        expect(layer3FirstGroupMemberInLayer2SecondMember.groupMembers.length).toBe(2);

        var layer4FirstGroupMember = layer3FirstGroupMemberInLayer2SecondMember.groupMembers[0];
        expect(layer4FirstGroupMember.concept.shortName).toBe("WEIGHT");
        expect(layer4FirstGroupMember.valueAsString).toBe("100.0");

        var layer4SecondGroupMember = layer3FirstGroupMemberInLayer2SecondMember.groupMembers[1];
        expect(layer4SecondGroupMember.concept.shortName).toBe("WEIGHT Abnormal");
        expect(layer4SecondGroupMember.valueAsString).toBe("Yes");
    });

    it("should construct dummy obs group for single observation in section from form with multiple versions", function () {
        observations = [{
            "value": [{
                "groupMembers": [{
                    "groupMembers": [],
                    "formNamespace": "Bahmni",
                    "formFieldPath": "test section with an obs.2/3-0",
                    "concept": {
                        "shortName": "WEIGHT",
                        "name": "WEIGHT",
                        "conceptClass": "weight"
                    },
                    "valueAsString": "50.0"
                }], "concept": {"shortName": "test section with an obs", "conceptClass": null},
                "encounterUuid": "123"
            }]
        }];
        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "test section with an obs",
                        "controls": [{
                            "type": "section",
                            "label": {"type": "label", "value": "Outer Section"},
                            "id": "2",
                            "controls": [{
                                "type": "obsControl",
                                "label": {"type": "label", "value": "WEIGHT"},
                                "id": "3"
                            }]
                        }]
                    })
                }]
            }

        };

        var formDetailDeferred = $q.defer();
        var allFormsDeferred = $q.defer();

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);

        formHierarchyService.build(observations);
        allFormsDeferred.resolve(allForms)
        formDetailDeferred.resolve(formDetails);
        $scope.$apply();

        expect(formService.getFormDetail).toHaveBeenCalledWith("version2",
            {v: "custom:(resources:(value))"});
    });

    it("should hide section information when there is no input in the section", function () {
        //given
        observations = [{
            "value": [{
                "groupMembers": [{
                    "groupMembers": [],
                    "formFieldPath": "test section with an obs and outside obs.1/3-0",
                    "concept": {
                        "uuid": "5089AAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                        "name": "WEIGHT",
                        "dataType": "Numeric",
                        "shortName": "WEIGHT"
                    },
                    "valueAsString": "50.0"
                }], "concept": {"shortName": "test section with an obs and outside obs", "conceptClass": null}
            }]
        }];

        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "test section with an obs and outside obs",
                        "controls": [{
                            "type": "section",
                            "label": {"type": "label", "value": "Outer Section"},
                            "id": "1",
                            "controls": [{
                                "type": "obsControl",
                                "label": {"type": "label", "value": "HEIGHT"},
                                "id": "2"
                            }]
                        }, {
                            "type": "obsControl",
                            "label": {"type": "label", "value": "WEIGHT"},
                            "id": "3"
                        }]
                    })
                }]
            }
        };

        var formDetailDeferred = $q.defer();
        var allFormsDeferred = $q.defer();

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);

        formHierarchyService.build(observations);
        allFormsDeferred.resolve(allForms)
        formDetailDeferred.resolve(formDetails);
        $scope.$apply();

        //then
        var dummyObsGroup = observations[0].value[0];
        expect(dummyObsGroup.concept.shortName).toBe("test section with an obs and outside obs");
        expect(dummyObsGroup.groupMembers.length).toBe(1);

        var layer1SecondGroupMember = dummyObsGroup.groupMembers[0];
        expect(layer1SecondGroupMember.concept.shortName).toBe("WEIGHT");
        expect(layer1SecondGroupMember.valueAsString).toBe("50.0");


    });
    it("should show section information when there is input in the section and no input in the outside obs", function () {
        //given
        observations = [{
            "value": [{
                "groupMembers": [{
                    "groupMembers": [],
                    "formFieldPath": "test section with an obs and outside obs.1/2-0",
                    "concept": {
                        "uuid": "5089AAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                        "name": "HEIGHT",
                        "dataType": "Numeric",
                        "shortName": "HEIGHT"
                    },
                    "valueAsString": "160.0"
                }], "concept": {"shortName": "test section with an obs and outside obs", "conceptClass": null}
            }]
        }];

        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "test section with an obs and outside obs",
                        "controls": [{
                            "type": "section",
                            "label": {"type": "label", "value": "Outer Section"},
                            "id": "1",
                            "controls": [{
                                "type": "obsControl",
                                "label": {"type": "label", "value": "HEIGHT"},
                                "id": "2"
                            }]
                        }, {
                            "type": "obsControl",
                            "label": {"type": "label", "value": "WEIGHT"},
                            "id": "3"
                        }]
                    })
                }]
            }
        };

        var formDetailDeferred = $q.defer();
        var allFormsDeferred = $q.defer();

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);

        formHierarchyService.build(observations);
        allFormsDeferred.resolve(allForms);
        formDetailDeferred.resolve(formDetails);
        $scope.$apply();

        //then
        var dummyObsGroup = observations[0].value[0];
        expect(dummyObsGroup.concept.shortName).toBe("test section with an obs and outside obs");
        expect(dummyObsGroup.groupMembers.length).toBe(1);

        var layer1FirstGroupMember = dummyObsGroup.groupMembers[0];
        expect(layer1FirstGroupMember.concept.shortName).toBe("Outer Section");
        expect(layer1FirstGroupMember.groupMembers.length).toBe(1);

        var layer2FirstGroupMember = layer1FirstGroupMember.groupMembers[0];
        expect(layer2FirstGroupMember.concept.shortName).toBe("HEIGHT");
        expect(layer2FirstGroupMember.valueAsString).toBe("160.0");
    });

    it("should hide section information when there is no input in the section inside the section and input in outside obs", function () {
        //given
        observations = [{
            "value": [{
                "groupMembers": [{
                    "groupMembers": [],
                    "formFieldPath": "test section with an obs and outside obs.1/3-0",
                    "concept": {
                        "uuid": "5089AAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                        "name": "WEIGHT",
                        "dataType": "Numeric",
                        "shortName": "WEIGHT"
                    },
                    "valueAsString": "50.0"
                }], "concept": {"shortName": "test section with an obs and outside obs", "conceptClass": null}
            }]
        }];

        var formDetails = {
            "data": {
                "resources": [{
                    "value": JSON.stringify({
                        "name": "test inside section with obs",
                        "controls": [{
                            "type": "obsControl",
                            "label": {"type": "label", "value": "WEIGHT"},
                            "id": "3"
                        },
                            {
                                "type": "section",
                                "label": {"type": "label", "value": "Outer Section"},
                                "id": "1",
                                "controls": [{
                                    "type": "section",
                                    "label": {"type": "label", "value": "Inner Section"},
                                    "id": "4",
                                    "controls": [{
                                        "type": "obsControl",
                                        "label": {"type": "label", "value": "HEIGHT"},
                                        "id": "2"
                                    }]
                                }]

                            }]
                    })
                }]
            }
        };
        var formDetailDeferred = $q.defer();
        var allFormsDeferred = $q.defer();

        spyOn(formService, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(formService, "getFormDetail").and.returnValue(formDetailDeferred.promise);

        formHierarchyService.build(observations);
        allFormsDeferred.resolve(allForms)
        formDetailDeferred.resolve(formDetails);
        $scope.$apply();

        //then
        var dummyObsGroup = observations[0].value[0];
        expect(dummyObsGroup.concept.shortName).toBe("test section with an obs and outside obs");
        expect(dummyObsGroup.groupMembers.length).toBe(1);

        var layer1FirstGroupMember = dummyObsGroup.groupMembers[0];
        expect(layer1FirstGroupMember.concept.shortName).toBe("WEIGHT");
        expect(layer1FirstGroupMember.valueAsString).toBe("50.0");
    });

  it("should not fetch form details when observation is empty", function () {
    //given
    observations = [];

    spyOn(formService, "getAllForms");
    spyOn(formService, "getFormDetail");

    formHierarchyService.build(observations);
    $scope.$apply();

    //then
    expect(formService.getAllForms.calls.any()).toEqual(false);
    expect(formService.getFormDetail.calls.any()).toEqual(false);
  });
});