'use strict';

describe("LatestPrescriptionPrintController", function(){

    beforeEach(module('bahmni.clinical'));

    var scope;
    var patientService;
    var visitActionsService;
    var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
    var stateParams = {patientId: "GAN111111"};
    var controller;
    var rootScope;

    beforeEach(inject(function ($controller, $rootScope) {
        controller = $controller;
        rootScope = $rootScope;
        scope = $rootScope.$new();
        spinner.forPromise.and.callFake(function(param) {return {}});

        patientService = jasmine.createSpyObj('patientService', ['search']);

        patientService.search.and.callFake(function(param) {
            return specUtil.respondWith({data: {pageOfResults: [{uuid: "patientUuid"}]}});
        });
    }));

    var loadController = function(visitInitialization, expectations) {
        controller('LatestPrescriptionPrintController', {
            $scope: scope,
            $rootScope: rootScope,
            $stateParams: stateParams,
            messagingService: jasmine.createSpyObj('messagingService', ['showMessage']),
            visitInitialization: visitInitialization,
            spinner: spinner,
            visitActionsService: {printPrescription: expectations}
        });
    }

    // Weird way to test. visitActionsService as a spy was not working.
    describe("when loaded", function(){
        it("should print visit summary of active visit", function() {
            rootScope.patient = {uuid: "patientUuid"};
            rootScope.visit = {uuid: "visitUuid", startDate: "2014-10-06"};


            var expectations = function(patient, visit, startDate) {
                expect(patient.uuid).toBe("patientUuid");
                expect(visit.uuid).toBe("visitUuid");
                expect(startDate).toBe("2014-10-06");
            };

            loadController(null, expectations);
        });

        it("should print visit summary of latest visit if active visit is not available", function() {
            rootScope.patient = {uuid: "patientUuid"};
            rootScope.visit = null;
            rootScope.visits = [{uuid: "latestVisitUuid"}];

            var visitInitialization = function(patientUuid, visitUuid) {
                rootScope.visit = {uuid: "latestVisitUuid", startDate: "someStartDate"};
                return specUtil.respondWith({});
            };

            var expectations = function(patient, visit, startDate) {
                expect(patient.uuid).toBe("patientUuid");
                expect(visit.uuid).toBe("latestVisitUuid");
                expect(startDate).toBe("someStartDate");
            };

            loadController(visitInitialization, expectations);
        });
    });
});