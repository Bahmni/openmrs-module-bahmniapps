'use strict';

describe("surgical block view cancel appointment controller", function () {
    var scope, controller;
    var ngDialog = jasmine.createSpyObj('ngDialog', ['open', 'close']);

    beforeEach(function () {
        module('bahmni.ot');
        inject(function ($controller, $rootScope) {
            controller = $controller;
            scope = $rootScope.$new();
        });
        scope.ngDialogData = {surgicalBlock: {uuid:"blockUuid", location: {name: "locationName"}}};
        scope.ngDialogData.surgicalAppointment ={status: "CANCELLED", notes: "notes", sortWeight: 1, surgicalAppointmentAttributes: {estTimeHours: {value: 1}, estTimeMinutes: {value: 30} }, isBeingEdited: true};
        scope.ngDialogData.surgicalForm ={surgicalAppointments: [scope.ngDialogData.surgicalAppointment] };
        scope.ngDialogData.updateAvailableBlockDurationFn = jasmine.createSpy();
    });

    var createController = function () {
        controller('surgicalBlockViewCancelAppointmentController', {
            $scope: scope,
            ngDialog: ngDialog
        });
        scope.$apply();
    };

    it("should update the status of the appointment with status for saved appointment", function () {
        scope.ngDialogData.surgicalAppointment.patient =  {display: "EG100649M - Albert Hassan"};
        createController();
        expect(scope.appointment.patient).toEqual("Albert Hassan ( EG100649M )");
        expect(scope.appointment.notes).toEqual("notes");
        expect(scope.appointment.status).toEqual("CANCELLED");
        expect(scope.appointment.estTimeHours).toEqual(1);
        expect(scope.appointment.estTimeMinutes).toEqual(30);
    });

    it("should update the status of the appointment with status for saved appointment", function () {
        scope.ngDialogData.surgicalAppointment.patient =  {label: "Albert Hassan ( EG100649M )"};
        createController();
        expect(scope.appointment.patient).toEqual("Albert Hassan ( EG100649M )");
        expect(scope.appointment.notes).toEqual("notes");
        expect(scope.appointment.status).toEqual("CANCELLED");
        expect(scope.appointment.estTimeHours).toEqual(1);
        expect(scope.appointment.estTimeMinutes).toEqual(30);
    });

    it("should update the status of the appointment with status for saved appointment", function () {
        scope.ngDialogData.surgicalAppointment.patient =  {display: "EG100649M - Albert Hassan"};
        createController();
        scope.confirmCancelAppointment();
        scope.ngDialogData.surgicalAppointment.id = 30;
        expect(scope.ngDialogData.surgicalAppointment.sortWeight).toBe(null);
        expect(scope.ngDialogData.surgicalAppointment.status).toBe("CANCELLED");
        expect(scope.ngDialogData.surgicalAppointment.isBeingEdited).toBe(undefined);
        expect(scope.ngDialogData.surgicalAppointment.notes).toBe("notes");
        expect(scope.ngDialogData.updateAvailableBlockDurationFn).toHaveBeenCalled();
        expect(ngDialog.close).toHaveBeenCalled();
    });
    
    it("should update the status of the appointment with status for saved appointment", function () {
        scope.ngDialogData.surgicalAppointment.patient =  {display: "EG100649M - Albert Hassan"};
        createController();
        scope.ngDialogData.surgicalForm.surgicalAppointments.push({patient:{display: "patient2", id:"123"}});
        scope.confirmCancelAppointment();
        expect(scope.ngDialogData.surgicalAppointment.sortWeight).toBe(null);
        expect(scope.ngDialogData.surgicalAppointment.status).toBe("CANCELLED");
        expect(scope.ngDialogData.surgicalAppointment.isBeingEdited).toBe(undefined);
        expect(scope.ngDialogData.surgicalAppointment.notes).toBe("notes");
        expect(scope.ngDialogData.surgicalForm.surgicalAppointments.length).toBe(1);
        expect(scope.ngDialogData.updateAvailableBlockDurationFn).toHaveBeenCalled();
        expect(ngDialog.close).toHaveBeenCalled();
    });

    it("should close the dialog when user clicks on close button", function () {
        scope.ngDialogData.surgicalAppointment.patient =  {display: "EG100649M - Albert Hassan"};
        createController();
        scope.closeDialog();
        expect(ngDialog.close).toHaveBeenCalled();
        expect(scope.ngDialogData.surgicalAppointment.isBeingEdited).toBe(undefined);
    });

    it("should delete isBeingEdited field while postpone/cancel the appointment", function () {
        scope.ngDialogData.surgicalAppointment.patient =  {display: "EG100649M - Albert Hassan"};
       createController();
       scope.confirmCancelAppointment();
       expect(scope.ngDialogData.surgicalAppointment.isBeingEdited).toBeUndefined();
    });
});
