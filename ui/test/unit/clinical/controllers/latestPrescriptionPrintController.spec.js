'use strict';

describe("LatestPrescriptionPrintController", function () {

    beforeEach(module('bahmni.clinical'));

    var scope;
    var patientService;
    var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
    var controller;
    var rootScope;
    var treatmentService, drugOrderPromise, messagingService, visitActionService;

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
        treatmentService = jasmine.createSpyObj('TreatmentService', ['getActiveDrugOrders']);
        drugOrderPromise = specUtil.createServicePromise('getActiveDrugOrders');
        treatmentService.getActiveDrugOrders.and.returnValue(drugOrderPromise);

        visitActionService = jasmine.createSpyObj('visitActionService', ['printPrescription']);
        visitActionService.printPrescription.and.callFake(visitActionServiceExpectation);

        messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
        messagingService.showMessage.and.callFake(messageServiceExpectation);

        controller('LatestPrescriptionPrintController', {
            $scope: scope,
            $rootScope: rootScope,
            messagingService: messagingService,
            TreatmentService: treatmentService,
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

            var visitActionServiceExpectation = function (patient, drugOrders, startDate) {
                expect(patient.uuid).toBe("patientUuid");
                expect(drugOrders.length).toBe(0);
                expect(startDate).toBe("someStartDate");
            };
            var messageServiceExpectation = function (type, message){
                expect(type).toBe("info");
                expect(message).toBe("Please close this tab.");
            };

            loadController(visitActionServiceExpectation, messageServiceExpectation);

            drugOrderPromise.callThenCallBack([]);
            expect(messagingService.showMessage).toHaveBeenCalled();
            expect(visitActionService.printPrescription).toHaveBeenCalled();

        });

        it("should show message when no active visit found", function () {
            scope.patient = {"uuid": "patientUuid"};
            scope.visitHistory = {};

            var messageServiceExpectation = function (type, message){
                expect(type).toBe("error");
                expect(message).toBe("No Active visit found for this patient.");
            };

            loadController(null, messageServiceExpectation);

            expect(messagingService.showMessage).toHaveBeenCalled();
            expect(visitActionService.printPrescription).not.toHaveBeenCalled();
        });
    });
});