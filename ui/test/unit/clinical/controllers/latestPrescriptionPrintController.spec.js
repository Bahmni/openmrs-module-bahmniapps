'use strict';

describe("LatestPrescriptionPrintController", function () {

    beforeEach(module('bahmni.clinical'));

    var scope;
    var patientService;
    var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
    var controller;
    var rootScope;
    var messagingService, visitActionService;
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

    var loadController = function (visitActionServiceExpectation, messageServiceExpectation) {
        visitActionService = jasmine.createSpyObj('visitActionService', ['printPrescription']);
        visitActionService.printPrescription.and.callFake(visitActionServiceExpectation);

        messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
        messagingService.showMessage.and.callFake(messageServiceExpectation);

        controller('LatestPrescriptionPrintController', {
            $scope: scope,
            $rootScope: rootScope,
            messagingService: messagingService,
            spinner: spinner,
            visitActionsService: visitActionService
        });
    };

    describe("when loaded", function () {
        it("should print visit summary of latest visit", function () {
            scope.patient = {"uuid": "patientUuid"};
            scope.visitHistory = {
                activeVisit: {uuid: "latestVisitUuid", startDatetime: "someStartDate"}
            };

            var visitActionServiceExpectation = function (patient, startDate, visitUuid) {
                expect(patient.uuid).toBe("patientUuid");
                expect(startDate).toBe("someStartDate");
                expect(visitUuid).toBe("latestVisitUuid");
            };
            var messageServiceExpectation = function (type, message){
                expect(type).toBe("info");
                expect(message).toBe("CLOSE_TAB_MESSAGE");
            };

            loadController(visitActionServiceExpectation, messageServiceExpectation);

            expect(messagingService.showMessage).toHaveBeenCalled();
            expect(visitActionService.printPrescription).toHaveBeenCalled();

        });

        it("should show message when no active visit found", function () {
            scope.patient = {"uuid": "patientUuid"};
            scope.visitHistory = {};

            var messageServiceExpectation = function (type, message){
                expect(type).toBe("error");
                expect(message).toBe("NO_ACTIVE_VISIT_FOUND_MESSAGE");
            };

            loadController(null, messageServiceExpectation);

            expect(messagingService.showMessage).toHaveBeenCalled();
            expect(visitActionService.printPrescription).not.toHaveBeenCalled();
        });
    });
});
