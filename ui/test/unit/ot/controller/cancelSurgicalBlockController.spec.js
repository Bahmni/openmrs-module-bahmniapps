'use strict';

describe("cancelSurgicalBlockController", function () {
    var scope, controller, translate;
    var spinner = jasmine.createSpyObj('spinner', ['forPromise', 'then', 'catch']);
    var surgicalAppointmentService = jasmine.createSpyObj('surgicalAppointmentService', ['saveSurgicalBlock', 'getSurgicalBlocksInDateRange', 'updateSurgicalBlock']);
    var state = jasmine.createSpyObj('state', ['go']);
    var ngDialog = jasmine.createSpyObj('ngDialog', ['open', 'close']);
    var messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
    translate = jasmine.createSpyObj('$translate', ['instant']);

    var surgicalBlocks = [
        {
            id: 60,
            provider: {uuid: "providerUuid1", display: "Doctor Strange"},
            location: {uuid: "uuid1", name: "location1"},
            surgicalAppointments: [ {id: 48, surgicalAppointmentAttributes: []}],
            startDatetime: "2001-10-04T09:00:00.000+0530",
            endDatetime: "2001-10-04T21:00:00.000+0530",
            uuid: "surgical-block1-uuid"
        },
        {
            id: 61,
            provider: {uuid: "providerUuid2", display: "Doctor Malhotra"},
            location: {uuid: "uuid2", name: "location2"},
            surgicalAppointments: [],
            startDatetime: "2001-10-04T09:00:00.000+0530",
            endDatetime: "2001-10-04T21:00:00.000+0530"
        }
    ];

    surgicalAppointmentService.getSurgicalBlocksInDateRange.and.callFake(function () {
        return {data: {results: surgicalBlocks}};
    });

    beforeEach(function () {
        module('bahmni.ot');
        inject(function ($controller, $rootScope) {
            controller = $controller;
            scope = $rootScope.$new();
        });
    });

    var createController = function () {
        controller('cancelSurgicalBlockController', {
            $scope: scope,
            $state: state,
            $translate: translate,
            ngDialog: ngDialog,
            surgicalAppointmentService: surgicalAppointmentService,
            messagingService: messagingService
        });
    };

    it("should save status with cancelled when user cancelled a surgical block", function () {
        surgicalAppointmentService.updateSurgicalBlock.and.returnValue(specUtil.simplePromise({data:{provider: {person: { display:"something"}}}}));
        messagingService.showMessage.and.returnValue({});
        translate.instant.and.returnValue('Cancelled surgeries for Surgeon Dr.');
        scope.ngDialogData = {surgicalBlock: {id:32, uuid: "blockUuid", surgicalAppointments: [{id:32,uuid:"appointmentUuid", bedNumber: "202", "bedLocation": "RC", status:"POSTPONED", notes: "Patient not available", patient: {uuid:1}}, {id:33, status: "SCHEDULED", bedNumber: "204", "bedLocation": "RC", patient: {uuid:2}}], provider: {uuid: 1}, location: {uuid:2}, status: "CANCELLED"}};
        scope.surgicalBlockSelected = {provider: {person: {display: "something"}}};
        scope.surgicalBlock = {status: "CANCELLED", notes: "Cancelled as Surgeon on leave"};
        createController();
        scope.confirmCancelSurgicalBlock();
        expect(messagingService.showMessage).toHaveBeenCalledWith('info', 'Cancelled surgeries for Surgeon Dr.something' );
        expect(surgicalAppointmentService.updateSurgicalBlock).toHaveBeenCalled();
        expect(translate.instant).toHaveBeenCalledWith("OT_SURGICAL_BLOCK_CANCELLED_MESSAGE");
        expect(ngDialog.close).toHaveBeenCalled();
        expect(state.go).toHaveBeenCalledWith("otScheduling", jasmine.any(Object));
        expect(scope.ngDialogData.surgicalBlock.surgicalAppointments[0].status).toEqual("POSTPONED");
        expect(scope.ngDialogData.surgicalBlock.surgicalAppointments[0].notes).toEqual("Patient not available");
        expect(scope.ngDialogData.surgicalBlock.surgicalAppointments[1].status).toEqual("CANCELLED");
        expect(scope.ngDialogData.surgicalBlock.surgicalAppointments[1].notes).toEqual("Cancelled as Surgeon on leave");
        expect(scope.ngDialogData.surgicalBlock.voidReason).toEqual("Cancelled as Surgeon on leave");
        expect(scope.ngDialogData.surgicalBlock.voided).toBeTruthy();
    });

    it("should save status with postponed when user postponed a surgical block", function () {
        surgicalAppointmentService.updateSurgicalBlock.and.returnValue(specUtil.simplePromise({data:{provider: {person: { display:"something"}}}}));
        messagingService.showMessage.and.returnValue({});
        translate.instant.and.returnValue('Postponed surgeries for Surgeon Dr.');
        scope.ngDialogData = {surgicalBlock: {id:32, surgicalAppointments: [{id:32, status:"CANCELLED", notes: "Patient not available", patient: {uuid:1}}, {id:33, status: "SCHEDULED", patient: {uuid:2}}], provider: {uuid: 1}, location: {uuid:2}, status: "CANCELLED"}};
        scope.surgicalBlockSelected = {provider: {person: {display: "something"}}};
        scope.surgicalBlock = {status: "POSTPONED", notes: "Postponed as previous surgery extended"};
        createController();
        scope.confirmCancelSurgicalBlock();
        expect(messagingService.showMessage).toHaveBeenCalledWith('info', 'Postponed surgeries for Surgeon Dr.something' );
        expect(surgicalAppointmentService.updateSurgicalBlock).toHaveBeenCalled();
        expect(translate.instant).toHaveBeenCalledWith("OT_SURGICAL_BLOCK_POSTPONED_MESSAGE");
        expect(ngDialog.close).toHaveBeenCalled();
        expect(state.go).toHaveBeenCalledWith("otScheduling", jasmine.any(Object));
        expect(scope.ngDialogData.surgicalBlock.surgicalAppointments[0].status).toEqual("CANCELLED");
        expect(scope.ngDialogData.surgicalBlock.surgicalAppointments[0].notes).toEqual("Patient not available");
        expect(scope.ngDialogData.surgicalBlock.surgicalAppointments[1].status).toEqual("POSTPONED");
        expect(scope.ngDialogData.surgicalBlock.surgicalAppointments[1].notes).toEqual("Postponed as previous surgery extended");
        expect(scope.ngDialogData.surgicalBlock.voidReason).toEqual("Postponed as previous surgery extended");
        expect(scope.ngDialogData.surgicalBlock.voided).toBeTruthy();
    });

});
