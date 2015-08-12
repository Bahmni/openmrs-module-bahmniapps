'use strict';

describe("ManageProgramController", function () {

    var scope, rootScope, messageService, $bahmniCookieStore, i = 0, programService, _provide, deferred, q, _spinner;

    beforeEach(module('bahmni.common.uicontrols.programmanagment'));

    beforeEach(module(function ($provide) {
        _provide = $provide;

        programService = jasmine.createSpyObj('programService', ['getPatientPrograms', 'getAllPrograms',
            'savePatientProgram', 'endPatientProgram', 'deletePatientState']);
        programService.getPatientPrograms.and.callFake(function () {
            deferred = q.defer();
            deferred.resolve({data: {results: patientPrograms}});
            return deferred.promise;
        });

        programService.savePatientProgram.and.callFake(function () {
            deferred = q.defer();
            deferred.resolve({data: {results: patientPrograms}});
            return deferred.promise;
        });

        programService.getAllPrograms.and.callFake(function () {
            deferred = q.defer();
            deferred.resolve({data: {results: allPrograms}});
            return deferred.promise;
        });

        programService.endPatientProgram.and.callFake(function () {
            deferred = q.defer();
            deferred.resolve({data: {results: patientPrograms}});
            return deferred.promise;
        });

        programService.deletePatientState.and.callFake(function () {
            deferred = q.defer();
            deferred.resolve({data: {results: patientPrograms}});
            return deferred.promise;
        });


        $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['get']);

        _spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        messageService = jasmine.createSpyObj('messageService', ['showMessage']);

        $provide.value('programService', programService);
        $provide.value('$bahmniCookieStore', $bahmniCookieStore);
        $provide.value('spinner', _spinner);
        $provide.value('messagingService', messageService);
    }));


    beforeEach(inject(function ($controller, $rootScope, $q) {
        scope = $rootScope.$new();
        scope.patient = {uuid: "some uuid"};
        q = $q;
    }));

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
        expect(scope.activePrograms.length).toBe(1);
        expect(scope.endedPrograms.length).toBe(1);
    });

    it("should return true if patient has enrolled to SomePrograms", function() {
        scope.$apply(setUp);
        expect(scope.hasPatientEnrolledToSomePrograms()).toBeTruthy();
    });

    it("should return true if patient had enrolled in any past programs", function() {
        scope.$apply(setUp);
        expect(scope.hasPatientAnyPastPrograms()).toBeTruthy();
    });

    it("should get current state display name", function () {
        scope.$apply(setUp);
        expect(scope.getCurrentStateDisplayName(patientPrograms[0])).toBe("Current State");
    });

    describe("Remove program states", function () {

        it("should remove latest program state", function () {
            scope.$apply(setUp);
            scope.removePatientState(patientPrograms[0]);
            expect(programService.deletePatientState).toHaveBeenCalledWith(patientPrograms[0].uuid,
                patientPrograms[0].states[1].uuid);

        });

        it("should be able to remove program states when there are at lease 1 active state", function () {
            scope.$apply(setUp);
            expect(scope.canRemovePatientState(patientPrograms[0])).toBeTruthy();
        });
    });


    describe("savePatientProgram", function () {
        it("should validate if state to be transited is starting after the current running state", function () {
            scope.$apply(setUp);
            var programToBeUpdated = patientPrograms[0];
            $bahmniCookieStore.get.and.callFake(function(cookieName){
                if(cookieName == Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName)
                    return '2015-07-12';
            });

            scope.savePatientProgram(programToBeUpdated);

            expect(messageService.showMessage).toHaveBeenCalledWith("formError", "State cannot be started earlier than current state (15 Jul 15)");
        });

        it("should validate if state to be transited not selected", function(){
            scope.$apply(setUp);
            var programToBeUpdated = patientPrograms[0];
            $bahmniCookieStore.get.and.callFake(function(cookieName){
                if(cookieName == Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName)
                    return '2015-07-19';

            });
            scope.programEdited.selectedState = null;

            scope.savePatientProgram(programToBeUpdated);

            expect(messageService.showMessage).toHaveBeenCalledWith("formError", "Please select a state to change.");
        });

        it("should transit from one state to another successfully", function(){
            scope.$apply(setUp);
            var programToBeUpdated = patientPrograms[0];
            $bahmniCookieStore.get.and.callFake(function(cookieName){
                if(cookieName == Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName)
                    return '2015-07-19';

            });
            scope.programEdited={selectedState : {uuid: '1317ab09-52b4-4573-aefa-7f6e7bdf6d61'}};

            scope.savePatientProgram(programToBeUpdated);
            scope.$digest();
            expect(messageService.showMessage).toHaveBeenCalledWith("info", "Saved");
        });

        it("should show failure message on any server error with state transition", function(){
            scope.$apply(setUp);
            var programToBeUpdated = patientPrograms[0];
            $bahmniCookieStore.get.and.callFake(function(cookieName){
                if(cookieName == Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName)
                    return '2015-07-19';

            });
            programService.savePatientProgram.and.callFake(function () {
                deferred = q.defer();
                deferred.reject({data: {error: ''}});
                return deferred.promise;
            });

            scope.programEdited={selectedState : {uuid: '1317ab09-52b4-4573-aefa-7f6e7bdf6d61'}};

            scope.savePatientProgram(programToBeUpdated);
            scope.$digest();
            expect(messageService.showMessage).toHaveBeenCalledWith("error", "Failed to Save");
        });

    });
    describe("endPatientProgram", function(){

        it("should validate if program is ending before the current running state", function(){
            scope.$apply(setUp);
            var programToBeUpdated = patientPrograms[0];
            $bahmniCookieStore.get.and.callFake(function(cookieName){
                if(cookieName == Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName)
                    return '2015-07-12';
            });

            scope.endPatientProgram(programToBeUpdated);

            expect(messageService.showMessage).toHaveBeenCalledWith("formError", "Program cannot be ended earlier than current state (15 Jul 15)");
        });

        it('should validate if ouctome is selected on ending the program', function(){
            scope.$apply(setUp);
            var programToBeUpdated = patientPrograms[0];
            $bahmniCookieStore.get.and.callFake(function(cookieName){
                if(cookieName == Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName)
                    return '2015-07-19';
            });
            programToBeUpdated.outcomeData = null;

            scope.endPatientProgram(programToBeUpdated);

            expect(messageService.showMessage).toHaveBeenCalledWith("formError", "Please select an outcome.");
        });

        it('should end a program successfully', function(){
            scope.$apply(setUp);
            var programToBeUpdated = patientPrograms[0];
            $bahmniCookieStore.get.and.callFake(function(cookieName){
                if(cookieName == Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName)
                    return '2015-07-19';
            });
            programToBeUpdated.outcomeData = {uuid: 'outcome-uuid'};

            scope.endPatientProgram(programToBeUpdated);
            scope.$digest();

            expect(messageService.showMessage).toHaveBeenCalledWith("info", "Program ended successfully");
        });
    });


    describe('getOutcomes', function(){
        it('should fetch outcomes of the program', function(){
            scope.$apply(setUp);
            var program = patientPrograms[0].program;

            var outcomes = scope.getOutcomes(program);

            expect(outcomes.length).toBe(2);
        })
    });

    describe('getWorkflowStatesWithoutCurrent', function(){
        it('should fetch states of the program excluding current patient state', function(){
            scope.$apply(setUp);
            var patientProgram = patientPrograms[0];

            var workflowStates = scope.getWorkflowStatesWithoutCurrent(patientProgram);

            expect(workflowStates.length).toBe(1);
        });
        it('should fetch all states of the program if patient is currently stateless', function(){
            scope.$apply(setUp);
            var patientProgram = patientPrograms[0];
            patientProgram.states =[];

            var workflowStates = scope.getWorkflowStatesWithoutCurrent(patientProgram);

            expect(workflowStates.length).toBe(2);
        })
    });

    describe('Should get states',function(){
        it('Of un retired workflow',function(){
            scope.$apply(setUp);
            scope.getWorkflowStates(allPrograms[0]);

            expect(scope.programWorkflowStates.length).toBe(2);
        })
    });
    var allPrograms = [
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

    var patientPrograms = [
        {
            "display": "program",
            "dateEnrolled": "2015-07-25T18:29:59.000+0000",
            "dateCompleted": null,
            "outcome": null,
            "patient": {"uuid": "ad95e200-6196-4438-a078-16ad0506a473"},
            "states": [
                {
                    state: {uuid: '1911a3ef-cfab-43c5-8810-7f594bfa8995'},
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


            "uuid": "5b022462-4f79-4a24-98eb-8f143f942583",
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
        },
        {
            "display": "program in Past",
            "dateEnrolled": "2015-07-25T18:29:59.000+0000",
            "dateCompleted": "2015-07-15T18:29:59.000+0000",
            "outcome": null,
            "uuid": "5b022462-4f79-4a24-98eb-8f143f942584"
        }
    ];
});