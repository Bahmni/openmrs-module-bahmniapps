describe("patientVisitHistoryService", function() {
	var rootScope, patientVisitHistoryService, visitService, visits;

    beforeEach(module('bahmni.clinical'));

    beforeEach(module(function($provide){
		visitService = jasmine.createSpyObj('visitService', ['search']);;
        $provide.value('visitService', visitService);    	
    }));

    beforeEach(inject(function ($rootScope) {
        visits = specUtil.respondWith({data: Bahmni.Tests.OpenMRSVisit});
        visitService.search.and.returnValue(visits);
        rootScope = $rootScope;
    }));


    beforeEach(inject(['patientVisitHistoryService', function (patientVisitHistoryServiceInjected) {
    	patientVisitHistoryService = patientVisitHistoryServiceInjected
    }]));

	describe("getVisits", function(){
		it("should fetch visits for a patient", function(){
			patientVisitHistoryService.getVisitHistory("1234").then(function(result) {
                expect(visitService.search).toHaveBeenCalled();
                expect(visitService.search.calls.mostRecent().args[0].patient).toBe("1234");
                expect(result.visits.length).toBe(2);
            });
        });
	});
});