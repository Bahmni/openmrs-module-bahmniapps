'use strict';

describe("calendar view cancel appointment controller", function () {
    var scope, controller;
    var surgicalAppointmentService = jasmine.createSpyObj('surgicalAppointmentService', ['updateSurgicalAppointment', 'updateSurgicalBlock']);
    var ngDialog = jasmine.createSpyObj('ngDialog', ['open', 'close']);
    var surgicalAppointmentHelper = jasmine.createSpyObj('surgicalAppointmentHelper', ['getAppointmentAttributes', 'getPatientDisplayLabel']);
    var messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
    var translate = jasmine.createSpyObj('$translate', ['instant']);
    var q = jasmine.createSpyObj('$q', ['all']);

    surgicalAppointmentService.updateSurgicalAppointment.and.callFake(function () {
        return {data: {results: {}}};
    });

    beforeEach(function () {
        module('bahmni.ot');
        inject(function ($controller, $rootScope) {
            controller = $controller;
            scope = $rootScope.$new();
        });
    });

    var createController = function () {
        scope.ngDialogData = {surgicalBlock: {uuid:"blockUuid", provider: {uuid: "providerUuid"}, surgicalAppointments: [{status: "CANCELLED", sortWeight: 0, patient: {display: "someName1"}}, {status: "CANCELLED", sortWeight: 1, patient: {display: "someName"}}], location: {name: "locationName"}}, surgicalAppointment: {status: "CANCELLED", sortWeight: 1, patient: {display: "someName"}}};
        controller('calendarViewCancelAppointmentController', {
            $scope: scope,
            $translate : translate,
            $q: q,
            ngDialog: ngDialog,
            surgicalAppointmentService: surgicalAppointmentService,
            messagingService: messagingService,
            surgicalAppointmentHelper: surgicalAppointmentHelper
        });
        scope.$apply();
    };

    it("should update the status of the appointment with status", function () {
        surgicalAppointmentService.updateSurgicalAppointment.and.callFake(function () {
            return specUtil.simplePromise({data: {patient: {uuid:"someUuid", display: "someName - I012345"}, status: 'CANCELLED', sortWeight : null}});
        });
        surgicalAppointmentService.updateSurgicalBlock.and.callFake(function () {
            return specUtil.simplePromise({data: {uuid:"blockUuid", provider: {uuid: "providerUuid"}, surgicalAppointments: [{status: "CANCELLED", sortWeight: 0, patient: {display: "someName1"}}], location: {name: "locationName"}}});
        });
        q.all.and.returnValue(specUtil.simplePromise([{data: {patient: {uuid:"someUuid", display: "someName - I012345"}, status: 'CANCELLED', sortWeight : null}}, {data: {uuid:"blockUuid", provider: {uuid: "providerUuid"}, surgicalAppointments: [{status: "CANCELLED", sortWeight: 0, patient: {display: "someName1"}}], location: {name: "locationName"}}}]));
        surgicalAppointmentHelper.getAppointmentAttributes.and.callFake(function () {return {};});
        surgicalAppointmentHelper.getPatientDisplayLabel.and.callFake(function () {return "someName";});
        createController();
        scope.confirmCancelAppointment();
        expect(scope.ngDialogData.surgicalAppointment.sortWeight).toBe(null);
        expect(scope.ngDialogData.surgicalAppointment.status).toBe("CANCELLED");
        expect(surgicalAppointmentService.updateSurgicalAppointment).toHaveBeenCalled();
        expect(surgicalAppointmentService.updateSurgicalBlock).toHaveBeenCalled();
        expect(q.all).toHaveBeenCalled();
        expect(messagingService.showMessage).toHaveBeenCalled();
        expect(ngDialog.close).toHaveBeenCalled();
    });

    it("should close the dialog when user clicks on close button", function () {
        createController();
        scope.closeDialog();
        expect(ngDialog.close).toHaveBeenCalled();
    });


    it("should give cancelled message when the appointment is cancelled", function () {
        surgicalAppointmentService.updateSurgicalAppointment.and.callFake(function () {
            return specUtil.simplePromise({data: {patient: {uuid:"someUuid", display: "someName - I012345"}, status: "CANCELLED"}});
        });
        surgicalAppointmentService.updateSurgicalBlock.and.callFake(function () {
            return specUtil.simplePromise({data: {uuid:"blockUuid", provider: {uuid: "providerUuid"}, surgicalAppointments: [{status: "CANCELLED", sortWeight: 0, patient: {display: "someName1"}}], location: {name: "locationName"}}});
        });
        q.all.and.returnValue(specUtil.simplePromise([{data: {patient: {uuid:"someUuid", display: "someName - I012345"}, status: "CANCELLED"}}, {data: {uuid:"blockUuid", provider: {uuid: "providerUuid"}, surgicalAppointments: [{status: "CANCELLED", sortWeight: 0, patient: {display: "someName1"}}], location: {name: "locationName"}}}]));
        surgicalAppointmentHelper.getAppointmentAttributes.and.callFake(function () {return {};});
        surgicalAppointmentHelper.getPatientDisplayLabel.and.callFake(function () {return "someName";});
        createController();
        scope.confirmCancelAppointment();
        expect(q.all).toHaveBeenCalled();
        expect(translate.instant).toHaveBeenCalledWith("OT_SURGICAL_APPOINTMENT_CANCELLED_MESSAGE")
    });

    it("should give postponed message when the appointment is postponed", function () {
        surgicalAppointmentService.updateSurgicalAppointment.and.callFake(function () {
            return specUtil.simplePromise({data: {patient: {uuid:"someUuid", display: "someName - I022222"}, status: "POSTPONED" }});
        });
        surgicalAppointmentService.updateSurgicalBlock.and.callFake(function () {
            return specUtil.simplePromise({data: {uuid:"blockUuid", provider: {uuid: "providerUuid"}, surgicalAppointments: [{status: "CANCELLED", sortWeight: 0, patient: {display: "someName1"}}], location: {name: "locationName"}}});
        });
        q.all.and.returnValue(specUtil.simplePromise([{data: {patient: {uuid:"someUuid", display: "someName - I022222"}, status: "POSTPONED" }}, {data: {uuid:"blockUuid", provider: {uuid: "providerUuid"}, surgicalAppointments: [{status: "CANCELLED", sortWeight: 0, patient: {display: "someName1"}}], location: {name: "locationName"}}}]));
        surgicalAppointmentHelper.getAppointmentAttributes.and.callFake(function () {return {};});
        surgicalAppointmentHelper.getPatientDisplayLabel.and.callFake(function () {return "someName";});
        createController();
        scope.confirmCancelAppointment();
        expect(q.all).toHaveBeenCalled();
        expect(translate.instant).toHaveBeenCalledWith("OT_SURGICAL_APPOINTMENT_POSTPONED_MESSAGE")
    });

});
