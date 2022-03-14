'use strict';
describe("surgicalAppointmentActualTimeController", function () {

    var controller, scope;
    var ngDialog = jasmine.createSpyObj('ngDialog', ['open', 'close']);
    var messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
    var surgicalAppointmentService = jasmine.createSpyObj('surgicalAppointmentService', ['getSurgeons', 'saveSurgicalBlock', 'getSurgicalAppointmentAttributeTypes', 'getSurgicalBlockFor', 'updateSurgicalAppointment']);
    var surgicalAppointmentHelper = jasmine.createSpyObj('surgicalAppointmentHelper', ['getEstimatedDurationForAppointment']);
    var translate;
    var translatedMessages = {
        "ACTUAL_START_TIME_GREATER_THAN_END_TIME_MESSAGE": "Actual start time should be less than actual end time",
        "ACTUAL_TIME_ADDED_TO_KEY":"Actual time added to "
    };


    beforeEach(function () {
        module('bahmni.ot');
        inject(function ($controller, $rootScope, _surgicalAppointmentHelper_) {
            controller = $controller;
            scope = $rootScope.$new();
            surgicalAppointmentHelper = _surgicalAppointmentHelper_;
        });
        translate = jasmine.createSpyObj('$translate', ['instant']);
        translate.instant.and.callFake(function (key) {
            return translatedMessages[key];
        })
    });

    var createController = function () {
        controller('surgicalAppointmentActualTimeController', {
            $scope: scope,
            ngDialog: ngDialog,
            messagingService: messagingService,
            surgicalAppointmentService: surgicalAppointmentService,
            surgicalAppointmentHelper: surgicalAppointmentHelper,
            $translate: translate
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
                            name: "cleaningTime"
                        },
                        value: "15"
                    }],
                sortWeight: 0
            }]
        };
        var alreadyCalled;
        spyOn(surgicalAppointmentHelper, "getEstimatedDurationForAppointment").and.callFake(function () {
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
        spyOn(surgicalAppointmentHelper, "getEstimatedDurationForAppointment").and.callFake(function () {
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
                            name: "cleaningTime"
                        },
                        value: "15"
                    }],
                sortWeight: 0
            }]
        };
        var alreadyCalled;
        spyOn(surgicalAppointmentHelper, "getEstimatedDurationForAppointment").and.callFake(function () {
            if (alreadyCalled) return 45;
            alreadyCalled = true;
            return 45;
        });
        scope.ngDialogData.surgicalAppointment = scope.ngDialogData.surgicalBlock.surgicalAppointments[0];
        createController();
        scope.actualStartTime = new Date("Tue Jun 06 2017 10:00:00 GMT+0530 (IST)");
        scope.actualEndTime = new Date("Tue Jun 06 2017 10:45:00 GMT+0530 (IST)");
    });

    it('should make actual start time and actual end time mandatory when actual start time is filled', function () {
        scope.ngDialogData = {};
        scope.ngDialogData.surgicalBlock = {
            id: 27,
            startDatetime: "2017-06-06T10:00:00.000+0530",
            endDatetime: "2017-06-06T12:00:00.000+0530"
        };
        scope.ngDialogData.surgicalAppointment = {
            patient: {
                display: "EM10000Q - Test Patient"
            },
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
                        name: "cleaningTime"
                    },
                    value: "15"
                }]
        };
        createController();
        scope.actualStartTime = new Date("Tue Jun 06 2017 10:00:00 GMT+0530 (IST)");
        expect(scope.isActualTimeRequired()).toBeTruthy();
    });

    it('should make actual start time and actual end time not mandatory when all the fields on the dialog are empty', function () {
        scope.ngDialogData = {};
        scope.ngDialogData.surgicalBlock = {
            id: 27,
            startDatetime: "2017-06-06T10:00:00.000+0530",
            endDatetime: "2017-06-06T12:00:00.000+0530"
        };
        scope.ngDialogData.surgicalAppointment = {
            patient: {
                display: "EM10000Q - Test Patient"
            },
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
                        name: "CleaningTime"
                    },
                    value: "15"
                }]
        };

        createController();
        scope.actualStartTime = undefined;
        scope.actualEndTime = undefined;
        scope.notes = undefined;
        expect(scope.isActualTimeRequired()).toBeFalsy();
    });

    it('should add the appointment for update', function () {
        scope.ngDialogData = {};
        scope.ngDialogData.surgicalBlock = {
            id: 27,
            startDatetime: "2017-06-06T10:00:00.000+0530",
            endDatetime: "2017-06-06T12:00:00.000+0530",
            location: {
                name: "OT 1"
            }
        };
        scope.ngDialogData.surgicalAppointment = {
            patient: {
                display: "EM10000Q - Test Patient"
            },
            sortWeight: 1,
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
                        name: "CleaningTime"
                    },
                    value: "15"
                }]
        };

        var appointmentForSave = {
            id: undefined,
            uuid: undefined,
            actualStartDatetime: new Date('Tue Jun 06 2017 10:00:00 GMT+0530 (IST)'),
            actualEndDatetime: new Date('Tue Jun 06 2017 11:00:00 GMT+0530 (IST)'),
            status: 'COMPLETED',
            notes: undefined,
            surgicalBlock: {uuid: undefined},
            patient: {uuid: undefined},
            sortWeight: 1
        };
        surgicalAppointmentService.updateSurgicalAppointment.and.returnValue(specUtil.simplePromise({data: scope.ngDialogData.surgicalAppointment}));
        createController();
        scope.actualStartTime = new Date("2017-06-06T10:00:00.000+0530");
        scope.actualEndTime = new Date("2017-06-06T11:00:00.000+0530");
        scope.add();
        expect(surgicalAppointmentService.updateSurgicalAppointment).toHaveBeenCalledWith(appointmentForSave);
        expect(messagingService.showMessage).toHaveBeenCalledWith('info', "Actual time added to Test Patient ( EM10000Q ) - OT 1");
        expect(ngDialog.close).toHaveBeenCalled();
    });

    it('should throw error message when actual start time is greater than actual endtime', function () {
        scope.ngDialogData = {};
        scope.ngDialogData.surgicalBlock = {
            id: 27,
            startDatetime: "2017-06-06T10:00:00.000+0530",
            endDatetime: "2017-06-06T12:00:00.000+0530",
            location: {
                name: "OT 1"
            }
        };
        scope.ngDialogData.surgicalAppointment = {
            patient: {
                display: "EM10000Q - Test Patient"
            },
            sortWeight: 1,
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
                        name: "CleaningTime"
                    },
                    value: "15"
                }]
        };
        createController();
        scope.actualStartTime = new Date("2017-06-06T10:00:00.000+0530");
        scope.actualEndTime = new Date("2017-06-06T10:00:00.000+0530");
        scope.add();
        expect(messagingService.showMessage).toHaveBeenCalledWith('error', 'ACTUAL_START_TIME_GREATER_THAN_END_TIME_MESSAGE');
    });
});