'use strict';

describe("moveSurgicalAppointmentController", function () {
    var controller, scope, surgicalAppointmentService;
    var ngDialog = jasmine.createSpyObj('ngDialog', ['close']);
    surgicalAppointmentService = jasmine.createSpyObj('surgicalAppointmentService', ['getSurgicalBlocksInDateRange']);

    beforeEach(function () {
        module('bahmni.ot');
        inject(function ($controller, $rootScope) {
            controller = $controller;
            scope = $rootScope.$new();
        });
    });

    var surgicalAppointment = {patient: {display: "EG101322M - Albert Hassan", uuid: "2e8a575f-3f87-4abb-ace6-4c5d42e44254"}, surgicalAppointmentAttributes: [{uuid: "6827805f-6eaa-46a4-bda3-077b5e2afab4", surgicalAppointmentAttributeType: {name: "cleaningTime"}, value: "15"}, {uuid: "cb32a968-01f9-4b4e-8433-73250904e0b5", surgicalAppointmentAttributeType: {name: "estTimeHours"}, value: "0"}, {uuid: "4b64e121-ee29-4a9b-89e8-5480fb88271d",surgicalAppointmentAttributeType: {name: "estTimeMinutes"},value: "0"}]};
    var surgicalBlock =  {id: 71, uuid: "cdcf3c4b-6149-4a69-8113-97f651fae024", provider: {person: {uuid: "8ead3402-20e0-11e7-9532-000c290433a8", display: "Hanna Janho"}}, startDatetime: "2017-08-18T03:30:00.000+0000", endDatetime: "2017-08-18T03:45:00.000+0000", surgicalAppointments: [surgicalAppointment], location: {"name": "OT 1"}};
    var surgicalBlock1 =  {id: 72, uuid: "cdcf3c4b-6149-4a69-8113-97f651fae025", provider: {person: {uuid: "8ead3402-20e0-11e7-9532-000c290433a8", display: "Hanna Janho1"}}, startDatetime: "2017-08-18T05:30:00.000+0000", endDatetime: "2017-08-18T08:30:00.000+0000", surgicalAppointments: [surgicalAppointment], location: {"name": "OT 2"}};

    var createController = function () {
        controller('moveSurgicalAppointmentController', {
            $scope: scope,
            ngDialog: ngDialog,
            surgicalAppointmentService: surgicalAppointmentService
        });
    };

    it("should have appointment, block and appointment duration", function () {
        var surgicalAppointment = {patient: {display: "EG101322M - Albert Hassan", uuid: "2e8a575f-3f87-4abb-ace6-4c5d42e44254"}, surgicalAppointmentAttributes: [{uuid: "6827805f-6eaa-46a4-bda3-077b5e2afab4", surgicalAppointmentAttributeType: {name: "cleaningTime"}, value: "15"}, {uuid: "cb32a968-01f9-4b4e-8433-73250904e0b5", surgicalAppointmentAttributeType: {name: "estTimeHours"}, value: "0"}, {uuid: "4b64e121-ee29-4a9b-89e8-5480fb88271d",surgicalAppointmentAttributeType: {name: "estTimeMinutes"},value: "0"}]};
        scope.ngDialogData = {surgicalBlock: surgicalBlock, surgicalAppointment: surgicalAppointment};
        createController();
        expect(scope.appointmentDuration).toBe(15);
        expect(scope.surgicalAppointment.patient.display).toBe("EG101322M - Albert Hassan");
        expect(scope.surgicalBlock.uuid).toBe("cdcf3c4b-6149-4a69-8113-97f651fae024")
    });

    it("should close ngDialog when user clicks on cancel button", function () {
        scope.ngDialogData = {surgicalBlock: surgicalBlock, surgicalAppointment: surgicalAppointment};
        createController();
        scope.cancel();
        expect(ngDialog.close).toHaveBeenCalled();
    });

    it("should get the surgical blocks for that date when user selects a date", function () {
        scope.ngDialogData = {surgicalBlock: surgicalBlock, surgicalAppointment: surgicalAppointment};
        surgicalAppointmentService.getSurgicalBlocksInDateRange.and.returnValue(specUtil.simplePromise({data: {results: [surgicalBlock, surgicalBlock1]}}));
        var dateForMovingSurgery = new Date("2017-08-17T00:00:00.0530");
        scope.dateForMovingSurgery = dateForMovingSurgery;
        createController();
        scope.changeInSurgeryDate();
        expect(surgicalAppointmentService.getSurgicalBlocksInDateRange).toHaveBeenCalledWith(dateForMovingSurgery, new Date(_.clone(dateForMovingSurgery).setHours(23, 59, 59, 999)), false);
        expect(scope.availableBlocks.length).toBe(1);
        expect(scope.availableBlocks[0].uuid).toBe("cdcf3c4b-6149-4a69-8113-97f651fae025");
        expect(scope.availableSurgicalBlocksForGivenDate.length).toBe(1);
        expect(scope.availableSurgicalBlocksForGivenDate[0]).toBe("Hanna Janho1 ( #OT 2 11:00 am - 2:00 pm)");

    })
});