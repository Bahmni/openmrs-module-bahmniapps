'use strict';

describe("VisitControllerTest", function () {
    var patientVisitHistoryService;
    var visitHistoryPromise;
    var urlHelper;
    var location;
    var scope;
    var patientConsultationUrl = "/patient/abc/consultation";
    var visitUrl = "/visit/123";

    beforeEach(module('opd.consultation.controllers'));

    beforeEach(inject(function ($rootScope, $location) {
        patientVisitHistoryService = jasmine.createSpyObj('patientVisitHistoryService', ['getVisits']);
        visitHistoryPromise = specUtil.createServicePromise('visitHistory');
        patientVisitHistoryService.getVisits.andReturn(visitHistoryPromise);
        urlHelper = jasmine.createSpyObj('urlHelper', ['getVisitUrl', 'getConsultationUrl']);
        scope = $rootScope.$new();
        $rootScope.patient = {};
        location = $location
    }));

    var setUpController = function () {
        inject(function ($controller) {
            $controller('VisitRedirectionController', {
                $scope: scope,
                urlHelper: urlHelper,
                patientVisitHistoryService: patientVisitHistoryService
            });
        });
    };


    describe("on initialization", function(){
        beforeEach(function(){
            setUpController();
            spyOn(location, 'path').andReturn(location);
            spyOn(location, 'replace').andReturn(location);
            urlHelper.getConsultationUrl.andReturn(patientConsultationUrl)
            urlHelper.getVisitUrl.andReturn(visitUrl)
        });

        it("should go to consultation page on first visit", function(){
            var visits = [];
            
            visitHistoryPromise.callThenCallBack(visits);

            expect(location.path).toHaveBeenCalledWith(patientConsultationUrl);
        });        

        it("should go to consultation page when there is only one visit and has no encounter", function(){
            var visits = [{encounters: []}];
            
            visitHistoryPromise.callThenCallBack(visits);

            expect(location.path).toHaveBeenCalledWith(patientConsultationUrl);
        });        

        it("should go to visit's page when there only one visit and has an encounter", function(){
            var visits = [{uuid: '1-1-1', encounters: [{}]}];
            
            visitHistoryPromise.callThenCallBack(visits);

            expect(location.path).toHaveBeenCalledWith(visitUrl);
            expect(urlHelper.getVisitUrl).toHaveBeenCalledWith('1-1-1');
        });        

        it("should go to most recent visit's page when there more than one visit and has an encounter", function(){
            var visits = [{uuid: '1-1-1', encounters: [{}]}, {uuid: '2-2-2', encounters: [{}]}];
            
            visitHistoryPromise.callThenCallBack(visits);

            expect(location.path).toHaveBeenCalledWith(visitUrl);
            expect(urlHelper.getVisitUrl).toHaveBeenCalledWith('1-1-1');
        });        

        it("should go to most recent visit's page when there more than one visit", function(){
            var visits = [{uuid: '1-1-1', encounters: []}, {uuid: '2-2-2', encounters: []}];
            
            visitHistoryPromise.callThenCallBack(visits);

            expect(location.path).toHaveBeenCalledWith(visitUrl);
            expect(urlHelper.getVisitUrl).toHaveBeenCalledWith('1-1-1');
        });        
    });
});
