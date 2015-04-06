'use strict';

describe("LatestPrescriptionPrintController", function () {

    beforeEach(module('bahmni.clinical'));

    var scope;
    var patientService;
    var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
    var controller;
    var rootScope;

    beforeEach(inject(function ($controller, $rootScope) {
        controller = $controller;
        rootScope = $rootScope;
        scope = $rootScope.$new();
        spinner.forPromise.and.callFake(function (param) {
            return {}
        });

        patientService = jasmine.createSpyObj('patientService', ['search']);

        patientService.search.and.callFake(function (param) {
            return specUtil.respondWith({
                data: {
                    pageOfResults: [
                        {uuid: "patientUuid"}
                    ]
                }
            });
        });
    }));

    var loadController = function (visitInitialization, expectations) {
        controller('LatestPrescriptionPrintController', {
            $scope: scope,
            $rootScope: rootScope,
            messagingService: jasmine.createSpyObj('messagingService', ['showMessage']),
            visitInitialization: visitInitialization,
            spinner: spinner,
            visitActionsService: {printPrescription: expectations}
        });
    };

    describe("when loaded", function () {
        it("should print visit summary of latest visit", function () {
            scope.patient = {"uuid": "patientUuid"};
            scope.visit = null;
            scope.visitHistory = {
                activeVisit: {uuid: "latestVisitUuid"}
            };

            var visitInitialization = function () {
                return specUtil.respondWith({uuid: "latestVisitUuid", startDate: "someStartDate"});
            };

            var expectations = function (patient, visit, startDate) {
                expect(patient.uuid).toBe("patientUuid");
                expect(visit.uuid).toBe("latestVisitUuid");
                expect(startDate).toBe("someStartDate");
            };

            loadController(visitInitialization, expectations);
        });

        it("should show message when no active visit found", function () {
            scope.patient = {"uuid": "patientUuid"};
            scope.visit = null;
            scope.visitHistory = {};

            var expectations = function () {
                expect(messagingService.showMessage).toHaveBeenCalled();
            };

            loadController(null, expectations);
        });
    });
});