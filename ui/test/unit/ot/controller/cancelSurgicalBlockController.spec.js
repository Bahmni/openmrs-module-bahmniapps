'use strict';

describe("cancelSurgicalBlockController", function () {
    var scope, controller, translate;
    var spinner = jasmine.createSpyObj('spinner', ['forPromise', 'then', 'catch']);
    var surgicalAppointmentService = jasmine.createSpyObj('surgicalAppointmentService', ['saveSurgicalBlock', 'getSurgicalBlocksInDateRange']);
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
        surgicalAppointmentService.saveSurgicalBlock.and.returnValue(specUtil.simplePromise({data:{provider: {person: { display:"something"}}}}));
        messagingService.showMessage.and.returnValue({});
        translate.instant.and.returnValue('Cancelled surgeries for Surgeon Dr.');
        scope.ngDialogData = {surgicalBlock: {id:32, surgicalAppointments: [{id:32,status:"COMPLETED", patient: {uuid:1}}, {id:33, patient: {uuid:2}}], provider: {uuid: 1}, location: {uuid:2}, status: "CANCELLED"}};
        scope.surgicalBlockSelected = {provider: {person: {display: "something"}}};
        scope.surgicalBlock = {status: "CANCELLED"};
        createController();
        scope.confirmCancelSurgicalBlock();
        expect(messagingService.showMessage).toHaveBeenCalledWith('info', 'Cancelled surgeries for Surgeon Dr.something' );
        expect(translate.instant).toHaveBeenCalledWith("OT_SURGICAL_BLOCK_CANCELLED_MESSAGE")
        expect(ngDialog.close).toHaveBeenCalled();
        expect(state.go).toHaveBeenCalled();
    });

    it("should save status with postponed when user postponed a surgical block", function () {
        surgicalAppointmentService.saveSurgicalBlock.and.returnValue(specUtil.simplePromise({data:{provider: {person: { display:"something"}}}}));
        messagingService.showMessage.and.returnValue({});
        translate.instant.and.returnValue('Postponed surgeries for Surgeon Dr.');
        scope.ngDialogData = {surgicalBlock: {id:32, surgicalAppointments: [{id:32,status:"COMPLETED", patient: {uuid:1}}, {id:33, patient: {uuid:2}}], provider: {uuid: 1}, location: {uuid:2}, status: "CANCELLED"}};
        scope.surgicalBlockSelected = {provider: {person: {display: "something"}}};
        scope.surgicalBlock = {status: "POSTPONED"};
        createController();
        scope.confirmCancelSurgicalBlock();
        expect(messagingService.showMessage).toHaveBeenCalledWith('info', 'Postponed surgeries for Surgeon Dr.something' );
        expect(translate.instant).toHaveBeenCalledWith("OT_SURGICAL_BLOCK_POSTPONED_MESSAGE")
        expect(ngDialog.close).toHaveBeenCalled();
        expect(state.go).toHaveBeenCalled();
    });

    it("should close the dialog when user clicks on the cancel button", function () {
        scope.ngDialogData = {surgicalBlock: {id:32}};
        scope.surgicalBlockSelected = {provider: {person: {display: "name"}}};
        createController();
        scope.closeDialog();
        expect(ngDialog.close).toHaveBeenCalled();
    });

});