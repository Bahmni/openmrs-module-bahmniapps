describe("patientVisitHistoryService", function() {
	var rootScope;
	var patientVisitHistoryService;
	var visitService;

    beforeEach(module('bahmni.clinical'));

    beforeEach(module(function($provide){
		visitService = jasmine.createSpyObj('visitService', ['search']);;
        $provide.value('visitService', visitService);    	
    }));

    beforeEach(inject(function ($rootScope) {
        drugOrderPromise = specUtil.createServicePromise('visitSeacrh');
        visitService.search.andReturn(drugOrderPromise);
        rootScope = $rootScope
    }));


    beforeEach(inject(['patientVisitHistoryService', function (patientVisitHistoryServiceInjected) {
    	patientVisitHistoryService = patientVisitHistoryServiceInjected
    }]));

	describe("getVisits", function(){
		it("should fetch visits on the first call for a patient", function(){

			patientVisitHistoryService.getVisits("1234")

			expect(visitService.search).toHaveBeenCalled();
			expect(visitService.search.mostRecentCall.args[0].patient).toBe("1234");
		});
		
		it("should return cached visits on the second and subsequent calls for same patient", function(){
			var visits = [{uuid: "1-1-1"}, {uuid: '2-2-2'}];
			var visitSearchData = { results: visits };
			var vistHistoryReturnedByFirstCall;
			var vistHistoryReturnedBySecondCall;
			var vistHistoryReturnedByThirdCall;

			patientVisitHistoryService.getVisits("1234").then(function(data){ vistHistoryReturnedByFirstCall = data });
			drugOrderPromise.callSuccessCallBack(visitSearchData);
			patientVisitHistoryService.getVisits("1234").then(function(data){ vistHistoryReturnedBySecondCall = data });
			patientVisitHistoryService.getVisits("1234").then(function(data){ vistHistoryReturnedByThirdCall = data });
			rootScope.$digest();

			expect(visitService.search.callCount).toBe(1);
			expect(vistHistoryReturnedByFirstCall).toBe(visits);
			expect(vistHistoryReturnedBySecondCall).toBe(vistHistoryReturnedByFirstCall);
			expect(vistHistoryReturnedByThirdCall).toBe(vistHistoryReturnedByFirstCall);
		});
	});
});