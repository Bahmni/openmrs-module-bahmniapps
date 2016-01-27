describe("ProgramAttributes display control", function () {
    var rootScope, mockBackend;

    var programHelper;

    var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);

    var mockAppDescriptor = jasmine.createSpyObj('appService', ['getConfigValue']);
    mockAppDescriptor.getConfigValue.and.returnValue(undefined);
    var DateUtil = Bahmni.Common.Util.DateUtil;

    var mockAppService = jasmine.createSpyObj('appDescriptor', ['getAppDescriptor']);
    mockAppService.getAppDescriptor.and.returnValue(mockAppDescriptor);

    beforeEach(function () {
        appService.getAppDescriptor.and.returnValue({
            getConfig: function () {
                return {
                    program: ""
                }
            },
            getConfigValue: function () {
                return {
                    mandatoryProgramAttributes: ""
                }
            }
        });

        module('bahmni.common.domain');
        module('bahmni.common.uicontrols.programmanagment');
        module(function ($provide) {
            $provide.value('appService', appService);
        });

        inject(function (_$rootScope_, _programHelper_, $httpBackend) {
            rootScope = _$rootScope_;
            mockBackend = $httpBackend;
            programHelper = _programHelper_;
        });
    });

    var today = DateUtil.endOfToday();
    var yesterday = DateUtil.addDays(today, -1);
    var tenDaysAgo = DateUtil.addDays(today, -10);

    var data = {
        data: {
            results: [
                {
                    "display": "Tuberculosis Program",
                    "dateEnrolled": DateUtil.parseLongDateToServerFormat(tenDaysAgo),
                    "dateCompleted": DateUtil.parseLongDateToServerFormat(yesterday),
                    "patient": {"uuid": "ad95e200-6196-4438-a078-16ad0506a473"},
                    "states": [
                        {
                            state: {uuid: '1911a3ef-cfab-43c5-8810-7f594bfa8995'},
                            startDate: "2015-07-01",
                            endDate: "2015-07-15"
                        },
                        {
                            state: {uuid: '1317ab09-52b4-4573-aefa-7f6e7bdf6d61'},
                            startDate: "2015-07-15",
                            endDate: null
                        }
                    ],
                    "program": {
                        "name": "TB program",
                        "uuid": "1209df07-b3a5-4295-875f-2f7bae20f86e",
                        "retired": false,
                        "allWorkflows": [
                            {
                                "uuid": "6a6c990f-01e2-464b-9452-2a97f0c05c7c",
                                "retired": false,
                                "states": []
                            }
                        ]
                    },
                    "attributes": [
                        {
                            display: "Doctor : Tester",
                            value: "Tester",
                            attributeType: {
                                description: "Doctor-In-Charge",
                                display: "Doctor"
                            }
                        }, {
                            display: "Id",
                            value: "12345",
                            attributeType: {
                                description: "Id",
                                display: "Enrollment Id"
                            }
                        }, {
                            display: "Location",
                            value: "Catchment 1234",
                            attributeType: {
                                description: "Location",
                                display: "Location of treatment"
                            }
                        }
                    ],
                    "outcome": null
                }

            ]
        }
    };

    var attributeTypes = {
        data: {
            results: [
                {name: "Doctor"},
                {name: "Enrollment Id"},
                {name: "Location of treatment"},
                {name: "Primary Care taker"}
            ]
        }
    };

    it("should filter programs by program attributes from config", function () {
        appService.getAppDescriptor.and.returnValue({
            getConfig: function () {
                return {
                    program: ""
                }
            },
            getConfigValue: function (value) {
                return {
                    programDisplayControl: {
                        "showProgramStateInTimeline": true,
                        "programAttributes": [
                            "Doctor",
                            "Enrollment Id",
                            "Other program Attribute not in database",
                            "Primary Care taker"
                        ]
                    }
                }[value];
            }
        });

        var patientPrograms = programHelper.filterProgramAttributes(data.data.results, attributeTypes.data.results);
        expect(patientPrograms[0].attributes.length).toBe(3);
        expect(patientPrograms[0].attributes[0].attributeType.display).toBe("Doctor");
        expect(patientPrograms[0].attributes[1].attributeType.display).toBe("Enrollment Id");
        expect(patientPrograms[0].attributes[2].attributeType.display).toBe("Primary Care taker");
        expect(patientPrograms[0].attributes[0].value).toBe('Tester');
        expect(patientPrograms[0].attributes[1].value).toBe('12345');
        expect(patientPrograms[0].attributes[2].value).toBe('');
    });
});
