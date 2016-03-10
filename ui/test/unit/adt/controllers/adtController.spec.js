'use strict';

describe("AdtController", function () {
    var bedService = jasmine.createSpyObj('bedService', ['assignBed', 'setBedDetailsForPatientOnRootScope']);
    var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
    var sessionService = jasmine.createSpyObj('sessionService', ['getLoginLocationUuid']);
    var dispositionService = jasmine.createSpyObj('dispositionService', ['getDispositionActions']);
    var visitService = jasmine.createSpyObj('visitService', ['getVisitSummary','endVisit']);
    var encounterService = jasmine.createSpyObj('encounterService', ['create']);
    var spinnerService = jasmine.createSpyObj('spinner', ['forPromise']);
    var scope, rootScope, controller;

    beforeEach(function () {
        module('bahmni.adt');

        inject(function ($controller, $rootScope) {
            controller = $controller;
            rootScope = $rootScope;
            scope = $rootScope.$new();
        });
        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function () {
                return "IPD";
            }, getExtensions: function (a, b) {
                return {
                    maxPatientsPerBed: 2
                }
            },
            getConfig: function(){

            }
        });

        rootScope.encounterConfig = {getVisitTypes:function(){
            return [];
        },getAdmissionEncounterTypeUuid : function(){

        },getDischargeEncounterTypeUuid: function(){

        },getTransferEncounterTypeUuid: function(){

        }
        };

        var visitServicePromise = specUtil.createServicePromise('getVisitSummary');
        visitService.getVisitSummary.and.returnValue(visitServicePromise);
        dispositionService.getDispositionActions.and.returnValue({});
        sessionService.getLoginLocationUuid.and.returnValue("someLocationUuid");
    });

    var createController = function () {
        spinnerService.forPromise.and.callFake(function () {
            return {
                then: function () {
                    return {};
                }
            }
        });

        controller('AdtController', {
            $scope: scope,
            $rootScope: rootScope,
            $stateParams: {patientUuid: "patientUuid", visitUuid: "visitUuid"},
            sessionService: sessionService,
            dispositionService: dispositionService,
            encounterService: encounterService,
            bedService: bedService,
            appService: appService,
            visitService: visitService
        });
    }

    it("Should show the confirm dialog if visit type is not IPD", function () {
        scope.visitSummary = {"visitType": "OPD"};
        spyOn(window, 'confirm');
        createController();
        scope.admit(null);
        expect(window.confirm).toHaveBeenCalledWith('Patient Visit Type is OPD, Do you want to close the Visit and start new IPD Visit?');
    });

    //it("should close the visit if dialog is confirmed and the visit type is not IPD",function(){
    //    scope.visitSummary = {"visitType": "OPD","uuid":"visitUuid"};
    //    scope.patient = {uuid:""}; //set because local method in the controller is using it
    //    scope.adtObservations = [];
    //    spyOn(window, 'confirm');
    //
    //    window.confirm.and.returnValue(true);
    //    var stubOnePromise = function (data) {
    //        return {
    //            success: function (successFn) {
    //                successFn({results: data});
    //            }
    //        };
    //    };
    //    encounterService.create.and.callFake(stubOnePromise);
    //
    //    scope.admit(null);
    //    expect(visitService.endVisit).toHaveBeenCalledWith("visitUuid");
    //
    //});

    it("should not close the visit if visit type is IPD", function(){
        scope.visitSummary = {"visitType": "IPD","uuid":"visitUuid"};
        scope.patient = {uuid:""}; //set because local method in the controller is using it
        scope.adtObservations = [];
        var stubOnePromise = function (data) {
            return {
                success: function (successFn) {
                    successFn({results: data});
                }
            };
        };
        encounterService.create.and.callFake(stubOnePromise);

        createController();
        scope.admit(null);
    });

    it("Should have Admit Patient action if the patient is discharged the visit has closed", function () {
        var visitSummary = {"visitType": "Current Visit", "uuid": "visitUuid", "stopDateTime":"1452764060000",
            "dischargeDetails": {uuid: "someDischargeUuid"},"admissionDetails":{"uuid":"someadmissionDetails"}};
        visitService.getVisitSummary.and.returnValue(specUtil.createFakePromise(visitSummary));

        scope.patient = {uuid: "123"};
        scope.adtObservations = [];
        var response = {"results":[{"answers":[{"name":{"name": "Undo Discharge", "uuid":"c2bc09b3"}},
            {"name":{"name": "Admit Patient", "uuid":"avb231rt"}},
            {"name":{"name": "Discharge Patient","uuid":"81cecc80"}},
            {"name":{"name": "Transfer Patient","uuid":"81d1cf4e"}}]}]};
        dispositionService.getDispositionActions.and.returnValue(response);
        var stubOnePromise = function (data) {
            return {
                success: function (successFn) {
                    successFn({results: data});
                }
            };
        };
        var stubTwoPromise = function(data) {
            return {
                then: function (successFn) {
                    successFn({results: data});
                }
            };
        };
        visitService.endVisit.and.callFake(stubTwoPromise);
        encounterService.create.and.callFake(stubOnePromise);

        createController();
        expect(scope.dispositionActions).toEqual([{"name":{"name": "Admit Patient","uuid": "avb231rt"}}]);
    });

    it("Should have Undo Discharge action if the patient is discharged and visit is open", function () {
        var visitSummary = {"visitType": "Current Visit", "uuid": "visitUuid", "stopDateTime":null,
            "dischargeDetails": {uuid: "someDischargeUuid"},"admissionDetails":{"uuid":"someadmissionDetails"}};
        visitService.getVisitSummary.and.returnValue(specUtil.createFakePromise(visitSummary));

        scope.patient = {uuid: "123"};
        scope.adtObservations = [];
        var response = {"results":[{"answers":[{"name":{"name": "Undo Discharge", "uuid":"c2bc09b3"}},
            {"name":{"name": "Admit Patient", "uuid":"avb231rt"}},
            {"name":{"name": "Discharge Patient","uuid":"81cecc80"}},
            {"name":{"name": "Transfer Patient","uuid":"81d1cf4e"}}]}]};
        dispositionService.getDispositionActions.and.returnValue(response);
        var stubOnePromise = function (data) {
            return {
                success: function (successFn) {
                    successFn({results: data});
                }
            };
        };

        encounterService.create.and.callFake(stubOnePromise);

        createController();
        expect(scope.dispositionActions).toEqual([{"name":{"name": "Undo Discharge", "uuid":"c2bc09b3"}}]);
    });

    it("Should have Discharge Patient and Transfer Patient action if the patient is admitted", function () {
        var visitSummary = {"visitType": "Current Visit", "uuid": "visitUuid", "stopDateTime":null,
            "admissionDetails":{"uuid":"someadmissionDetails"}};
        visitService.getVisitSummary.and.returnValue(specUtil.createFakePromise(visitSummary));

        scope.patient = {uuid: "123"};
        scope.adtObservations = [];
        var response = {"results":[{"answers":[{"name":{"name": "Undo Discharge", "uuid":"c2bc09b3"}},
            {"name":{"name": "Admit Patient", "uuid":"avb231rt"}},
            {"name":{"name": "Discharge Patient","uuid":"81cecc80"}},
            {"name":{"name": "Transfer Patient","uuid":"81d1cf4e"}}]}]};
        dispositionService.getDispositionActions.and.returnValue(response);
        var stubOnePromise = function (data) {
            return {
                success: function (successFn) {
                    successFn({results: data});
                }
            };
        };

        encounterService.create.and.callFake(stubOnePromise);

        createController();
        expect(scope.dispositionActions).toEqual([{"name": {"name": "Discharge Patient", "uuid": "81cecc80"}},
            {"name": {"name": "Transfer Patient", "uuid": "81d1cf4e"}}]);
    });

    it("Should have Admit Patient action if the patient is not admitted in given visit", function () {
        var visitSummary = {"visitType": "Current Visit", "uuid": "visitUuid", "stopDateTime":null};
        visitService.getVisitSummary.and.returnValue(specUtil.createFakePromise(visitSummary));

        scope.patient = {uuid: "123"};
        scope.adtObservations = [];
        var response = {"results":[{"answers":[{"name":{"name": "Undo Discharge", "uuid":"c2bc09b3"}},
            {"name":{"name": "Admit Patient", "uuid":"avb231rt"}},
            {"name":{"name": "Discharge Patient","uuid":"81cecc80"}},
            {"name":{"name": "Transfer Patient","uuid":"81d1cf4e"}}]}]};
        dispositionService.getDispositionActions.and.returnValue(response);
        var stubOnePromise = function (data) {
            return {
                success: function (successFn) {
                    successFn({results: data});
                }
            };
        };
        var stubTwoPromise = function(data) {
            return {
                then: function (successFn) {
                    successFn({results: data});
                }
            };
        };
        visitService.endVisit.and.callFake(stubTwoPromise);
        encounterService.create.and.callFake(stubOnePromise);

        createController();
        expect(scope.dispositionActions).toEqual([{"name":{"name": "Admit Patient","uuid": "avb231rt"}}]);
    });

});
