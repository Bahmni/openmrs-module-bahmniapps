'use strict';
describe("surgicalAppointmentActualTimeController", function () {

    var controller, scope;
    var ngDialog = jasmine.createSpyObj('ngDialog', ['open', 'close']);
    var messagingService = jasmine.createSpyObj('messagingService', ['']);
    var surgicalAppointmentService = jasmine.createSpyObj('surgicalAppointmentService', ['getSurgeons', 'saveSurgicalBlock', 'getSurgicalAppointmentAttributeTypes', 'getSurgicalBlockFor']);
    var surgicalAppointmentHelper = jasmine.createSpyObj('surgicalAppointmentHelper', ['getEstimatedDurationForAppointment']);

    beforeEach(function () {
        module('bahmni.ot');
        inject(function ($controller, $rootScope, _surgicalAppointmentHelper_) {
            controller = $controller;
            scope = $rootScope.$new();
            surgicalAppointmentHelper = _surgicalAppointmentHelper_;
        });
    });

    var createController = function () {
        controller('surgicalAppointmentActualTimeController', {
            $scope: scope,
            ngDialog: ngDialog,
            messagingService: messagingService,
            surgicalAppointmentService: surgicalAppointmentService,
            surgicalAppointmentHelper: surgicalAppointmentHelper
        });
    };

    it("should calculate start time and end time for the appointment", function () {
        scope.ngDialogData = {};
        scope.ngDialogData.surgicalBlock = {
            id: 27,
            startDatetime: "2017-06-06T10:00:00.000+0530",
            endDatetime: "2017-06-06T12:00:00.000+0530",
            surgicalAppointments: [{
                id: 30,
                patient: {uuid: "patientUuid", display: 'IQ100023 - Test Patient'},
                surgicalAppointmentAttributes: [{
                    surgicalAppointmentAttributeType: {
                        format: "java.lang.String",
                        name: "estTimeMinutes"
                    },
                    value: "30"
                },
                    {
                        surgicalAppointmentAttributeType: {
                            format: "java.lang.String",
                            name: "estTimeHours"
                        },
                        value: "0"
                    },
                    {
                        surgicalAppointmentAttributeType: {
                            format: "java.lang.String",
                            name: "estTimeMinutes"
                        },
                        value: "15"
                    }],
                sortWeight: 0
            }]
        };
        var alreadyCalled;
        spyOn(surgicalAppointmentHelper, "getEstimatedDurationForAppointment").and.callFake(function() {
            if (alreadyCalled) return 45;
            alreadyCalled = true;
            return 45;
        });
        scope.ngDialogData.surgicalAppointment = scope.ngDialogData.surgicalBlock.surgicalAppointments[0];
        createController();
        expect(scope.actualStartTime).toEqual(new Date("Tue Jun 06 2017 10:00:00 GMT+0530 (IST)"));
        expect(scope.actualEndTime).toEqual(new Date("Tue Jun 06 2017 10:45:00 GMT+0530 (IST)"));
    });

    it("should give the startTime and endTime if they exists in surgical appointment", function () {
        scope.ngDialogData = {};
        scope.ngDialogData.surgicalBlock = {
            endDatetime: "2017-06-06T12:00:00.000+0530",
            id: 27,
            startDatetime: "2017-06-06T10:00:00.000+0530",
            surgicalAppointments: [{
                actualEndDatetime: "2017-06-06T10:45:00.000+0530",
                actualStartDatetime: "2017-06-06T10:00:00.000+0530",
                id: 30,
                patient: {uuid: "patientUuid", display: 'IQ100023 - Test Patient'},
                sortWeight: 0
            }]
        };
        var alreadyCalled;
        spyOn(surgicalAppointmentHelper, "getEstimatedDurationForAppointment").and.callFake(function() {
            if (alreadyCalled) return 45;
            alreadyCalled = true;
            return 45;
        });
        scope.ngDialogData.surgicalAppointment = scope.ngDialogData.surgicalBlock.surgicalAppointments[0];
        createController();
        expect(scope.actualStartTime).toEqual(new Date(scope.ngDialogData.surgicalBlock.surgicalAppointments[0].actualStartDatetime));
        expect(scope.actualEndTime).toEqual(new Date(scope.ngDialogData.surgicalBlock.surgicalAppointments[0].actualEndDatetime));
    });

    it("should add the startTime, endTime and notes for the appointment", function () {
        scope.ngDialogData = {};
        scope.ngDialogData.surgicalBlock = {
            id: 27,
            startDatetime: "2017-06-06T10:00:00.000+0530",
            endDatetime: "2017-06-06T12:00:00.000+0530",
            surgicalAppointments: [{
                id: 30,
                patient: {uuid: "patientUuid", display: 'IQ100023 - Test Patient'},
                surgicalAppointmentAttributes: [{
                    surgicalAppointmentAttributeType: {
                        format: "java.lang.String",
                        name: "estTimeMinutes"
                    },
                    value: "30"
                },
                    {
                        surgicalAppointmentAttributeType: {
                            format: "java.lang.String",
                            name: "estTimeHours"
                        },
                        value: "0"
                    },
                    {
                        surgicalAppointmentAttributeType: {
                            format: "java.lang.String",
                            name: "estTimeMinutes"
                        },
                        value: "15"
                    }],
                sortWeight: 0
            }]
        };
        var alreadyCalled;
        spyOn(surgicalAppointmentHelper, "getEstimatedDurationForAppointment").and.callFake(function() {
            if (alreadyCalled) return 45;
            alreadyCalled = true;
            return 45;
        });
        scope.ngDialogData.surgicalAppointment = scope.ngDialogData.surgicalBlock.surgicalAppointments[0];
        createController();
        scope.actualStartTime = new Date("Tue Jun 06 2017 10:00:00 GMT+0530 (IST)");
        scope.actualEndTime = new Date("Tue Jun 06 2017 10:45:00 GMT+0530 (IST)");
    });

});