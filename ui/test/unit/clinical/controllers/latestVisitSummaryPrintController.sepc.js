'use strict';

describe("LatestVisitSummaryPrintController", function(){

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

    var loadController = function(consultationInitialization, visitInitialization, expectations) {
        controller('LatestVisitSummaryPrintController', {
            $scope: scope,
            $rootScope: rootScope,
            $stateParams: stateParams,
            patientService: patientService,
            messagingService: jasmine.createSpyObj('messagingService', ['showMessage']),
            consultationInitialization: consultationInitialization,
            visitInitialization: visitInitialization,
            spinner: spinner,
            visitActionsService: {printVisitSummary: expectations},
        });
    }

    // Weird way to test. visitActionsService as a spy was not working.
    describe("when loaded", function(){
        it("should print visit summary of active visit", function() {
            var consultationInitialization = function(patientUuid) {
                rootScope.patient = {uuid: "patientUuid"};
                rootScope.visit = {uuid: "visitUuid", startDate: "2014-10-06"};
                return specUtil.respondWith({});
            };
            var visitInitialization = function () {};

            var expectations = function(patient, visit, startDate) {
                expect(patient.uuid).toBe("patientUuid");
                expect(visit.uuid).toBe("visitUuid");
                expect(startDate).toBe("2014-10-06");
            };

            loadController(consultationInitialization, visitInitialization, expectations);
        });

        it("should print visit summary of latest visit if active visit is not available", function() {
            var consultationInitialization = function(patientUuid) {
                rootScope.patient = {uuid: "patientUuid"};
                rootScope.visit = null;
                rootScope.visits = [{uuid: "latestVisitUuid"}];
                return specUtil.respondWith({});
            };

            var visitInitialization = function(patientUuid, visitUuid) {
                rootScope.visit = {uuid: "latestVisitUuid", startDate: "someStartDate"};
                return specUtil.respondWith({});
            };

            var expectations = function(patient, visit, startDate) {
                expect(patient.uuid).toBe("patientUuid");
                expect(visit.uuid).toBe("latestVisitUuid");
                expect(startDate).toBe("someStartDate");
            };

            loadController(consultationInitialization, visitInitialization, expectations);
        });
    });
});