'use strict';

describe('programService', function () {

    var rootScope, mockBackend;

    var programService;
    var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
    var DateUtil = Bahmni.Common.Util.DateUtil;

    var mockAppDescriptor = jasmine.createSpyObj('appService', ['getConfigValue']);
    mockAppDescriptor.getConfigValue.and.returnValue(undefined);

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
                    mandatoryProgramAttributes: "",
                    showProgramStateInTimeline: true
                }
            }
        });

        module('bahmni.common.domain');
        module('bahmni.common.uicontrols.programmanagment');
        module(function ($provide) {
            $provide.value('appService', appService);
        });

        inject(function (_$rootScope_, _programService_, $httpBackend) {
            rootScope = _$rootScope_;
            programService = _programService_;
            mockBackend = $httpBackend
        });
    });

    it('should fetch all programs from backend and filter programs containing retired workflows and outcomes', function () {
        var allPrograms = [
            {
                "uuid": "someProgram1Uuid",
                "name": "Test Program 1",
                "retired": false,
                "outcomesConcept": {
                    "uuid": "someOutcomeUuid",
                    "retired": false,
                    "setMembers": [
                        {
                            "uuid": "8a1ab485-e599-4682-8c82-c60ce03c916e",
                            "display": "Cured",
                            "retired": false
                        },
                        {
                            "uuid": "041daad2-198b-4223-aa46-6b23e85776a9",
                            "display": "Death",
                            "retired": true
                        }
                    ]
                },
                "allWorkflows": [
                    {
                        "uuid": "someWorkFlowUuid",
                        "retired": false,
                        "states": [{
                            "uuid": "state1Uuid",
                            "retired": false
                        }, {
                            "uuid": "state2Uuid",
                            "retired": true
                        }]
                    }
                ]
            },
            {
                "uuid": "someProgram2Uuid",
                "name": "Test Program 2",
                "retired": true,
                "outcomesConcept": {
                    "uuid": "someOutcomeUuid",
                    "retired": true
                },
                "allWorkflows": [
                    {
                        "uuid": "someWorkFlowUuid",
                        "retired": true,
                        "states": [{
                            "uuid": "state1Uuid",
                            "retired": false
                        }, {
                            "uuid": "state2Uuid",
                            "retired": false
                        }]
                    }
                ]
            }
        ];

        mockBackend.expectGET('/openmrs/ws/rest/v1/program?v=default').respond({results: allPrograms});

        programService.getAllPrograms().then(function (response) {
            expect(response.length).toBe(1);
            expect(response[0].allWorkflows[0].states.length).toBe(1);
        });

        mockBackend.flush();
    });

    it("should group all programs into active/ended programs and sort them according to their dateEnrolled/dateCompleted respectively", function () {
        var patientUuid = "somePatientUuid";

        var today = DateUtil.endOfToday();
        var yesterday = DateUtil.addDays(today, -1);
        var tenDaysAgo = DateUtil.addDays(today, -10);
        var fiveDaysFromToday = DateUtil.addDays(today, 5);

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
                            "name": "program",
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
                        "attributes": [],
                        "outcome": null
                    },
                    {
                        "display": "HIV Program",
                        "dateEnrolled": DateUtil.parseLongDateToServerFormat(tenDaysAgo),
                        "dateCompleted": DateUtil.parseLongDateToServerFormat(today),
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
                            "name": "program",
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
                        "attributes": [],
                        "outcome": null
                    },
                    {
                        "display": "End TB Program",
                        "dateEnrolled": DateUtil.parseLongDateToServerFormat(tenDaysAgo),
                        "dateCompleted": DateUtil.parseLongDateToServerFormat(fiveDaysFromToday),
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
                            "name": "program",
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
                        "attributes": [],
                        "outcome": null
                    },
                    {
                        "display": "End Fever Program",
                        "dateEnrolled": DateUtil.parseLongDateToServerFormat(tenDaysAgo),
                        "dateCompleted": null,
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
                            "name": "program",
                            "uuid": "1209df07-b3a5-4295-875f-2f7bae20f86e",
                            "retired": false,
                            "allWorkflows": [
                                {
                                    "uuid": "6a6c990f-01e2-464b-9452-2a97f0c05c7c",
                                    "states": []
                                }
                            ]
                        },
                        "attributes": [],
                        "outcome": null
                    }
                ]
            }
        };

        var attributeType = {
            "data": {
                "results": [
                    {
                        "uuid": "79d8bac8-bf47-11e5-8023-005056821b69",
                        "name": "Id",
                        "description": "Enrolment Id",
                        "datatypeClassname": "org.openmrs.customdatatype.datatype.RegexValidatedTextDatatype",
                        "datatypeConfig": "[0-9]*"
                    },
                    {
                        "uuid": "c4e52116-bf47-11e5-8023-005056821b69",
                        "name": "Treatment_Date",
                        "description": "Treatment Start Date",
                        "datatypeClassname": "org.openmrs.customdatatype.datatype.DateDatatype",
                        "datatypeConfig": null
                    },
                    {
                        "uuid": "f855b376-bf47-11e5-8023-005056821b69",
                        "name": "Doctor",
                        "description": "Doctor-In-Charge",
                        "datatypeClassname": "org.openmrs.customdatatype.datatype.FreeTextDatatype",
                        "datatypeConfig": null
                    },
                    {
                        "uuid": "06bec1e2-bf48-11e5-8023-005056821b69",
                        "name": "Enrollment",
                        "description": "Enrolled in Any Other Program",
                        "datatypeClassname": "org.openmrs.customdatatype.datatype.BooleanDatatype",
                        "datatypeConfig": null
                    }
                ]
            }
        };


        mockBackend.whenGET('/openmrs/ws/rest/v1/programattributetype?v=custom:(uuid,name,description,datatypeClassname,datatypeConfig,concept)').respond(attributeType.data);
        mockBackend.whenGET(Bahmni.Common.Constants.programEnrollPatientUrl + '?patient=somePatientUuid&v=full').respond(data.data);

        programService.getProgramAttributeTypes().then(function (response) {
            expect(response.length).toBe(4);
        });

        programService.getPatientPrograms(patientUuid).then(function (response) {

            expect(response.activePrograms[0].display).toEqual("End Fever Program");
            expect(response.endedPrograms[0].display).toEqual("End TB Program");
        });

        mockBackend.flush();

    });

    it('should enroll patient to a program', function () {
        var patientUuid = "somePatientUuid";
        var programUuid = "someProgramUuid";
        var dateEnrolled = "Fri Dec 11 2015 12:04:23 GMT+0530 (IST)";
        var workflowUuid = "someWorkflowUuid";
        var patientProgramAttributes = {locationName: 'alps'};
        var programAttributeTypes = [{
            uuid: '82325788-3f10-11e4-adec-0800271c1b75',
            sortWeight: 3,
            name: 'locationName',
            description: 'Location of the patient program',
            format: 'java.lang.String',
            answers: [],
            required: false
        }];

        mockBackend.whenPOST(Bahmni.Common.Constants.programEnrollPatientUrl).respond(function (method, url, data, headers) {
            expect(method).toEqual('POST');
            data = JSON.parse(data);
            expect(url).toEqual(Bahmni.Common.Constants.programEnrollPatientUrl);
            expect(data.patient).toEqual(patientUuid);
            expect(data.program).toEqual(programUuid);
            expect(moment(data.dateEnrolled).isSame(moment("2015-12-11T12:04:23+0530"))).toBe(true);

            expect(data.states[0].state).toEqual(workflowUuid);
            expect(moment(data.states[0].startDate).isSame(moment("2015-12-11T12:04:23+0530"))).toBe(true);

            expect(data.attributes).toEqual([{
                attributeType: {uuid: '82325788-3f10-11e4-adec-0800271c1b75'},
                value: 'alps'
            }]);

            return [200, {}, {}];
        });

        programService.enrollPatientToAProgram(patientUuid, programUuid, dateEnrolled, workflowUuid, patientProgramAttributes, programAttributeTypes);

        mockBackend.flush();

    });


    it('should delete patient state', function () {
        var patientProgramUuid = "somePatientProgramUuid";
        var patientStateUuid = "someStateUuid";
        programService.deletePatientState(patientProgramUuid, patientStateUuid).success(function (response) {
            expect(response.reason).toEqual("User deleted the state.");
        });
        mockBackend.when('DELETE', Bahmni.Common.Constants.programStateDeletionUrl + '/somePatientProgramUuid/state/someStateUuid').respond(function (method, url) {
            expect(url).toEqual(Bahmni.Common.Constants.programStateDeletionUrl + "/" + patientProgramUuid + "/state/" + patientStateUuid);
            return [200, {"reason": "User deleted the state."}, {}];

        });
        mockBackend.flush();


    });


    it('should retrieve list of program attribute types', function () {
        var programAttributeTypesJson = {
            "results": [
                {
                    "uuid": "82325788-3f10-11e4-adec-0800271c1b75",
                    "name": "locationName",
                    "sortWeight": 3.0,
                    "description": "Location of the patient program",
                    "format": "java.lang.String",
                    "concept": null
                },
                {
                    "uuid": "82325788-3f10-11es-adec-0800271c1b75",
                    "name": "mandatory",
                    "sortWeight": 3.0,
                    "description": "Is the program mandatory",
                    "format": "java.lang.Boolean",
                    "concept": null
                }
            ]
        };

        mockBackend.whenGET('/openmrs/ws/rest/v1/programattributetype?v=custom:(uuid,name,description,datatypeClassname,datatypeConfig,concept)').respond(programAttributeTypesJson);


        programService.getProgramAttributeTypes().then(function (programAttributeTypes) {
            expect(programAttributeTypes.length).toBe(2);
            expect(programAttributeTypes).toEqual([{
                uuid: '82325788-3f10-11e4-adec-0800271c1b75',
                sortWeight: 3,
                name: 'locationName',
                fullySpecifiedName: 'locationName',
                description: 'Location of the patient program',
                format: 'java.lang.String',
                answers: [],
                required: false,
                concept: {dataType: undefined},
                excludeFrom: []
            }, {
                uuid: '82325788-3f10-11es-adec-0800271c1b75',
                sortWeight: 3,
                name: 'mandatory',
                fullySpecifiedName: 'mandatory',
                description: 'Is the program mandatory',
                format: 'java.lang.Boolean',
                answers: [],
                required: false,
                concept: {dataType: undefined},
                excludeFrom: []
            }]);

        });
        mockBackend.flush();

    });

    describe("Program attributes", function () {
        var programResponse = [
            {
                "uuid": "someProgram1Uuid",
                "name": "Test Program 1",
                "retired": false,
                "outcomesConcept": {},
                "allWorkflows": [],
                "attributes": []
            }];

        var today = DateUtil.endOfToday();
        var tenDaysAgo = DateUtil.addDays(today, -10);
        var data = {
            data: {
                results: [
                    {
                        "display": "Tuberculosis Program",
                        "dateEnrolled": DateUtil.parseLongDateToServerFormat(tenDaysAgo),
                        "dateCompleted": null,
                        "patient": {"uuid": "ad95e200-6196-4438-a078-16ad0506a473"},
                        "states": [],
                        "program": {
                            "name": "program",
                            "uuid": "1209df07-b3a5-4295-875f-2f7bae20f86e",
                            "retired": false,
                            "allWorkflows": []
                        },
                        "attributes": [{
                            "attributeType": {
                                "description": "sample att description",
                                "display": "endtbName",
                                "links": Array[1],
                                "retired": false,
                                "uuid": "4131c8cf-bf60-47c5-a46c-9142c554ab85"
                            },
                            "display": "endtbName: bmn",
                            "links": Array[2],
                            "name": "sample att name",
                            "resourceVersion": "1.9",
                            "uuid": "79f68f3e-a2b2-4680-bf9d-86cb3124d6e5",
                            "value": "bmn",
                            "voided": false
                        }],
                        "outcome": null
                    }
                ]
            }
        };

        var patientUuid = "somePatientUuid";

        it("should have attributes field in the response even though attributes are not registered", function () {
            spyOn(programService, 'savePatientProgram').and.returnValue(programResponse);

            expect(programService.savePatientProgram()[0].attributes).toEqual([]);
        });

        it("should have attribute representation", function () {
            mockBackend.whenGET(Bahmni.Common.Constants.programEnrollPatientUrl + '?patient=somePatientUuid&v=full').respond(data.data);
            mockBackend.whenGET('/openmrs/ws/rest/v1/programattributetype?v=custom:(uuid,name,description,datatypeClassname,datatypeConfig,concept)').respond(
                {
                    "results": [
                        {
                            "description": "sample att description",
                            "display": "endtbName",
                            "links": Array[1],
                            "retired": false,
                            "uuid": "4131c8cf-bf60-47c5-a46c-9142c554ab85",
                            "datatypeClassname": "org.bahmni.module.bahmnicore.customdatatype.datatype.CodedConceptDatatype"
                        }
                    ]
                });


            programService.getPatientPrograms(patientUuid).then(function (response) {
                expect(response.activePrograms[0].attributes[0].name).toEqual("sample att description");
            });

            mockBackend.flush();
        });

        it("should have attribute name if description is not available", function () {
            data.data.results[0].attributes = [{
                "attributeType": {
                    "description": null,
                    "display": "endtbName",
                    "links": Array[1],
                    "retired": false,
                    "uuid": "4131c8cf-bf60-47c5-a46c-9142c554ab85"
                },
                "display": "endtbName: bmn",
                "links": Array[2],
                "name": "sample att name",
                "resourceVersion": "1.9",
                "uuid": "79f68f3e-a2b2-4680-bf9d-86cb3124d6e5",
                "value": "bmn",
                "voided": false
            }];

            mockBackend.whenGET(Bahmni.Common.Constants.programEnrollPatientUrl + '?patient=somePatientUuid&v=full').respond(data.data);
            mockBackend.whenGET('/openmrs/ws/rest/v1/programattributetype?v=custom:(uuid,name,description,datatypeClassname,datatypeConfig,concept)').respond({
                "results": [
                    {
                        "description": null,
                        "display": "endtbName",
                        "links": Array[1],
                        "retired": false,
                        "uuid": "4131c8cf-bf60-47c5-a46c-9142c554ab85",
                        "datatypeClassname": "org.bahmni.module.bahmnicore.customdatatype.datatype.CodedConceptDatatype"
                    }
                ]
            });

            programService.getPatientPrograms(patientUuid).then(function (response) {
                expect(response.activePrograms[0].attributes[0].name).toEqual("sample att name");
            });

            mockBackend.flush();


        })
    });

    it('test savePatientProgram', function () {
        var patientProgramUuid = "somePatientProgramUuid";
        var content = "SampleContent";

        mockBackend.whenPOST(Bahmni.Common.Constants.programEnrollPatientUrl + '/somePatientProgramUuid').respond(function (method, url, data, headers) {
            expect(url).toEqual(Bahmni.Common.Constants.programEnrollPatientUrl + "/" + patientProgramUuid);
            expect(data).toEqual(content);
            return [200, {}, {}];
        });
        programService.savePatientProgram(patientProgramUuid, content);
        mockBackend.flush();

    });

    it('test updatePatientProgram', function () {

        var programAttributes = {
            "Sample Regex attribute": "123",
            "Sample date attribute": "2016-01-12T00:00:00.000+0000"
        };
        var programAttributeTypes = [
            {
                "uuid": "079b73c6-b854-11e5-9584-0800274a5156",
                "name": "Sample Regex attribute"
            },
            {
                "uuid": "07ae82e4-b854-11e5-9584-0800274a5156",
                "name": "Sample date attribute"
            }
        ];
        var attributes = [
            {
                "uuid": "6ccf5c9c-9f8c-4e46-b40b-c203b033f6d7",
                "attributeType": {
                    "uuid": "079b73c6-b854-11e5-9584-0800274a5156",
                },
                "value": "123"
            },
            {
                "uuid": "12cac096-ac84-419f-88c3-f140a3c13d98",
                "attributeType": {
                    "uuid": "07ae82e4-b854-11e5-9584-0800274a5156",
                },
                "value": "2016-01-12T00:00:00.000+0000"
            }
        ];

        var patientProgram = {
            "uuid": "Some UUID",
            "patientProgramAttributes": programAttributes,
            "attributes": attributes,
            "dateEnrolled": "2016-01-01",
            "states": []
        };

        var dateCompleted = "2016-01-12T00:00:00.000+0000";
        var content = {
            "attributes": attributes,
            "states": [],
            "outcome": null,
            "dateCompleted": moment("2016-01-12T05:30:00+0530").format('YYYY-MM-DDTHH:mm:ssZZ'),
            "dateEnrolled": moment("2016-01-01T00:00:00").format('YYYY-MM-DDTHH:mm:ssZZ'),
            "uuid": "Some UUID",
            "voided" : false
        };

        mockBackend.whenPOST(Bahmni.Common.Constants.programEnrollPatientUrl + '/Some UUID').respond(function (method, url, data, headers) {
            data = JSON.parse(data);
            expect(url).toEqual(Bahmni.Common.Constants.programEnrollPatientUrl + "/" + patientProgram.uuid);
            expect(data).toEqual(content);
            return [200, {}, {}];
        });

        programService.updatePatientProgram(patientProgram, programAttributeTypes, dateCompleted);

        mockBackend.flush();
    });

    it('test getProgramStateConfig', function () {
        expect(programService.getProgramStateConfig()).toBeTruthy();
    });

    it("should make a call to get specific program", function () {
        mockBackend.expectGET(Bahmni.Common.Constants.programEnrollPatientUrl + "?patient=patientUuid&patientProgramUuid=patientProgramUuid&v=full").respond(function () {
            return [200, {}, {}]
        });
        mockBackend.whenGET('/openmrs/ws/rest/v1/programattributetype?v=custom:(uuid,name,description,datatypeClassname,datatypeConfig,concept)').respond({
            "results": [
                {
                    "description": null,
                    "display": "endtbName",
                    "links": Array[1],
                    "retired": false,
                    "uuid": "4131c8cf-bf60-47c5-a46c-9142c554ab85",
                    "datatypeClassname": "org.bahmni.module.bahmnicore.customdatatype.datatype.CodedConceptDatatype"
                }
            ]
        });

        programService.getPatientPrograms('patientUuid', false, 'patientProgramUuid');

        mockBackend.flush();
    });

    it("should get enrollment informantion for a patient with given patientUuid", function () {
        mockBackend.expectGET(Bahmni.Common.Constants.programEnrollPatientUrl + "?patient=patientUuid&v=custom:(uuid,dateEnrolled,program:(uuid),patient:(uuid))").respond(
            {
                "results": [
                    {
                        "uuid": "110387db-8f0e-4c8c-9a3b-f4893e678b1c",
                        "dateEnrolled": "2016-10-09T00:00:00.000+0300",
                        "program": {
                            "uuid": "029262f3-b618-4c1e-80c2-d4ecadd38fb2"
                        },
                        "patient": {
                            "uuid": "f8d489b0-57a5-440b-9627-07297cb47997"
                        }
                    }
                ]
            }
        );

        programService.getEnrollmentInfoFor('patientUuid', 'custom:(uuid,dateEnrolled,program:(uuid),patient:(uuid))');
        mockBackend.flush();
    });

    it('test getObservationFormsConfig', function () {
        expect(programService.getObservationFormsConfig()).toBeTruthy();
    });

});
