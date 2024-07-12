'use strict';

describe("conceptGroupFormatService", function () {
    var translate, appService;
    beforeEach(function () {
        translate = jasmine.createSpyObj('$translate', ['instant']);
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        module(function ($provide) {
            $provide.value('$translate', translate);
            $provide.value('appService', appService);
        });
        translate.instant.and.callFake(function (key) {
            return translatedMessages[key];
        });
    });

    var injectConceptGroupFormatService = function () {
        var conceptGroupFormatService;
        inject(['conceptGroupFormatService', function (_conceptGroupFormatService_) {
            conceptGroupFormatService = _conceptGroupFormatService_;
        }]);
        return conceptGroupFormatService;
    };

    var translatedMessages = {
        "CHIEF_COMPLAINT_MESSAGE_KEY": "Fever since 2 days",
        "DISCHARGE_SUMMARY_MESSAGE_KEY": "The patient admitted with fever has completed the TB treatment course.",
    };

    var allObservations = [
        {
            "groupMembers": [
                {
                    "groupMembers": [],
                    "conceptSortWeight": 2,
                    "formNamespace": "Bahmni",
                    "concept": {
                        "name": "Pulse",
                        "units": "/min",
                        "conceptClass": "Misc"
                    },
                    "valueAsString": "72.0",
                    "value": 72
                },
                {
                    "groupMembers": [],
                    "conceptSortWeight": 3,
                    "formNamespace": "Bahmni",
                    "concept": {
                        "name": "Pulse Abnormal",
                        "conceptClass": "Abnormal"
                    },
                    "valueAsString": "No",
                    "value": false
                }
            ],
            "obsGroupUuid": null,
            "conceptSortWeight": 1,
            "formNamespace": "Bahmni",
            "concept": {
                "name": "Pulse Data",
                "conceptClass": "Concept Details",
            },
            "valueAsString": "72.0, false",
            "conceptNameToDisplay": "Pulse",
            "value": "72.0, false"
        },
        {
            "groupMembers": [
                {
                    "groupMembers": [],
                    "type": "Coded",
                    "conceptSortWeight": 2,
                    "formNamespace": "Bahmni",
                    "concept": {
                        "name": "Chief Complaint Coded",
                    },
                    "value": {
                        "name": "Fever",
                        "shortName": "Fever"
                    }
                },
                {
                    "groupMembers": [],
                    "conceptSortWeight": 4,
                    "formNamespace": "Bahmni",
                    "concept": {
                        "name": "Sign/symptom duration",
                    },
                    "value": 2
                },
                {
                    "groupMembers": [],
                    "conceptSortWeight": 5,
                    "formNamespace": "Bahmni",
                    "concept": {
                        "name": "Chief Complaint Duration",
                    },
                    "value": {
                        "name": "Days",
                    }
                }
            ],
            "obsGroupUuid": null,
            "conceptSortWeight": 1,
            "formNamespace": "Bahmni",
            "concept": {
                "name": "Chief Complaint Data",
                "conceptClass": "Misc"
            },
            "value": "Days, Fever, 2"
        },
        {
            "groupMembers": [
                {
                    "groupMembers": [],
                    "conceptSortWeight": 2,
                    "concept": {
                        "name": "Hospital Course"
                    },
                    "value": "TB Treatment"
                },
                {
                    "groupMembers": [],
                    "conceptSortWeight": 3,
                    "concept": {
                        "name": "History and Examination Notes",
                    },
                    "value": "Fever"
                }
            ],
            "obsGroupUuid": null,
            "conceptSortWeight": 1,
            "formNamespace": null,
            "concept": {
                "name": "Discharge Summary"
            },
            "value": "TB Treatment, Fever"
        },
        {
            "groupMembers": [
                {
                    "groupMembers": [],
                    "type": "Coded",
                    "conceptSortWeight": 2,
                    "formNamespace": "Bahmni",
                    "concept": {
                        "name": "Chief Complaint Coded"
                    },
                    "value": {
                        "name": "Fever"
                    }
                },
                {
                    "groupMembers": [],
                    "conceptSortWeight": 4,
                    "formNamespace": "Bahmni",
                    "concept": {
                        "name": "Sign/symptom duration"
                    },
                    "value": 2
                },
                {
                    "groupMembers": [],
                    "conceptSortWeight": 5,
                    "formNamespace": "Bahmni",
                    "concept": {
                        "name": "Chief Complaint Duration"
                    },
                    "value": {
                        "name": "Days"
                    }
                }
            ],
            "obsGroupUuid": null,
            "conceptSortWeight": 1,
            "formNamespace": "Bahmni",
            "concept": {
                "name": "Chief Complaint Data",
                "conceptClass": "Concept Details"
            },
            "value": "Days, Fever, 2"
        },
    ];

    beforeEach(module('bahmni.common.conceptSet'));
    beforeEach(function () {
        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function (configKey) {
                if (configKey === "obsGroupDisplayFormat") {
                    return {
                        "Chief Complaint Data": {
                            "displayObsFormat": {
                                "translationKey": "CHIEF_COMPLAINT_MESSAGE_KEY",
                                "concepts": ["Chief Complaint", "Chief Complaint Duration"]
                            }
                        },
                        "Discharge Summary": {
                            "displayObsFormat": {
                                "translationKey": "DISCHARGE_SUMMARY_MESSAGE_KEY",
                                "concepts": ["Hospital Course", "History and Examination Notes"]}
                        }
                    };
                }
            }
        });
    });

    describe("obsGroupFormatting", function () {
        it("When grouping obs group of concept details class, the obs group should be sorted based on concept sort weight and joined by comma", function () {
            var conceptGroupFormatService = injectConceptGroupFormatService();
            var groupedObs = conceptGroupFormatService.groupObs(allObservations[0]);

            expect(groupedObs).toEqual("72");
        });

        it("when obs group is defined in config, should correctly format observation group by applying configured translation", function () {
            var conceptGroupFormatService = injectConceptGroupFormatService();
            var groupedObs = conceptGroupFormatService.groupObs(allObservations[1]);

            translate.instant.and.callFake(function (key, interpolateParams) {
                expect(interpolateParams).toEqual({ChiefComplaintCoded: "Fever", SignSymptomDuration: 2, ChiefComplaintDuration: "Days"});
            });
            expect(groupedObs).toEqual("Fever since 2 days");
        });

        it("when obs group is defined in config and also of concept details class, should apply configured translation", function () {
            var conceptGroupFormatService = injectConceptGroupFormatService();
            var groupedObs = conceptGroupFormatService.groupObs(allObservations[3]);

            expect(groupedObs).toEqual("Fever since 2 days");
        });

        it("When the observation is a of Form1 and also a parent observation group, formatting should not be applied", function () {
            var conceptGroupFormatService = injectConceptGroupFormatService();
            var isObsGroupFormatted = conceptGroupFormatService.isObsGroupFormatted(allObservations[2]);

            expect(isObsGroupFormatted).toBeFalsy();
        });
    });
});