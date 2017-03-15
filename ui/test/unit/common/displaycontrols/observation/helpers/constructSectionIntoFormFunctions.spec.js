'use strict';

ddescribe("Construct Section Into Form Functions", function () {
    var $q;
    var $scope;
    var observations;
    beforeEach(inject(function (_$q_, _$rootScope_) {
        $q = _$q_;
        $scope = _$rootScope_;
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
                }], "concept": {"shortName": "test section with an obs", "conceptClass": null}
            }]
        }];
        var formDetails = {
            "data": {
                "results": [{
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
                }, {
                    "resources": [{
                        "value": JSON.stringify({
                            "name": "test section with an obs and outside obs",
                            "controls": [{
                                "type": "section",
                                "label": {"type": "label", "value": "Name Changed"},
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
                }]
            }
        };
        var service = {
            getFormDetail: angular.noop
        };
        var deferred = $q.defer();
        spyOn(service, "getFormDetail").and.returnValue(deferred.promise);

        new Bahmni.Common.DisplayControl.Observation.ConstructSectionIntoFormFunctions().createDummyObsGroupForSectionsForForm(observations, service);
        deferred.resolve(formDetails);
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
                "results": [{
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
                }]
            }
        };

        var service = {
            getFormDetail: angular.noop
        };
        var deferred = $q.defer();

        spyOn(service, "getFormDetail").and.returnValue(deferred.promise);

        //when
        new Bahmni.Common.DisplayControl.Observation.ConstructSectionIntoFormFunctions().createDummyObsGroupForSectionsForForm(observations, service);

        deferred.resolve(formDetails);
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
});


