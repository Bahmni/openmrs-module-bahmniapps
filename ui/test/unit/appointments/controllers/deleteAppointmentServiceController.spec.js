'use strict';

describe("deleteAppointmentServiceController", function () {
    var controller, scope, ngDialog, appointmentsServiceService, messagingService, state, mockPromise;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller;
        });

        appointmentsServiceService = jasmine.createSpyObj('appointmentsServiceService', ['deleteAppointmentService']);
    });

    ngDialog = jasmine.createSpyObj('ngDialog', ['close']);
    messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
    state = jasmine.createSpyObj('$state', ['reload']);

    var createController = function () {
        controller('deleteAppointmentServiceController', {
            $scope: scope,
            appointmentsServiceService: appointmentsServiceService,
            messagingService: messagingService,
            ngDialog: ngDialog,
            $state: state
        });
    };

    it('should close the dialog when appointment service throws an error', function () {
        mockPromise = {
            then: function (successFn, errorFn) {
                errorFn();
            }
        };
        appointmentsServiceService = {
            deleteAppointmentService: function () {
                return mockPromise;
            }
        };
        var service = {name: "service name", uuid: "serviceUuid"};
        scope.ngDialogData = {service: service};
        createController();

        scope.deleteServiceConfirmation(service);

        expect(messagingService.showMessage).not.toHaveBeenCalled();
        expect(ngDialog.close).toHaveBeenCalled();
        expect(state.reload).not.toHaveBeenCalled();
    });

    it('should delete the appointment service on confirmation', function () {
        appointmentsServiceService.deleteAppointmentService.and.returnValue(specUtil.simplePromise({"data": "service"}));
        var service = {name: "service name", uuid: "serviceUuid"};
        scope.ngDialogData = {service: service};
        createController();
        scope.deleteServiceConfirmation(service);
        expect(appointmentsServiceService.deleteAppointmentService).toHaveBeenCalledWith(service.uuid);
        expect(messagingService.showMessage).toHaveBeenCalledWith('info', "{{'APPOINTMENT_SERVICE_DELETE_SUCCESS_MESSAGE_KEY' | translate}}");
        expect(ngDialog.close).toHaveBeenCalled();
        expect(state.reload).toHaveBeenCalled();
    });

    it('should close the dialog on cancel', function () {
        var service = {name: "service name", uuid: "serviceUuid"};
        scope.ngDialogData = {service: service};
        createController();

        scope.cancelDeleteService();

        expect(ngDialog.close).toHaveBeenCalled();
    });
});
