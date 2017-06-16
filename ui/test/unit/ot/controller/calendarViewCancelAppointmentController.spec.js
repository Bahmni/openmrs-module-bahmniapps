'use strict';

describe("calendarViewCancelAppointmentController", function () {

    var controller, scope;
    var surgicalAppointmentService = jasmine.createSpyObj('surgicalAppointmentService', ['']);
    var ngDialog = jasmine.createSpyObj('ngDialog', ['close']);
    var messagingService = jasmine.createSpyObj('messagingService', ['']);
    var surgicalAppointmentHelper = jasmine.createSpyObj('surgicalAppointmentHelper', ['']);


    beforeEach("calendarViewCancelAppointmentController", function () {
        module('bahmni.ot');
        inject(function ($controller, $rootScope) {
            controller = $controller;
            scope = $rootScope.$new();
        });
    });

    var createController = function () {
        controller('calendarViewCancelAppointmentController', {
            $scope: scope,
            surgicalAppointmentService: surgicalAppointmentService,
            messagingService: messagingService,
            surgicalAppointmentHelper: surgicalAppointmentHelper,
            ngDialog: ngDialog
            
        });
    };
    xit("should cancel an appointment when user clicks on cancel button", function () {

    });

    xit("should close the dialog when user clicks on cancel button", function () {
        // scope.ngDialogData =
    });


});