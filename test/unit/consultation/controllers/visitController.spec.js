'use strict';

describe("VisitControllerTest", function () {
    var encounterService;
    var scope;
    var visitController;
    var visitUuid = "c8a76229-5b96-438e-a41a-cdd5b19b539f"
    var route = {current: {params: { visitUuid: visitUuid}}};
    var encounterSearchPromise;

    beforeEach(module('opd.consultation'));

    beforeEach(inject(function ($rootScope) {
        encounterService = jasmine.createSpyObj('encounterService', ['search']);
        encounterSearchPromise = specUtil.createServicePromise('encounterSeacrh');
        encounterService.search.andReturn(encounterSearchPromise);
        scope = $rootScope.$new();
        scope.encounterConfig = {};
        scope.visitSummary = { hasEncounters: function() { return true; }}
    }));

    var setUpController = function () {
        inject(function ($controller) {
            visitController = $controller('VisitController', {
                $scope: scope,
                $route: route,
                encounterService: encounterService
            });
        });
    };


    describe("on initialization", function(){
        it("should load the visit details for most recent encounter date", function(){
            scope.visitSummary.mostRecentEncounterDateTime = new Date("2013-12-03");
            scope.visitSummary.visitStartDateTime = new Date("2013-12-01");

            setUpController();

            expect(encounterService.search).toHaveBeenCalledWith(visitUuid, "2013-12-03");
            expect(encounterService.search.callCount).toBe(1);
            expect(scope.hasMoreVisitDays).toBe(true);
        })

        it("should populate visit days with the day number after succesfully fetching the vist details for a day", function(){
            scope.visitSummary.mostRecentEncounterDateTime = new Date("2013-12-03");
            scope.visitSummary.visitStartDateTime = new Date("2013-12-01");
            spyOn(Bahmni.Opd.Consultation.VisitDay, 'create').andReturn({});
            
            setUpController();
            encounterSearchPromise.callSuccessCallBack([]);
            
            expect(scope.visitDays.length).toBe(1);
            expect(Bahmni.Opd.Consultation.VisitDay.create.mostRecentCall.args[0]).toBe(3); //day 3
        })
    });

    describe("loadEncountersForPreviousDay", function(){
        it("should load previous day visit details if fetching the current day visit details is completed",function(){
            scope.visitSummary.mostRecentEncounterDateTime = new Date("2013-12-03");
            scope.visitSummary.visitStartDateTime = new Date("2013-12-01");
            setUpController();
            encounterSearchPromise.callThenCallBack(); // Loading visit details for 2013-12-03 is completed
            
            scope.loadEncountersForPreviousDay();

            expect(encounterService.search.callCount).toBe(2);
            expect(encounterService.search.mostRecentCall.args[0]).toBe(visitUuid);
            expect(encounterService.search.mostRecentCall.args[1]).toBe("2013-12-02");
            expect(scope.hasMoreVisitDays).toBe(true);
        })

        it("should not load previous day visit details if fetching the current day visit details is is progress",function(){
            scope.visitSummary.mostRecentEncounterDateTime = new Date("2013-12-03");
            scope.visitSummary.visitStartDateTime = new Date("2013-12-01");
            setUpController();
            
            scope.loadEncountersForPreviousDay();
            scope.loadEncountersForPreviousDay();
            scope.loadEncountersForPreviousDay();

            expect(encounterService.search.callCount).toBe(1);
        })

        it("should not load visit details beyond visit start date",function(){
            scope.visitSummary.mostRecentEncounterDateTime = new Date("2013-12-03");
            scope.visitSummary.visitStartDateTime = new Date("2013-12-02");
            setUpController();
            encounterSearchPromise.callThenCallBack(); // Loading visit details for 2013-12-03 is completed
            
            scope.loadEncountersForPreviousDay();
            encounterSearchPromise.callThenCallBack(); // Loading visit details for 2013-12-02 is completed

            expect(scope.hasMoreVisitDays).toBe(false);
            
            scope.loadEncountersForPreviousDay();
            scope.loadEncountersForPreviousDay();
            expect(encounterService.search.callCount).toBe(2);
        })
    });
});
