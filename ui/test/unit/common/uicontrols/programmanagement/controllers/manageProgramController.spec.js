'use strict';

describe("ManageProgramController", function () {

    var scope, messageService, i = 0, programService, _provide, deferred, q, _spinner,
        retrospectiveEntryService, listOfPrograms, programAttributeTypes, allPrograms;
    beforeEach(module('bahmni.common.uicontrols.programmanagment'));

    beforeEach(module(function ($provide) {
        _provide = $provide;
        programService = jasmine.createSpyObj('programService', ['getPatientPrograms', 'getAllPrograms',
           'deletePatientState', 'getProgramAttributeTypes', 'updatePatientProgram']);

        programService.getPatientPrograms.and.callFake(function () {
            deferred = q.defer();
            deferred.resolve(listOfPrograms);
            return deferred.promise;
        });

        programService.getAllPrograms.and.callFake(function () {
            deferred = q.defer();
            deferred.resolve(allPrograms);
            return deferred.promise;
        });

        programService.deletePatientState.and.callFake(function () {
            deferred = q.defer();
            deferred.resolve({data: {results: listOfPrograms}});
            return deferred.promise;
        });

        programService.getProgramAttributeTypes.and.callFake(function() {
            deferred = q.defer();
            deferred.resolve(programAttributeTypes);
            return deferred.promise;
        });

        programService.updatePatientProgram.and.callFake(function() {
            deferred = q.defer();
            deferred.resolve({data: {results: listOfPrograms}});
            return deferred.promise;
        });



        _spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        messageService = jasmine.createSpyObj('messageService', ['showMessage']);
        retrospectiveEntryService = jasmine.createSpyObj('retrospectiveEntryService', ['getRetrospectiveDate']);

        $provide.value('programService', programService);
        $provide.value('spinner', _spinner);
        $provide.value('messagingService', messageService);
        $provide.value('retrospectiveEntryService', retrospectiveEntryService);
        $provide.value('$stateParams', {configName: "default"});
    }));


    beforeEach(inject(function ($controller, $rootScope, $q) {
        scope = $rootScope.$new();
        scope.patient = {uuid: "some uuid"};
        q = $q;
    }));

    beforeEach(function(){
       listOfPrograms = {

            "activePrograms":[{
                "display": "program",
                "dateEnrolled": "2015-07-25T18:29:59.000+0000",
                "dateCompleted": null,
                "outcome": null,
                "patient":{"uuid":"ad95e200-6196-4438-a078-16ad0506a473"},
                "states": [
                    {
                        state:{ uuid: '1911a3ef-cfab-43c5-8810-7f594bfa8995'},
                        startDate: "2015-07-01",
                        endDate: "2015-07-15"
                    },
                    {
                        uuid: '2417ab09-52b4-4573-aefa-7f6e7bdf6d81',
                        state: {
                            uuid: '1317ab09-52b4-4573-aefa-7f6e7bdf6d61',
                            concept: {
                                display: "Current State"
                            }
                        },
                        startDate: "2015-07-15",
                        endDate: null
                    }
                ],
                "uuid": "someUuid",
                "program": {
                    "name": "program",
                    "uuid": "1209df07-b3a5-4295-875f-2f7bae20f86e",
                    "retired": false,
                    "description": "program",
                    "concept": {
                        "uuid": "c460f0d5-3f10-11e4-adec-0800271c1b75",
                        "display": "VIA Test",
                        "links": [
                            {
                                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c460f0d5-3f10-11e4-adec-0800271c1b75",
                                "rel": "self"
                            }
                        ]
                    },
                    "allWorkflows": [
                        {
                            "uuid": "6a6c990f-01e2-464b-9452-2a97f0c05c7c",
                            "concept": {
                                "uuid": "8227f47f-3f10-11e4-adec-0800271c1b75",
                                "display": "All_Tests_and_Panels",
                                "links": [
                                    {
                                        "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/8227f47f-3f10-11e4-adec-0800271c1b75",
                                        "rel": "self"
                                    }
                                ]
                            },
                            "description": null,
                            "retired": false,
                            "states": [
                                {
                                    uuid: '1911a3ef-cfab-43c5-8810-7f594bfa8995',
                                    display: 'Statea'
                                },
                                {
                                    uuid: '1317ab09-52b4-4573-aefa-7f6e7bdf6d61',
                                    display: 'Stateb'
                                }
                            ],
                            "resourceVersion": "1.8"
                        }
                    ]
                }
            }],

            "endedPrograms": [{
                "display": "program in Past",
                "dateEnrolled": "2015-07-25T18:29:59.000+0000",
                "dateCompleted": "2015-07-15T18:29:59.000+0000",
                "outcome": null,
                "uuid": "5b022462-4f79-4a24-98eb-8f143f942584",
                "program": {
                    "name": "program",
                    "uuid": "1209df07-b3a5-4295-875f-2f7bae20f86e",
                    "retired": false,
                    "description": "program",
                    "concept": {
                        "uuid": "c460f0d5-3f10-11e4-adec-0800271c1b75",
                        "display": "VIA Test",
                        "links": [
                            {
                                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c460f0d5-3f10-11e4-adec-0800271c1b75",
                                "rel": "self"
                            }
                        ]
                    },
                    "allWorkflows": [
                        {
                            "uuid": "6a6c990f-01e2-464b-9452-2a97f0c05c7c",
                            "concept": {
                                "uuid": "8227f47f-3f10-11e4-adec-0800271c1b75",
                                "display": "All_Tests_and_Panels",
                                "links": [
                                    {
                                        "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/8227f47f-3f10-11e4-adec-0800271c1b75",
                                        "rel": "self"
                                    }
                                ]
                            },
                            "description": null,
                            "retired": false,
                            "states": [
                                {
                                    uuid: '1911a3ef-cfab-43c5-8810-7f594bfa8995'
                                },
                                {
                                    uuid: '1317ab09-52b4-4573-aefa-7f6e7bdf6d61'
                                }
                            ],
                            "resourceVersion": "1.8"
                        }
                    ]
                }
            }]
        };
        programAttributeTypes = [{
            uuid: '82325788-3f10-11e4-adec-0800271c1b75',
            sortWeight: 3,
            name: 'locationName',
            description: 'Location of the patient program',
            format: 'java.lang.String',
            answers: [],
            required: false
        }, {
            uuid: '82325788-3f10-11es-adec-0800271c1b75',
            sortWeight: 3,
            name: 'mandatory',
            description: 'Is the program mandatory',
            format: 'java.lang.Boolean',
            answers: [],
            required: false
        }];
        allPrograms = [
            {
                "uuid": "1209df07-b3a5-4295-875f-2f7bae20f86e",
                "name": "program",
                "outcomesConcept": {
                    "uuid": "6475249b-b681-4aae-ad6c-a2d580b4be3d",
                    "display": "HIV outcomes",
                    "setMembers": [
                        {
                            "uuid": "8a1ab485-e599-4682-8c82-c60ce03c916e",
                            "display": "Cured"
                        },
                        {
                            "uuid": "041daad2-198b-4223-aa46-6b23e85776a9",
                            "display": "Death"
                        }
                    ],
                    "resourceVersion": "1.9"
                },

                "allWorkflows": [
                    {
                        "uuid": "6a6c990f-01e2-464b-9452-2a97f0c05c7c",
                        "concept": {
                            "uuid": "8227f47f-3f10-11e4-adec-0800271c1b75",
                            "display": "All_Tests_and_Panels",
                            "links": [
                                {
                                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/8227f47f-3f10-11e4-adec-0800271c1b75",
                                    "rel": "self"
                                }
                            ]
                        },
                        "retired": false,
                        "states": [{
                            "uuid": "8227f47f-3f10-11e4-adec-0800271c1b75",
                            "display": "All_Tests_and_Panels",
                            "retired":false
                        },{
                            "uuid": "8227f47f-3f10-11e4-adec-0800271c1590",
                            "display": "VAT_Tests_and_Panels",
                            "retired":false

                        }],
                        "links": [
                            {
                                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/workflow/6a6c990f-01e2-464b-9452-2a97f0c05c7c",
                                "rel": "self"
                            }
                        ]
                    }
                ],
                "links": [
                    {
                        "uri": "NEED-TO-CONFIGURE/ws/rest/v1/program/1209df07-b3a5-4295-875f-2f7bae20f86e",
                        "rel": "self"
                    }
                ]
            }
        ];

    })

    var setUp = function () {
        inject(function ($controller, $rootScope, $q) {
            $controller('ManageProgramController', {
                $scope: scope,
                $rootScope: $rootScope,
                q: $q
            });
        });
    };

    it("should update active programs list", function () {
        scope.$apply(setUp);
        expect(scope.allPrograms.length).toBe(1);
        expect(scope.activePrograms.length).toBe(1);
        expect(scope.endedPrograms.length).toBe(1);
        expect(scope.programAttributeTypes.length).toEqual(2);
        expect(scope.programSelected).toEqual(null);
        expect(scope.patientProgramAttributes).toEqual({});
    });


    it("should return true if patient has enrolled to SomePrograms", function() {
        scope.$apply(setUp);
        expect(scope.hasPatientEnrolledToSomePrograms()).toBeTruthy();
    });

    it("should return true if patient had enrolled in any past programs", function() {
        scope.$apply(setUp);
        expect(scope.hasPatientAnyPastPrograms()).toBeTruthy();
    });

    describe('get maximum allowed program enrollment date for edit flow',function(){
        it("Should return minimum start date of states",function(){
            scope.$apply(setUp);
            var maxDate =  scope.getMaxAllowedDate(listOfPrograms.activePrograms[0].states);
            expect(maxDate).toEqual('2015-07-01')
        });

        it("Should return current date when there are no states",function(){
            scope.$apply(setUp);
            var maxDate =  scope.getMaxAllowedDate([]);
            expect(maxDate).toEqual(Bahmni.Common.Util.DateUtil.getDateWithoutTime(new Date()));
        });
    });

    describe("Remove program states", function () {

        it("should remove latest program state", function () {
            scope.$apply(setUp);
            scope.removePatientState(listOfPrograms.activePrograms[0]);
            expect(programService.deletePatientState).toHaveBeenCalledWith(listOfPrograms.activePrograms[0].uuid, listOfPrograms.activePrograms[0].states[1].uuid);
        });

        it("should be able to remove program state when it is the active state", function () {
            scope.$apply(setUp);
            expect(scope.canRemovePatientState(listOfPrograms.activePrograms[0].states[1])).toBeTruthy();
        });
    });



    describe("update attributes", function () {
        it("should save program attributes", function () {
            scope.$apply(setUp);
            var programToBeUpdated = listOfPrograms.activePrograms[0];
            programToBeUpdated.patientProgramAttributes = {"locationName":"Loc1"};

            scope.updatePatientProgram(programToBeUpdated);

            expect(programService.updatePatientProgram).toHaveBeenCalledWith(programToBeUpdated, scope.programAttributeTypes, null);
        });

    });


    describe("transition state", function () {
        it("should validate if state to be transited is starting after the current running state", function () {
            scope.$apply(setUp);
            var programToBeUpdated = listOfPrograms.activePrograms[0];
            var newStateUuid = '1317ab09-52b4-4573-aefa-7f6e7bdf6d61';
            scope.programEdited={selectedState : {uuid: newStateUuid}};
            retrospectiveEntryService.getRetrospectiveDate.and.callFake(function(){
                    return '2015-07-12';
            });

            scope.updatePatientProgram(programToBeUpdated);

            expect(messageService.showMessage).toHaveBeenCalledWith("error", "State cannot be started earlier than current state (15 Jul 15)");
        });

        it("should transit from one state to another successfully", function(){
            scope.$apply(setUp);
            var programToBeUpdated = listOfPrograms.activePrograms[0];
            retrospectiveEntryService.getRetrospectiveDate.and.callFake(function(){
                    return '2015-07-19';

            });
            var newStateUuid = '1317ab09-52b4-4573-aefa-7f6e7bdf6d61';
            scope.programEdited={selectedState : {uuid: newStateUuid}};

            expect(programToBeUpdated.states.length).toBe(2);
            scope.updatePatientProgram(programToBeUpdated);
            scope.$digest();
            expect(programService.updatePatientProgram).toHaveBeenCalledWith(programToBeUpdated, programAttributeTypes, null);
            expect(programToBeUpdated.states.length).toBe(3);
            expect(programToBeUpdated.states[2].startDate).toBe(Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat("2015-07-19"));
            expect(programToBeUpdated.states[2].state.uuid).toBe(newStateUuid);
            expect(messageService.showMessage).toHaveBeenCalledWith("info", "Saved");
        });

        it("should show failure message on any server error with state transition", function(){
            scope.$apply(setUp);
            var programToBeUpdated = listOfPrograms.activePrograms[0];
            retrospectiveEntryService.getRetrospectiveDate.and.callFake(function(){
                    return '2015-07-19';

            });
            programService.updatePatientProgram.and.callFake(function () {
                deferred = q.defer();
                deferred.reject({data: {error: ''}});
                return deferred.promise;
            });

            scope.programEdited={selectedState : {uuid: '1317ab09-52b4-4573-aefa-7f6e7bdf6d61'}};

            scope.updatePatientProgram(programToBeUpdated);
            scope.$digest();
            expect(messageService.showMessage).toHaveBeenCalledWith("error", "Failed to Save");
        });


    });

    describe("end program", function(){

        it("should validate if program is ending before the current running state", function(){
            scope.$apply(setUp);
            var programToBeUpdated = listOfPrograms.activePrograms[0];
            programToBeUpdated.outcomeData={uuid: '1317ab09-52b4-4573-aefa-7f6e7bdf6d61'};

            retrospectiveEntryService.getRetrospectiveDate.and.callFake(function(){
                    return '2015-07-12';
            });

            scope.updatePatientProgram(programToBeUpdated);

            expect(messageService.showMessage).toHaveBeenCalledWith("error", "Program cannot be ended earlier than current state (15 Jul 15)");
        });

        it('should end a program successfully', function(){
            scope.$apply(setUp);
            var programToBeUpdated = listOfPrograms.activePrograms[0];
            retrospectiveEntryService.getRetrospectiveDate.and.callFake(function(){
                    return '2015-07-19';
            });
            programToBeUpdated.outcomeData = {uuid: 'outcome-uuid'};

            scope.updatePatientProgram(programToBeUpdated);
            scope.$digest();

            expect(messageService.showMessage).toHaveBeenCalledWith("info", "Saved");
        });
    });

    describe('getWorkflowStatesWithoutCurrent', function(){
        it('should fetch states of the program excluding current patient state', function(){
            scope.$apply(setUp);
            var patientProgram = listOfPrograms.activePrograms[0];

            var states = scope.getWorkflowStatesWithoutCurrent(patientProgram);

            expect(states.length).toBe(1);
        });
        it('should fetch all states of the program if patient is currently stateless', function(){
            scope.$apply(setUp);
            var patientProgram = listOfPrograms.activePrograms[0];
            patientProgram.states =[];

            var states = scope.getWorkflowStatesWithoutCurrent(patientProgram);

            expect(states.length).toBe(2);
        })
    });

    describe('Should get states',function(){
        it('Of un retired workflow',function(){
            scope.$apply(setUp);
            scope.setWorkflowStates(allPrograms[0]);

            expect(scope.programWorkflowStates.length).toBe(2);
        })
    });

    describe('get workflows',function(){
        it('should get unretired workflows for patient program',function(){
            scope.$apply(setUp);

            expect(scope.activePrograms[0].program.allWorkflows.length).toBe(1);
        });
    });


});
