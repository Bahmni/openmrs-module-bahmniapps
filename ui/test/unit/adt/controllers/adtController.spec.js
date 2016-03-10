'use strict';

describe("AdtController", function () {
    var scope, rootScope, controller, bedService, appService, sessionService, dispositionService, visitService, encounterService, ngDialog, window, messagingService;

    beforeEach(function () {
        module('bahmni.adt');

        inject(function ($controller, $rootScope) {
            controller = $controller;
            rootScope = $rootScope;
            scope = $rootScope.$new();
        });

        bedService = jasmine.createSpyObj('bedService', ['assignBed', 'setBedDetailsForPatientOnRootScope']);
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        sessionService = jasmine.createSpyObj('sessionService', ['getLoginLocationUuid']);
        dispositionService = jasmine.createSpyObj('dispositionService', ['getDispositionActions']);
        visitService = jasmine.createSpyObj('visitService', ['getVisitSummary','endVisit']);
        encounterService = jasmine.createSpyObj('encounterService', ['create']);
        ngDialog = jasmine.createSpyObj('ngDialog', ['openConfirm', 'close']);
        messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
        window = {};

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

        rootScope.encounterConfig = {
            getVisitTypes: function () {
                return [{name : "Current Visit", uuid : "visitUuid"}, {name : "IPD", uuid : "visitUuid"}];
            }, getAdmissionEncounterTypeUuid: function () {

            }, getDischargeEncounterTypeUuid: function () {

            }, getTransferEncounterTypeUuid: function () {

            }
        };

        var visitServicePromise = specUtil.createServicePromise('getVisitSummary');
        visitService.getVisitSummary.and.returnValue(visitServicePromise);
        dispositionService.getDispositionActions.and.returnValue({});
        sessionService.getLoginLocationUuid.and.returnValue("someLocationUuid");
    });

    var createController = function() {
        controller('AdtController', {
            $scope: scope,
            $rootScope: rootScope,
            $stateParams: {patientUuid: "patientUuid", visitUuid: "visitUuid"},
            sessionService: sessionService,
            dispositionService: dispositionService,
            encounterService: encounterService,
            bedService: bedService,
            appService: appService,
            visitService: visitService,
            ngDialog: ngDialog,
            $window: window,
            messagingService : messagingService
        });
    };

    it("Should show confirmation dialog if patient's visit type is not defaultVisitType", function () {
        scope.visitSummary = {"visitType": "OPD"};
        createController();

        scope.admit();
        expect(ngDialog.openConfirm).toHaveBeenCalled();
        expect(ngDialog.openConfirm).toHaveBeenCalledWith({template: 'views/visitChangeConfirmation.html', scope: scope, closeByEscape: true});
    });

    it("Should not show confirmation dialog if patient's visit type is defaultVisitType", function () {

        scope.visitSummary = {"visitType": "IPD"};
        scope.patient = {uuid : '123'};
        encounterService.create.and.callFake(function () {
            return {
                success: function (callback) {
                    return callback({});
                }
            }
        });
        createController();

        scope.admit();

        expect(ngDialog.openConfirm).not.toHaveBeenCalled();
    });
    it("should close the visit and create a new encounter if dialog is confirmed", function () {
        scope.visitSummary = {"visitType": "Current Visit", "uuid": "visitUuid"};
        scope.patient = {uuid: "123"};
        scope.adtObservations = [];

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

        scope.closeCurrentVisitAndStartNewVisit();

        expect(visitService.endVisit).toHaveBeenCalledWith("visitUuid");
        expect(encounterService.create).toHaveBeenCalledWith({
            patientUuid: '123',
            encounterTypeUuid: undefined,
            visitTypeUuid: 'visitUuid',
            observations: [],
            locationUuid: 'someLocationUuid'
        });
        expect(ngDialog.close).toHaveBeenCalled();
    });

    it("Should close the confirmation dialog if cancelled", function () {
        scope.visitSummary = {"visitType": "IPD"};
        scope.patient = {uuid : '123'};
        encounterService.create.and.callFake(function () {
            return {
                success: function (callback) {
                    return callback({});
                }
            }
        });
        createController();

        scope.cancelConfirmationDialog();

        expect(ngDialog.close).toHaveBeenCalled();
    });

    it("Should create an encounter with in the current visit if continued", function () {
        scope.visitSummary = {"visitType": "Current Visit", "uuid": "visitUuid"};
        scope.patient = {uuid: "123"};
        scope.adtObservations = [];

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

        scope.continueWithCurrentVisit();

        expect(encounterService.create).toHaveBeenCalledWith({
            patientUuid: '123',
            encounterTypeUuid: undefined,
            visitTypeUuid: "visitUuid",
            observations: [],
            locationUuid: 'someLocationUuid'
        });
        expect(ngDialog.close).toHaveBeenCalled();
    });

    it("Should not create encounter with in the current visit if closed", function () {
        scope.visitSummary = {"visitType": "Current Visit", "uuid": "visitUuid"};
        scope.patient = {uuid: "123"};
        scope.adtObservations = [];

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

        expect(encounterService.create).not.toHaveBeenCalledWith({
            patientUuid: '123',
            encounterTypeUuid: undefined,
            visitTypeUuid: "visitUuid",
            observations: [],
            locationUuid: 'someLocationUuid'
        });
        expect(ngDialog.close).not.toHaveBeenCalled();
    });

    it("should show an error message and not close the current visit when defaultVisitType is not configured and yet the user decides to close the current visit and create a new visit of type defaultVisitType", function () {
        scope.visitSummary = {"visitType": "Current Visit", "uuid": "visitUuid"};
        scope.patient = {uuid: "123"};
        scope.adtObservations = [];

        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function () {
                return {dashboard : ''};
            }, getExtensions: function () {
                return {
                    maxPatientsPerBed: 2
                }
            },
            getConfig: function(){
            }
        });

        createController();

        scope.closeCurrentVisitAndStartNewVisit();

        expect(messagingService.showMessage).toHaveBeenCalled();
        expect(visitService.endVisit).not.toHaveBeenCalled();
        expect(ngDialog.close).toHaveBeenCalled();
    });

    it("should show an error message when defaultVisitType is not configured and patient doesn't have any visit open while admitting", function () {
        scope.visitSummary = null;
        scope.patient = {uuid: "123"};
        scope.adtObservations = [];

        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function () {
                return {dashboard : ''};
            }, getExtensions: function () {
                return {
                    maxPatientsPerBed: 2
                }
            },
            getConfig: function(){
            }
        });

        createController();

        scope.admit();

        expect(messagingService.showMessage).toHaveBeenCalled();
        expect(encounterService.create).not.toHaveBeenCalled();
    });
});
