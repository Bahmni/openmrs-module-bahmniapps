'use strict';

describe("AdtController", function () {
    var scope, state, rootScope, controller, bedService, appService, sessionService, dispositionService, visitService, encounterService, ngDialog, window, messagingService, spinnerService, translate;

    beforeEach(function () {
        module('bahmni.ipd');

        inject(function ($controller, $rootScope) {
            controller = $controller;
            rootScope = $rootScope;
            scope = $rootScope.$new();
            scope.patient = { uuid: "patientUuid" };
        });

        bedService = jasmine.createSpyObj('bedService', ['assignBed', 'getCompleteBedDetailsByBedId']);
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        sessionService = jasmine.createSpyObj('sessionService', ['getLoginLocationUuid']);
        dispositionService = jasmine.createSpyObj('dispositionService', ['getDispositionActions']);
        visitService = jasmine.createSpyObj('visitService', ['getVisitSummary','endVisit', 'endVisitAndCreateEncounter', 'search']);
        encounterService = jasmine.createSpyObj('encounterService', ['create', 'discharge', 'buildEncounter']);
        ngDialog = jasmine.createSpyObj('ngDialog', ['openConfirm', 'close']);
        messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
        spinnerService = jasmine.createSpyObj('spinnerService', ['forPromise']);
        state = jasmine.createSpyObj('state', ['transitionTo']);
        window = {location: { reload: jasmine.createSpy()} };
        translate = jasmine.createSpyObj('$translate', ['instant']);

        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function (key) {
                if (key === 'hideStartNewVisitPopUp') {
                    return true;
                } else if (key === 'defaultVisitType') {
                    return "IPD";
                } else  {
                    return {};
                }
            }, getExtensions: function (a, b) {
                return {
                    maxPatientsPerBed: 2
                };
            },
            getConfig: function () {
                return {value: "#/bedManagement/bed/{{bedId}}"};
            },
            formatUrl: function (url, options) {
                return "#/bedManagement/bed/12";
            }
        });

        rootScope.selectedBedInfo = {};
        rootScope.encounterConfig = {
            getVisitTypes: function () {
                return [{name : "Current Visit", uuid : "visitUuid2"}, {name : "IPD", uuid : "visitUuid"}];
            }, getAdmissionEncounterTypeUuid: function () {
                return "admitEncounterTypeUuid";

            }, getDischargeEncounterTypeUuid: function () {
                return "dischargeEncounterTypeUuid";

            }, getTransferEncounterTypeUuid: function () {
                return "transferEncounterTypeUuid";
            }
        };

        rootScope.selectedBedInfo.bed = {
            bedId: 9,
            bedNumber: "404-i",
            bedType: "normal bed",
            bedTags: [],
            status: "OCCUPIED"
        };
        var visitServicePromise = specUtil.createServicePromise('getVisitSummary');
        visitService.getVisitSummary.and.returnValue(visitServicePromise);
        var searchPromise = specUtil.createServicePromise('search');
        visitService.search.and.returnValue(searchPromise);
        dispositionService.getDispositionActions.and.returnValue({});
        sessionService.getLoginLocationUuid.and.returnValue("someLocationUuid");
        bedService.assignBed.and.returnValue(specUtil.createServicePromise("assignBed"));
    });

    var createController = function () {
        spinnerService.forPromise.and.callFake(function () {
            return {
                then: function () {
                    return {};
                }
            };
        });

        spyOn(scope, "$emit");

        controller('AdtController', {
            $scope: scope,
            $rootScope: rootScope,
            $state: state,
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
            spinner: spinnerService,
            $translate: translate,
        });
    };

    it("Should show confirmation dialog if patient's visit type is not defaultVisitType and hideStartNewVisitPopUp is not present", function () {
        scope.visitSummary = {"visitType": "OPD"};
        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function (key) {
                var configs = {hideStartNewVisitPopUp: false, dashboard: ''};
                return configs[key];
            }, getExtensions: function () {
                return {
                    maxPatientsPerBed: 2
                };
            },
            getConfig: function () {
            }
        });
        createController();

        scope.admit();
        expect(ngDialog.openConfirm.calls.count()).toBe(1);
        var args = ngDialog.openConfirm.calls.argsFor(0)[0];
        expect(args.scope).toBe(scope);
        expect(args.template).toBe('views/visitChangeConfirmation.html');
        expect(args.closeByEscape).toBe(true);
        expect(typeof args.preCloseCallback).toBe('function');
        args.preCloseCallback();
        expect(scope.buttonClicked).toBe(false);
    });

    it("Should show confirmation dialog if patient's visit type is not defaultVisitType and hideStartNewVisitPopUp is present", function () {
        scope.visitSummary = {"visitType": "OPD"};
        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function (key) {
                var configs = {hideStartNewVisitPopUp: true, dashboard: ''};
                return configs[key];
            }, getExtensions: function () {
                return {
                    maxPatientsPerBed: 2
                };
            },
            getConfig: function () {
            }
        });

        createController();

        scope.admit();
        expect(ngDialog.openConfirm.calls.count()).toBe(1);
        var args = ngDialog.openConfirm.calls.argsFor(0)[0];
        expect(args.scope).toBe(scope);
        expect(args.template).toBe('views/admitConfirmation.html');
        expect(args.closeByEscape).toBe(true);
        expect(args.className).toBe("ngdialog-theme-default ng-dialog-adt-popUp");
        expect(typeof args.preCloseCallback).toBe('function');
        args.preCloseCallback();
        expect(scope.buttonClicked).toBe(false);
    });

    it("should close the visit and create a new encounter if dialog is confirmed", function () {
        var visitSummary = {"visitType": "Current Visit", "uuid": "visitUuid", "stopDateTime": null};
        scope.patient = {uuid: "123"};
        scope.adtObservations = [];
        scope.visitSummary = {uuid: "visitUuid"};

        var stubPromise = function (data) {
            return {
                then: function (successFn) {
                    successFn({data: data});
                }
            };
        };
        visitService.getVisitSummary.and.returnValue(specUtil.createFakePromise(visitSummary));
        visitService.endVisitAndCreateEncounter.and.callFake(stubPromise);
        encounterService.buildEncounter.and.returnValue({encounterUuid: 'uuid'});
        createController();

        scope.closeCurrentVisitAndStartNewVisit();

        expect(encounterService.buildEncounter).toHaveBeenCalledWith({
            patientUuid: '123',
            encounterTypeUuid: 'admitEncounterTypeUuid',
            visitTypeUuid: 'visitUuid',
            observations: [],
            locationUuid: 'someLocationUuid'
        });
        expect(scope.visitSummary.visitType).toBe(visitSummary.visitType);
        expect(scope.visitSummary.uuid).toBe(visitSummary.uuid);
        expect(visitService.endVisitAndCreateEncounter).toHaveBeenCalledWith("visitUuid", {encounterUuid: 'uuid'});
        expect(ngDialog.close).toHaveBeenCalled();
    });

    it("Should close the confirmation dialog if cancelled", function () {
        scope.visitSummary = {"visitType": "IPD"};
        scope.patient = {uuid : '123'};
        encounterService.create.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({});
                }
            };
        });
        createController();

        scope.cancelConfirmationDialog();

        expect(ngDialog.close).toHaveBeenCalled();
    });

    it("Should create an encounter with in the current visit if continued", function () {
        scope.visitSummary = {"visitType": "Current Visit", "uuid": "visitUuid"};
        scope.patient = {uuid: "123"};
        scope.adtObservations = [];

        var stubTwoPromise = function (data) {
            return {
                then: function (successFn) {
                    successFn({results: data});
                }
            };
        };

        var encounterResponse = {
            patientUuid: '123',
            encounterTypeUuid: "admitEncounterTypeUuid",
            visitTypeUuid: "visitUuid",
            observations: [],
            locationUuid: 'someLocationUuid'
        };
        visitService.endVisit.and.callFake(stubTwoPromise);
        encounterService.create.and.returnValue(specUtil.simplePromise({data: encounterResponse}));
        createController();

        scope.continueWithCurrentVisit();

        expect(encounterService.create).toHaveBeenCalledWith(encounterResponse);
        expect(ngDialog.close).toHaveBeenCalled();
    });

    it("Should not create encounter with in the current visit if closed", function () {
        scope.visitSummary = {"visitType": "Current Visit", "uuid": "visitUuid"};
        scope.patient = {uuid: "123"};
        scope.adtObservations = [];

        var stubOnePromise = function (data) {
            return {
                then: function (successFn) {
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
                };
            },
            getConfig: function () {
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
        rootScope.selectedBedInfo.bed = undefined;

        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function () {
                return {dashboard : ''};
            }, getExtensions: function () {
                return {
                    maxPatientsPerBed: 2
                };
            },
            getConfig: function () {
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
                then: function (successFn) {
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

        var stubSearchPromise = function (data) {
            return {
                then: function (successFunction) {
                    var searchResponse = {
                        results: [{uuid: "visitUuid"}]
                    };
                    return successFunction({data: searchResponse});
                }
            };
        };
        visitService.endVisit.and.callFake(stubTwoPromise);
        encounterService.create.and.callFake(stubOnePromise);
        visitService.search.and.callFake(stubSearchPromise);

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
        var stubSearchPromise = function (data) {
            return {
                then: function (successFunction) {
                    var searchResponse = {
                        results: [{uuid: "visitUuid"}]
                    };
                    return successFunction({data: searchResponse});
                }
            };
        };
        visitService.search.and.callFake(stubSearchPromise);
        dispositionService.getDispositionActions.and.returnValue(response);
        encounterService.create.and.returnValue(specUtil.createServicePromise("create"));

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
                then: function (successFn) {
                    successFn({results: data});
                }
            };
        };
        var stubSearchPromise = function (data) {
            return {
                then: function (successFunction) {
                    var searchResponse = {
                        results: [{uuid: "visitUuid"}]
                    };
                    return successFunction({data: searchResponse});
                }
            };
        };
        visitService.search.and.callFake(stubSearchPromise);
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
                then: function (successFn) {
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
        var stubSearchPromise = function (data) {
            return {
                then: function (successFunction) {
                    var searchResponse = {
                        results: [{uuid: "visitUuid"}]
                    };
                    return successFunction({data: searchResponse});
                }
            };
        };
        visitService.search.and.callFake(stubSearchPromise);
        visitService.endVisit.and.callFake(stubTwoPromise);
        encounterService.create.and.callFake(stubOnePromise);

        createController();
        expect(scope.dispositionActions).toEqual([{"name": {"name": "Admit Patient", "uuid": "avb231rt"}}]);
    });

    it("Should throw an error message, when the bed is not selected and trying to transfer a patient", function () {
        rootScope.selectedBedInfo = {};
        createController();

        scope.transfer();
        expect(messagingService.showMessage).toHaveBeenCalledWith("error", "SELECT_BED_TO_TRANSFER_MESSAGE");
    });

    it("Should throw an error message, when source and destination beds are same while trying to transfer a patient", function () {
        rootScope.selectedBedInfo = {bed: {bedId: 10}};
        rootScope.bedDetails = {bedId: 10};
        createController();

        scope.transfer();
        expect(messagingService.showMessage).toHaveBeenCalledWith("error", "SELECT_BED_TO_TRANSFER_MESSAGE");
    });

    it("Should show confirmation dialog, when a bed is selected and trying to transfer a patient", function () {
        rootScope.bedDetails = {bedId: 9};
        rootScope.selectedBedInfo = {bed: {bedId: 10}};
        createController();

        scope.transfer();
        expect(ngDialog.openConfirm.calls.count()).toBe(1);
        var args = ngDialog.openConfirm.calls.argsFor(0)[0];
        expect(args.scope).toBe(scope);
        expect(args.template).toBe('views/transferConfirmation.html');
        expect(args.closeByEscape).toBe(true);
        expect(args.className).toBe("ngdialog-theme-default ng-dialog-adt-popUp");
        expect(typeof args.preCloseCallback).toBe('function');
        args.preCloseCallback()
        expect(scope.buttonClicked).toBe(false);
    });

    it("Should create an encounter of type Transfer and assign patient to new bed, On transferConfirmation when the selected bed is still available", function () {
        var bed = { bedId: 4, bedNumber: "402/1"};
        rootScope.selectedBedInfo = {bed : bed};
        bedService.getCompleteBedDetailsByBedId.and.returnValue(specUtil.simplePromise({data: {bed: bed, patients: []}}));

        scope.patient = {uuid: "123"};
        scope.adtObservations = [];
        var encounterCreateResponse = {data: {patientUuid: '123', encounterUuid: "encounterUuid"}};
        translate.instant.and.callFake(function (value) {
            if (value === 'BED') {
                return 'Bed';
            }
            if (value === 'IS_SUCCESSFULLY_ASSIGNED_MESSAGE') {
                return 'is assigned successfully';
            }
            return value;
        });
        encounterService.create.and.returnValue(specUtil.simplePromise(encounterCreateResponse));
        bedService.assignBed.and.returnValue(specUtil.simplePromise({data: {}}));

        createController();

        scope.transferConfirmation();

        var mappedEncounterData = {
            patientUuid: '123',
            encounterTypeUuid: "transferEncounterTypeUuid",
            visitTypeUuid: "visitUuid",
            observations: [],
            locationUuid: 'someLocationUuid'
        };

        expect(bedService.getCompleteBedDetailsByBedId).toHaveBeenCalledWith(rootScope.selectedBedInfo.bed.bedId);
        expect(encounterService.create).toHaveBeenCalledWith(mappedEncounterData);
        expect(bedService.assignBed).toHaveBeenCalledWith(rootScope.selectedBedInfo.bed.bedId, encounterCreateResponse.data.patientUuid, encounterCreateResponse.data.encounterUuid);
        expect(scope.$emit).toHaveBeenCalledWith("event:patientAssignedToBed", rootScope.selectedBedInfo.bed);
        expect(messagingService.showMessage).toHaveBeenCalledWith('info',  "Bed " + rootScope.selectedBedInfo.bed.bedNumber + " is assigned successfully");
        expect(ngDialog.close).toHaveBeenCalled();
    });

    it("should not transfer the patient when the selected bed is already assigned to some other patient", function () {
        var bed = { bedId: 4, "bedName": "402/1"};
        var roomName = "Room1";
        var wardUuid = "wardUuid";
        var wardName = "ward 1";
        rootScope.selectedBedInfo = {bed : bed, roomName: roomName, wardUuid: wardUuid, wardName: wardName};
        var patient = {id: 4, uuid: "someUuid", display: "IQ201 - someName", person: {display: "firstName lastName"}, identifiers: [{identifier: "IQ201"}]};
        bedService.getCompleteBedDetailsByBedId.and.returnValue(specUtil.simplePromise({data: {bed: bed, patients: [patient]}}));
        var stateParams = {
            patientUuid: scope.patient.uuid,
            context: { roomName: roomName, department: { uuid: wardUuid, name: wardName, roomName: roomName }}
        };
        translate.instant.and.returnValue("Please select an available bed. This bed is already assigned to IQ201");

        createController();

        scope.transferConfirmation();

        expect(bedService.getCompleteBedDetailsByBedId).toHaveBeenCalledWith(rootScope.selectedBedInfo.bed.bedId);
        expect(messagingService.showMessage).toHaveBeenCalledWith("error", "Please select an available bed. This bed is already assigned to " + patient.identifiers[0].identifier);
        expect(ngDialog.close).toHaveBeenCalled();
        expect(state.transitionTo).toHaveBeenCalledWith("bedManagement.patient", stateParams, {reload: true, inherit: false, notify: true});
    });

    it("Should throw an error message, when the bed is not selected and trying to discharge the patient", function () {
        rootScope.bedDetails = {};
        createController();

        scope.discharge();
        expect(messagingService.showMessage).toHaveBeenCalledWith("error", "SELECT_BED_TO_DISCHARGE_MESSAGE");
    });

    it("Should show confirmation dialog, when a bed is selected and trying to discharge the patient", function () {
        rootScope.bedDetails = {bedNumber: "202-a"};
        createController();
        var stubSearchPromise = function (data) {
            return {
                then: function (successFunction) {
                    var searchResponse = {
                        results: [{uuid: "visitUuid"}]
                    };
                    return successFunction({data: searchResponse});
                }
            };
        };
        visitService.search.and.callFake(stubSearchPromise);
        scope.discharge();
        expect(ngDialog.openConfirm.calls.count()).toBe(1);
        var args = ngDialog.openConfirm.calls.argsFor(0)[0];
        expect(args.scope).toBe(scope);
        expect(args.template).toBe('views/dischargeConfirmation.html');
        expect(args.closeByEscape).toBe(true);
        expect(args.className).toBe("ngdialog-theme-default ng-dialog-adt-popUp");
        expect(typeof args.preCloseCallback).toBe('function');
        args.preCloseCallback()
        expect(scope.buttonClicked).toBe(false);
    });

    it("Should create an encounter of type Discharge and discharge the patient from the bed, On dischargeConfirmation", function () {
        scope.patient = {uuid: "123"};
        scope.adtObservations = [];
        var encounterCreateResponse = {data: {patientUuid: '123', encounterUuid: "encounterUuid"}, encounterTypeUuid: "dischargeEncounterTypeUuid"};
        encounterService.discharge.and.returnValue(specUtil.simplePromise(encounterCreateResponse));
        visitService.endVisit.and.returnValue({
            then: function (successFn) {
                return;
            }
        });


        createController();

        scope.dischargeConfirmation();

        var mappedEncounterData = {
            patientUuid: '123',
            encounterTypeUuid: "dischargeEncounterTypeUuid",
            visitTypeUuid: undefined,
            observations: [],
            locationUuid: 'someLocationUuid'
        };
        expect(encounterService.discharge).toHaveBeenCalledWith(mappedEncounterData);
    });

    it("should not admit the patient when the bed has patient", function () {
        var bed = { bedId: 4, "bedName": "402/1"};
        rootScope.selectedBedInfo = {bed : bed};
        var roomName = "Room1";
        var wardUuid = "wardUuid";
        var wardName = "ward 1";
        rootScope.selectedBedInfo = {bed : bed, roomName: roomName, wardUuid: wardUuid, wardName: wardName};
        var stateParams = {
            patientUuid: scope.patient.uuid,
            context: { roomName: roomName, department: { uuid: wardUuid, name: wardName, roomName: roomName }}
        };
        var patient = {id: 4, uuid: "someUuid", display: "IQ201 - someName", person: {display: "firstName lastName"}, identifiers: [{identifier: "IQ201"}]};
        bedService.getCompleteBedDetailsByBedId.and.returnValue(specUtil.simplePromise({data: {bed: bed, patients: [patient]}}));
        translate.instant.and.returnValue("Please select an available bed. This bed is already assigned to IQ201");

        createController();

        scope.admitConfirmation();

        expect(bedService.getCompleteBedDetailsByBedId).toHaveBeenCalledWith(rootScope.selectedBedInfo.bed.bedId);
        expect(messagingService.showMessage).toHaveBeenCalledWith("error", "Please select an available bed. This bed is already assigned to " + patient.identifiers[0].identifier);
        expect(ngDialog.close).toHaveBeenCalled();
        expect(state.transitionTo).toHaveBeenCalledWith("bedManagement.patient", stateParams, {reload: true, inherit: false, notify: true});
    });

    it("should admit the patient in the same visit when the bed available and visit type is default visit type", function () {
        var bed = { bedId: 4, bedNumber: "402/1"};
        rootScope.selectedBedInfo = {bed : bed};
        bedService.getCompleteBedDetailsByBedId.and.returnValue(specUtil.simplePromise({data: {bed: bed, patients: []}}));
        bedService.assignBed.and.returnValue(specUtil.simplePromise({data: {}}));
        translate.instant.and.callFake(function (value) {
            if (value === 'BED') {
                return 'Bed';
            }
            if (value === 'IS_SUCCESSFULLY_ASSIGNED_MESSAGE') {
                return 'is assigned successfully';
            }
            return value;
        });

        scope.visitSummary = {"visitType": "IPD", "uuid": "visitUuid"};
        scope.patient = {uuid: "123"};
        scope.adtObservations = [];

        var stubTwoPromise = function(data) {
            return {
                then: function (successFn) {
                    successFn({results: data});
                }
            };
        };

        var encounterResponse = {
            patientUuid: 'patientUuid',
            encounterUuid: "encounterUuid",
            encounterTypeUuid: "admitEncounterTypeUuid",
            visitTypeUuid: "visitUuid",
            observations: [],
            locationUuid: 'someLocationUuid'
        };
        visitService.endVisit.and.callFake(stubTwoPromise);
        encounterService.create.and.returnValue(specUtil.simplePromise({data: encounterResponse}));

        createController();

        scope.admitConfirmation();

        expect(bedService.getCompleteBedDetailsByBedId).toHaveBeenCalledWith(rootScope.selectedBedInfo.bed.bedId);
        expect(encounterService.create).toHaveBeenCalled();
        expect(bedService.assignBed).toHaveBeenCalledWith(rootScope.selectedBedInfo.bed.bedId, "patientUuid", "encounterUuid");
        expect(scope.$emit).toHaveBeenCalledWith("event:patientAssignedToBed", rootScope.selectedBedInfo.bed);
        expect(messagingService.showMessage).toHaveBeenCalledWith('info', "Bed " + rootScope.selectedBedInfo.bed.bedNumber + " is assigned successfully");
        expect(ngDialog.close).toHaveBeenCalled();
    });

    it("should admit the patient and close the current visit and open a new Hospital visit when the bed available and the current visit not of Hospital visit ", function () {
        var bed = { bedId: 4, bedNumber: "402/1"};
        rootScope.selectedBedInfo = {bed : bed};
        bedService.getCompleteBedDetailsByBedId.and.returnValue(specUtil.simplePromise({data: {bed: bed, patients: []}}));
        bedService.assignBed.and.returnValue(specUtil.simplePromise({data: {}}));
        translate.instant.and.callFake(function (value) {
            if (value === 'BED') {
                return 'Bed';
            }
            if (value === 'IS_SUCCESSFULLY_ASSIGNED_MESSAGE') {
                return 'is assigned successfully';
            }
            return value;
        });

        scope.patient = {uuid: "123"};
        scope.adtObservations = [];

        var visitSummary = {"visitType": "Current Visit", "uuid": "visitUuid2", "stopDateTime": null};
        scope.visitSummary = {uuid: "visitUuid"};

        var stubPromise = function (data) {
            return {
                then: function (successFn) {
                    successFn({data: data});
                }
            };
        };

        visitService.getVisitSummary.and.returnValue(specUtil.createFakePromise(visitSummary));
        visitService.endVisitAndCreateEncounter.and.returnValue(specUtil.simplePromise({data: {patientUuid: "patientUuid", encounterUuid: "encounterUuid"}}));
        encounterService.buildEncounter.and.returnValue({encounterUuid: 'uuid'});

        createController();

        scope.admitConfirmation();

        expect(encounterService.buildEncounter).toHaveBeenCalledWith({
            patientUuid: '123',
            encounterTypeUuid: 'admitEncounterTypeUuid',
            visitTypeUuid: 'visitUuid',
            observations: [],
            locationUuid: 'someLocationUuid'
        });
        expect(bedService.getCompleteBedDetailsByBedId).toHaveBeenCalledWith(rootScope.selectedBedInfo.bed.bedId);
        expect(bedService.assignBed).toHaveBeenCalledWith(rootScope.selectedBedInfo.bed.bedId, "patientUuid", "encounterUuid");
        expect(scope.$emit).toHaveBeenCalledWith("event:patientAssignedToBed", rootScope.selectedBedInfo.bed);
        expect(messagingService.showMessage).toHaveBeenCalledWith('info', "Bed " + rootScope.selectedBedInfo.bed.bedNumber + " is assigned successfully");
        expect(scope.visitSummary.visitType).toBe(visitSummary.visitType);
        expect(scope.visitSummary.uuid).toBe(visitSummary.uuid);
        expect(visitService.endVisitAndCreateEncounter).toHaveBeenCalledWith("visitUuid", {encounterUuid: 'uuid'});
        expect(ngDialog.close).toHaveBeenCalled();
    });
});
