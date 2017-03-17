'use strict';

ddescribe("Construct Section Into Form Functions", function () {
    var $q;
    var $scope;
    var observations;
    var allforms;
    beforeEach(inject(function (_$q_, _$rootScope_) {
        $q = _$q_;
        $scope = _$rootScope_;
        allforms = {
            "data": {
                "results": [
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
                    }
                ]
            }
        }

    }));

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
        var service = {
            getAllForms: angular.noop,
            getFormDetail: angular.noop
        };

        var formDetailDeferred = $q.defer();
        var allFormsDeferred = $q.defer();

        spyOn(service, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(service, "getFormDetail").and.returnValue(formDetailDeferred.promise);

        new Bahmni.Common.DisplayControl.Observation.ConstructSectionIntoFormFunctions().createDummyObsGroupForSectionsForForm(observations, service);
        allFormsDeferred.resolve(allforms)
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
        var service = {
            getAllForms: angular.noop,
            getFormDetail: angular.noop
        };

        var formDetailDeferred = $q.defer();
        var allFormsDeferred = $q.defer();

        spyOn(service, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(service, "getFormDetail").and.returnValue(formDetailDeferred.promise);

        new Bahmni.Common.DisplayControl.Observation.ConstructSectionIntoFormFunctions().createDummyObsGroupForSectionsForForm(observations, service);
        allFormsDeferred.resolve(allforms)
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
        var service = {
            getAllForms: angular.noop,
            getFormDetail: angular.noop
        };

        var formDetailDeferred = $q.defer();
        var allFormsDeferred = $q.defer();

        spyOn(service, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(service, "getFormDetail").and.returnValue(formDetailDeferred.promise);

        new Bahmni.Common.DisplayControl.Observation.ConstructSectionIntoFormFunctions().createDummyObsGroupForSectionsForForm(observations, service);
        allFormsDeferred.resolve(allforms)
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

        var service = {
            getAllForms: angular.noop,
            getFormDetail: angular.noop
        };

        var formDetailDeferred = $q.defer();
        var allFormsDeferred = $q.defer();

        spyOn(service, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(service, "getFormDetail").and.returnValue(formDetailDeferred.promise);

        new Bahmni.Common.DisplayControl.Observation.ConstructSectionIntoFormFunctions().createDummyObsGroupForSectionsForForm(observations, service);
        allFormsDeferred.resolve(allforms)
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

        var layer3SecondGroupMemberInLayer2FisrtMember = layer2FirstGroupMember.groupMembers[1];
        expect(layer3SecondGroupMemberInLayer2FisrtMember.concept.shortName).toBe("HEIGHT Abnormal");
        expect(layer3SecondGroupMemberInLayer2FisrtMember.valueAsString).toBe("No");

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
        var service = {
            getAllForms: angular.noop,
            getFormDetail: angular.noop
        };

        var formDetailDeferred = $q.defer();
        var allFormsDeferred = $q.defer();

        spyOn(service, "getAllForms").and.returnValue(allFormsDeferred.promise);
        spyOn(service, "getFormDetail").and.returnValue(formDetailDeferred.promise);

        new Bahmni.Common.DisplayControl.Observation.ConstructSectionIntoFormFunctions().createDummyObsGroupForSectionsForForm(observations, service);
        allFormsDeferred.resolve(allforms)
        formDetailDeferred.resolve(formDetails);
        $scope.$apply();

        expect(service.getFormDetail).toHaveBeenCalledWith("version2",
            {v: "custom:(resources:(value))"});
    });

});


