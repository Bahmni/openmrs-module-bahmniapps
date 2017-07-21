'use strict';

describe("deleteAppointmentServiceController", function () {
    var controller, scope, ngDialog, appointmentsServiceService, messagingService, state;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller;
        })});

    ngDialog = jasmine.createSpyObj('ngDialog', ['close']);
    appointmentsServiceService = jasmine.createSpyObj('appointmentsServiceService', ['deleteAppointmentService']);
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

});
