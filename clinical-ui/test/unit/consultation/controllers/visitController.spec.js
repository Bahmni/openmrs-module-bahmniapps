'use strict';

describe("VisitControllerTest", function () {
    var encounterService;
    var visitService;
    var patientVisitHistoryService;
    var scope;
    var visitController;
    var visitUuid = "c8a76229-5b96-438e-a41a-cdd5b19b539f"
    var route = {current: {params: { visitUuid: visitUuid}}};
    var routeParams ={patientUuid:'pat-uuid'};
    var encounterSearchPromise;
    var visitSummaryPromise;
    var visitHistoryPromise;
    var visitSummary;
    var spinner;

    beforeEach(module('opd.consultation'));

    beforeEach(inject(function ($rootScope) {
        spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        encounterService = jasmine.createSpyObj('encounterService', ['search']);
        visitService = jasmine.createSpyObj('visitService', ['getVisitSummary']);
        patientVisitHistoryService = jasmine.createSpyObj('patientVisitHistoryService', ['getVisits']);
        visitSummaryPromise = specUtil.createServicePromise('visitSummary');
        visitService.getVisitSummary.andReturn(visitSummaryPromise);
        visitHistoryPromise = specUtil.createServicePromise('visitHistory');
        patientVisitHistoryService.getVisits.andReturn(visitHistoryPromise);
        encounterSearchPromise = specUtil.createServicePromise('encounterSeacrh');
        encounterService.search.andReturn(encounterSearchPromise);
        scope = $rootScope.$new();
        scope.encounterConfig = {};
        $rootScope.patient = { uuid: '1234'}
        visitSummary = { hasEncounters: function() { return true; }}
        spyOn(Bahmni.Opd.Consultation.VisitSummary, 'create').andReturn(visitSummary);
    }));

    var setUpController = function () {
        inject(function ($controller) {
            visitController = $controller('VisitController', {
                $scope: scope,
                $route: route,
                spinner: spinner,
                visitService: visitService,
                $routeParams : routeParams,
 //               patientVisitHistoryService: patientVisitHistoryService,
                encounterService: encounterService
            });
        });
    };


    describe("after loading visitSummary", function(){
        beforeEach(function(){
            setUpController();
        });
     /*
        it("should load the visit details for most recent encounter date", function(){
            visitSummary.mostRecentEncounterDateTime = new Date("2013-12-03");
            visitSummary.visitStartDateTime = new Date("2013-12-01");

        	visitSummaryPromise.callSuccessCallBack();

            expect(encounterService.search.callCount).toBe(1);
            expect(encounterService.search).toHaveBeenCalledWith(visitUuid, "2013-12-03");
            expect(scope.hasMoreVisitDays).toBe(true);
        })

        it("should populate visit days with the day number after succesfully fetching the vist details for a day", function(){
            visitSummary.mostRecentEncounterDateTime = new Date("2013-12-03");
            visitSummary.visitStartDateTime = new Date("2013-12-01");
            spyOn(Bahmni.Opd.Consultation.VisitDay, 'create').andReturn({});
            
        	visitSummaryPromise.callSuccessCallBack();
			encounterSearchPromise.callSuccessCallBack([]);
            
            expect(scope.visitDays.length).toBe(1);
            expect(Bahmni.Opd.Consultation.VisitDay.create.mostRecentCall.args[0]).toBe(3); //day 3
        })*/
    });

    describe("loadEncountersForPreviousDay", function(){
        beforeEach(function(){
            setUpController();
        });

     /*   it("should load previous day visit details if fetching the current day visit details is completed",function(){
            visitSummary.mostRecentEncounterDateTime = new Date("2013-12-03");
            visitSummary.visitStartDateTime = new Date("2013-12-01");
        	visitSummaryPromise.callSuccessCallBack();
            
            encounterSearchPromise.callThenCallBack(); // Loading visit details for 2013-12-03 is completed            
            scope.loadEncountersForPreviousDay();

            expect(encounterService.search.callCount).toBe(2);
            expect(encounterService.search.mostRecentCall.args[0]).toBe(visitUuid);
            expect(encounterService.search.mostRecentCall.args[1]).toBe("2013-12-02");
            expect(scope.hasMoreVisitDays).toBe(true);
        })*/

        it("should not load previous day visit details if fetching the current day visit details is is progress",function(){
            visitSummary.mostRecentEncounterDateTime = new Date("2013-12-03");
            visitSummary.visitStartDateTime = new Date("2013-12-01");
        	visitSummaryPromise.callSuccessCallBack();
            
            scope.loadEncountersForPreviousDay();
            scope.loadEncountersForPreviousDay();
            scope.loadEncountersForPreviousDay();

            expect(encounterService.search.callCount).toBe(1);
        })

       /* it("should not load visit details beyond visit start date",function(){
            visitSummary.mostRecentEncounterDateTime = new Date("2013-12-03");
            visitSummary.visitStartDateTime = new Date("2013-12-02");
        	visitSummaryPromise.callSuccessCallBack();
            encounterSearchPromise.callThenCallBack(); // Loading visit details for 2013-12-03 is completed
            
            scope.loadEncountersForPreviousDay();
            encounterSearchPromise.callThenCallBack(); // Loading visit details for 2013-12-02 is completed

            expect(scope.hasMoreVisitDays).toBe(false);
            
            scope.loadEncountersForPreviousDay();
            scope.loadEncountersForPreviousDay();
            expect(encounterService.search.callCount).toBe(2);
        })*/
    });
});
