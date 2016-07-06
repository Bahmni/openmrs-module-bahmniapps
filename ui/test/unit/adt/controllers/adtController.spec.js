'use strict';

describe("AdtController", function () {
    var scope, rootScope, controller, bedService, appService, sessionService, dispositionService, visitService, encounterService, ngDialog, window, messagingService, spinnerService;

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
        visitService = jasmine.createSpyObj('visitService', ['getVisitSummary','endVisit', 'endVisitAndCreateEncounter']);
        encounterService = jasmine.createSpyObj('encounterService', ['create', 'discharge', 'buildEncounter']);
        ngDialog = jasmine.createSpyObj('ngDialog', ['openConfirm', 'close']);
        messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
        spinnerService = jasmine.createSpyObj('spinnerService', ['forPromise']);
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
            visitService: visitService,
            ngDialog: ngDialog,
            $window: window,
            messagingService : messagingService,
            spinner: spinnerService
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

        var stubPromise = function (data) {
            return {
                success: function (successFn) {
                    successFn({results: data});
                }
            };
        };
        visitService.endVisitAndCreateEncounter.and.callFake(stubPromise);
        encounterService.buildEncounter.and.returnValue({encounterUuid: 'uuid'});
        createController();

        scope.closeCurrentVisitAndStartNewVisit();

        expect(encounterService.buildEncounter).toHaveBeenCalledWith({
            patientUuid: '123',
            encounterTypeUuid: undefined,
            visitTypeUuid: 'visitUuid',
            observations: [],
            locationUuid: 'someLocationUuid'
        });
        expect(visitService.endVisitAndCreateEncounter).toHaveBeenCalledWith("visitUuid", {encounterUuid: 'uuid'});
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

    it("Should have Admit Patient action if the patient is discharged the visit has closed", function () {
        var visitSummary = {
            "visitType": "Current Visit", "uuid": "visitUuid", "stopDateTime": "1452764060000",
            "dischargeDetails": {uuid: "someDischargeUuid"}, "admissionDetails": {"uuid": "someadmissionDetails"}
        };
        visitService.getVisitSummary.and.returnValue(specUtil.createFakePromise(visitSummary));

        scope.patient = {uuid: "123"};
        scope.adtObservations = [];
        var response = {
            "results": [{
                "answers": [{"name": {"name": "Undo Discharge", "uuid": "c2bc09b3"}},
                    {"name": {"name": "Admit Patient", "uuid": "avb231rt"}},
                    {"name": {"name": "Discharge Patient", "uuid": "81cecc80"}},
                    {"name": {"name": "Transfer Patient", "uuid": "81d1cf4e"}}]
            }]
        };
        dispositionService.getDispositionActions.and.returnValue(response);
        var stubOnePromise = function (data) {
            return {
                success: function (successFn) {
                    successFn({results: data});
                }
            };
        };
        var stubTwoPromise = function (data) {
            return {
                then: function (successFn) {
                    successFn({results: data});
                }
            };
        };
        visitService.endVisit.and.callFake(stubTwoPromise);
        encounterService.create.and.callFake(stubOnePromise);

        createController();
        expect(scope.dispositionActions).toEqual([{"name": {"name": "Admit Patient", "uuid": "avb231rt"}}]);
    });

    it("Should have Undo Discharge action if the patient is discharged and visit is open", function () {
        var visitSummary = {
            "visitType": "Current Visit", "uuid": "visitUuid", "stopDateTime": null,
            "dischargeDetails": {uuid: "someDischargeUuid"}, "admissionDetails": {"uuid": "someadmissionDetails"}
        };
        visitService.getVisitSummary.and.returnValue(specUtil.createFakePromise(visitSummary));

        scope.patient = {uuid: "123"};
        scope.adtObservations = [];
        var response = {
            "results": [{
                "answers": [{"name": {"name": "Undo Discharge", "uuid": "c2bc09b3"}},
                    {"name": {"name": "Admit Patient", "uuid": "avb231rt"}},
                    {"name": {"name": "Discharge Patient", "uuid": "81cecc80"}},
                    {"name": {"name": "Transfer Patient", "uuid": "81d1cf4e"}}]
            }]
        };
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
        scope.continueWithCurrentVisit();
        expect(scope.dispositionActions).toEqual([{"name": {"name": "Undo Discharge", "uuid": "c2bc09b3"}}]);
    });

    it("Should have Discharge Patient and Transfer Patient action if the patient is admitted", function () {
        var visitSummary = {
            "visitType": "Current Visit", "uuid": "visitUuid", "stopDateTime": null,
            "admissionDetails": {"uuid": "someadmissionDetails"}
        };
        visitService.getVisitSummary.and.returnValue(specUtil.createFakePromise(visitSummary));

        scope.patient = {uuid: "123"};
        scope.adtObservations = [];
        var response = {
            "results": [{
                "answers": [{"name": {"name": "Undo Discharge", "uuid": "c2bc09b3"}},
                    {"name": {"name": "Admit Patient", "uuid": "avb231rt"}},
                    {"name": {"name": "Discharge Patient", "uuid": "81cecc80"}},
                    {"name": {"name": "Transfer Patient", "uuid": "81d1cf4e"}}]
            }]
        };
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
        var visitSummary = {"visitType": "Current Visit", "uuid": "visitUuid", "stopDateTime": null};
        visitService.getVisitSummary.and.returnValue(specUtil.createFakePromise(visitSummary));

        scope.patient = {uuid: "123"};
        scope.adtObservations = [];
        var response = {
            "results": [{
                "answers": [{"name": {"name": "Undo Discharge", "uuid": "c2bc09b3"}},
                    {"name": {"name": "Admit Patient", "uuid": "avb231rt"}},
                    {"name": {"name": "Discharge Patient", "uuid": "81cecc80"}},
                    {"name": {"name": "Transfer Patient", "uuid": "81d1cf4e"}}]
            }]
        };
        dispositionService.getDispositionActions.and.returnValue(response);
        var stubOnePromise = function (data) {
            return {
                success: function (successFn) {
                    successFn({results: data});
                }
            };
        };
        var stubTwoPromise = function (data) {
            return {
                then: function (successFn) {
                    successFn({results: data});
                }
            };
        };
        visitService.endVisit.and.callFake(stubTwoPromise);
        encounterService.create.and.callFake(stubOnePromise);

        createController();
        expect(scope.dispositionActions).toEqual([{"name": {"name": "Admit Patient", "uuid": "avb231rt"}}]);
    });

    describe('Discharge', function () {
        it('should discharge patient', function () {
            scope.patient = {uuid: "patient Uuid"};
            encounterService.discharge.and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback({data: {}})
                    }
                }
            });
            createController();

            scope.discharge();
        })
    });
});
