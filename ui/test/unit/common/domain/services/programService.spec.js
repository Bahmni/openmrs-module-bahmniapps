'use strict';

describe('programService', function () {

    var rootScope;
    var programService;

    var mockHttp = {
        get: jasmine.createSpy('Http get').and.returnValue({data: "success"}),
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

    it('should fetch all programs from backend', function(){
        programService.getAllPrograms();
        expect(mockHttp.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.programUrl);
    })

    it('should fetch all active programs for a patient', function(){
        var patientUuid = "somePatientUuid";

        programService.getPatientPrograms(patientUuid);

        expect(mockHttp.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.programEnrollPatientUrl);
        expect(mockHttp.get.calls.mostRecent().args[1].params.v).toEqual("default");
        expect(mockHttp.get.calls.mostRecent().args[1].params.patient).toEqual(patientUuid);
    })

    it('should enroll patient to a program', function(){
        var patientUuid = "somePatientUuid";
        var programUuid = "someProgramUuid";
        var dateEnrolled = "someDateEnrolled";
        var workflowUuid = "someWorkflowUuid";

        programService.enrollPatientToAProgram(patientUuid, programUuid, dateEnrolled, workflowUuid);

        expect(mockHttp.post.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.programEnrollPatientUrl);
        expect(mockHttp.post.calls.mostRecent().args[1].patient).toEqual(patientUuid);
        expect(mockHttp.post.calls.mostRecent().args[1].program).toEqual(programUuid);
        expect(mockHttp.post.calls.mostRecent().args[1].dateEnrolled).toEqual(dateEnrolled);
        expect(mockHttp.post.calls.mostRecent().args[1].states[0].state).toEqual(workflowUuid);
        expect(mockHttp.post.calls.mostRecent().args[1].states[0].startDate).toEqual(dateEnrolled);
    })

    it('should end patient program', function(){
        var patientProgramUuid = "somePatientProgramUuid";
        var outcome = "someOutcomeUuid";
        var dateCompleted = "someDateCompleted";

        programService.endPatientProgram(patientProgramUuid, dateCompleted, outcome);

        expect(mockHttp.post.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.programEnrollPatientUrl + "/" + patientProgramUuid);
        expect(mockHttp.post.calls.mostRecent().args[1].dateCompleted).toEqual(dateCompleted);
        expect(mockHttp.post.calls.mostRecent().args[1].outcome).toEqual(outcome);
    })
})