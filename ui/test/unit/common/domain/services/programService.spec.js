'use strict';

describe('programService', function () {

    var rootScope,data;
    var programService;
    var DateUtil = Bahmni.Common.Util.DateUtil;

    var mockHttp = {
        get: jasmine.createSpy('Http get').and.returnValue({
            then: function(callback){
                return callback({data:{results:[]}});
            }
        }),
        post: jasmine.createSpy('Http post').and.returnValue({
            'success': function (onSuccess) {
                return {
                    'then': function (thenMethod) {
                        thenMethod()
                    },
                    'error': function (onError) {
                        onError()
                    }
                }}})
    }

    beforeEach(function(){
        module('bahmni.common.domain');
        module(function ($provide){
            $provide.value('$http', mockHttp);
        })

        inject(function (_$rootScope_, _programService_) {
            rootScope = _$rootScope_;
            programService = _programService_;
        })
    })

    it('should fetch all programs from backend and filter programs containing retired workflows and outcomes', function(done){
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
                            "retired":false
                        },{
                            "uuid": "state2Uuid",
                            "retired":true
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
                            "retired":false
                        },{
                            "uuid": "state2Uuid",
                            "retired":false
                        }]
                    }
                ]
            }
        ];

        var data = {
                data: {
                    results: allPrograms
                }
        };

        mockHttp.get.and.returnValue({
            then: function(callback){
                var allPrograms= callback(data);
                expect(allPrograms.length).toBe(1);
                expect(allPrograms[0].allWorkflows[0].states.length).toBe(1);
                done();
            }
        });

        programService.getAllPrograms();
    })

    it("should group all programs into active/ended programs and sort them according to their dateEnrolled/dateCompleted respectively",function(done){
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
                        "patient":{"uuid":"ad95e200-6196-4438-a078-16ad0506a473"},
                        "states": [
                            {
                                state:{ uuid: '1911a3ef-cfab-43c5-8810-7f594bfa8995'},
                                startDate: "2015-07-01",
                                endDate: "2015-07-15"
                            },
                            {
                                state:{ uuid: '1317ab09-52b4-4573-aefa-7f6e7bdf6d61'},
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
                        "outcome": null
                    },
                    {
                        "display": "HIV Program",
                        "dateEnrolled": DateUtil.parseLongDateToServerFormat(tenDaysAgo),
                        "dateCompleted": DateUtil.parseLongDateToServerFormat(today),
                        "patient":{"uuid":"ad95e200-6196-4438-a078-16ad0506a473"},
                        "states": [
                            {
                                state:{ uuid: '1911a3ef-cfab-43c5-8810-7f594bfa8995'},
                                startDate: "2015-07-01",
                                endDate: "2015-07-15"
                            },
                            {
                                state:{ uuid: '1317ab09-52b4-4573-aefa-7f6e7bdf6d61'},
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
                        "outcome": null
                    },
                    {
                        "display": "End TB Program",
                        "dateEnrolled": DateUtil.parseLongDateToServerFormat(tenDaysAgo),
                        "dateCompleted": DateUtil.parseLongDateToServerFormat(fiveDaysFromToday),
                        "patient":{"uuid":"ad95e200-6196-4438-a078-16ad0506a473"},
                        "states": [
                            {
                                state:{ uuid: '1911a3ef-cfab-43c5-8810-7f594bfa8995'},
                                startDate: "2015-07-01",
                                endDate: "2015-07-15"
                            },
                            {
                                state:{ uuid: '1317ab09-52b4-4573-aefa-7f6e7bdf6d61'},
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
                        "outcome": null
                    },
                    {
                        "display": "End Fever Program",
                        "dateEnrolled": DateUtil.parseLongDateToServerFormat(tenDaysAgo),
                        "dateCompleted": null,
                        "patient":{"uuid":"ad95e200-6196-4438-a078-16ad0506a473"},
                        "states": [
                            {
                                state:{ uuid: '1911a3ef-cfab-43c5-8810-7f594bfa8995'},
                                startDate: "2015-07-01",
                                endDate: "2015-07-15"
                            },
                            {
                                state:{ uuid: '1317ab09-52b4-4573-aefa-7f6e7bdf6d61'},
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
                        "outcome": null
                    }
                ]
            }
        };

        mockHttp.get.and.returnValue({
            then: function(callback){
                var groupedPrograms= callback(data);
                expect(groupedPrograms.activePrograms[0].display).toEqual("End Fever Program");
                expect(groupedPrograms.endedPrograms[0].display).toEqual("End TB Program");
                done();
            }
        });

        programService.getPatientPrograms(patientUuid);
    });

    it('should enroll patient to a program', function(){
        var patientUuid = "somePatientUuid";
        var programUuid = "someProgramUuid";
        var dateEnrolled = "Fri Dec 11 2015 12:04:23 GMT+0530 (IST)";
        var workflowUuid = "someWorkflowUuid";

        programService.enrollPatientToAProgram(patientUuid, programUuid, dateEnrolled, workflowUuid);

        expect(mockHttp.post.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.programEnrollPatientUrl);
        expect(mockHttp.post.calls.mostRecent().args[1].patient).toEqual(patientUuid);
        expect(mockHttp.post.calls.mostRecent().args[1].program).toEqual(programUuid);
        expect(mockHttp.post.calls.mostRecent().args[1].dateEnrolled).toEqual("2015-12-11T12:04:23+05:30");
        expect(mockHttp.post.calls.mostRecent().args[1].states[0].state).toEqual(workflowUuid);
        expect(mockHttp.post.calls.mostRecent().args[1].states[0].startDate).toEqual("2015-12-11T12:04:23+05:30");
    })

    it('should end patient program', function(){
        var patientProgramUuid = "somePatientProgramUuid";
        var outcome = "someOutcomeUuid";
        var dateCompleted = "Fri Dec 11 2015 12:04:23 GMT+0530 (IST)";
        programService.endPatientProgram(patientProgramUuid, dateCompleted, outcome);

        expect(mockHttp.post.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.programEnrollPatientUrl + "/" + patientProgramUuid);
        expect(mockHttp.post.calls.mostRecent().args[1].dateCompleted).toEqual("2015-12-11T12:04:23+05:30");
        expect(mockHttp.post.calls.mostRecent().args[1].outcome).toEqual(outcome);
    })

    it('should save patient program with states', function(){
        var patientProgramUuid = "somePatientProgramUuid";
        var uuid = "someStateUuid";
        var onDate = "someOnDateOfTheState";
        var programStateUuid = "someProgramStateUuid";

        var constructedState = [{ state: {uuid : uuid},  uuid : programStateUuid , startDate : onDate}];

        programService.savePatientProgram(patientProgramUuid, uuid, onDate, programStateUuid);

        expect(mockHttp.post.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.programEnrollPatientUrl + "/" + patientProgramUuid);
        expect(mockHttp.post.calls.mostRecent().args[1].states).toEqual(constructedState);
    })
})