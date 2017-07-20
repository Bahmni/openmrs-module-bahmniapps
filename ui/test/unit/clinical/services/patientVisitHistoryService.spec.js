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
		it("should fetch visits for a patient", function(done){
			patientVisitHistoryService.getVisitHistory("1234", "visitLocationUuid").then(function(result) {
                expect(visitService.search).toHaveBeenCalled();
                expect(visitService.search.calls.mostRecent().args[0].patient).toBe("1234");
                expect(result.visits.length).toBe(2);
                expect(result.activeVisit.uuid).toBe("eb396098-c11c-4276-971a-4c3d1137ac7e");
                done();
            });
        });
	});
});