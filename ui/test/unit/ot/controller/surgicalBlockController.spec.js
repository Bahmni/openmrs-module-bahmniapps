'use strict';

describe("surgicalBlockController", function () {
    var scope, controller, surgicalAppointmentHelper, surgicalBlockHelper, stateParams = {};
    var openmrsSurgicalAppointmentAttributes = [
        {
            "id": 104,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde80e15-3f81-11e7-97ea-0800274a5156"
            },
            "value": "1"
        },
        {
            "id": 105,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde9429e-3f81-11e7-97ea-0800274a5156"
            },
            "value": "Anaesthetist"
        },
        {
            "id": 106,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde8faf8-3f81-11e7-97ea-0800274a5156"
            },
            "value": "47"
        },
        {
            "id": 107,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde92009-3f81-11e7-97ea-0800274a5156"
            },
            "value": "surgicalAssistant"
        },
        {
            "id": 108,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde7e794-3f81-11e7-97ea-0800274a5156"
            },
            "value": "procedure"
        },
        {
            "id": 109,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde96224-3f81-11e7-97ea-0800274a5156"
            },
            "value": "scrub nurse"
        },
        {
            "id": 110,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde85c99-3f81-11e7-97ea-0800274a5156"
            },
            "value": "30"
        },
        {
            "id": 111,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde9821c-3f81-11e7-97ea-0800274a5156"
            },
            "value": "circulating nurse"
        },
        {
            "id": 112,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde8c614-3f81-11e7-97ea-0800274a5156"
            },
            "value": "15"
        }
    ];

    var uiSurgicalAppointmentAttributes = {
        "estTimeHours": {
            "id": 104,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde80e15-3f81-11e7-97ea-0800274a5156"
            },
            "value": "1"
        }, "anaesthetist": {
            "id": 105,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde9429e-3f81-11e7-97ea-0800274a5156"
            },
            "value": "Anaesthetist"
        }, "otherSurgeon": {
            "id": 106,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde8faf8-3f81-11e7-97ea-0800274a5156"
            },
            "value": {
                "id": 47,
                "person": {
                    id:"patientUuid",
                    display: "Eman"
                }
            }
        }, "surgicalAssistant": {
            "id": 107,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde92009-3f81-11e7-97ea-0800274a5156",
                "name": "surgicalAssistant"
            },
            "value": "surgicalAssistant"
        }, "procedure": {
            "id": 108,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde7e794-3f81-11e7-97ea-0800274a5156",
                "name": "procedure"
            },
            "value": "procedure"
        }, "scrubNurse": {
            "id": 109,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde96224-3f81-11e7-97ea-0800274a5156"
            },
            "value": "scrub nurse"
        }, "estTimeMinutes": {
            "id": 110,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde85c99-3f81-11e7-97ea-0800274a5156",
                "name": "estTimeMinutes"
            },
            "value": "30"
        }, "circulatingNurse": {
            "id": 111,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde9821c-3f81-11e7-97ea-0800274a5156"
            },
            "value": "circulating nurse"
        }, "cleaningTime": {
            "id": 112,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde8c614-3f81-11e7-97ea-0800274a5156"
            },
            "value": "15"
        }
    };
    var defaultSurgicalAppointmentAttributes = {
        "estTimeHours": {
            "surgicalAppointmentAttributeType": {
                "uuid": "bde80e15-3f81-11e7-97ea-0800274a5156"
            },
            "value": "0"
        }, "anaesthetist": {
            "surgicalAppointmentAttributeType": {
                "uuid": "bde9429e-3f81-11e7-97ea-0800274a5156"
            },
            "value": null
        }, "otherSurgeon": {
            "surgicalAppointmentAttributeType": {
                "uuid": "bde8faf8-3f81-11e7-97ea-0800274a5156"
            },
            "value": null
        }, "surgicalAssistant": {
            "surgicalAppointmentAttributeType": {
                "uuid": "bde92009-3f81-11e7-97ea-0800274a5156"
            },
            "value": null
        }, "procedure": {
            "surgicalAppointmentAttributeType": {
                "uuid": "bde7e794-3f81-11e7-97ea-0800274a5156"
            },
            "value": null
        }, "scrubNurse": {
            "surgicalAppointmentAttributeType": {
                "uuid": "bde96224-3f81-11e7-97ea-0800274a5156"
            },
            "value": null
        }, "estTimeMinutes": {
            "surgicalAppointmentAttributeType": {
                "uuid": "bde85c99-3f81-11e7-97ea-0800274a5156"
            },
            "value": "0"
        }, "circulatingNurse": {
            "surgicalAppointmentAttributeType": {
                "uuid": "bde9821c-3f81-11e7-97ea-0800274a5156"
            },
            "value": null
        }, "cleaningTime": {
            "surgicalAppointmentAttributeType": {
                "uuid": "bde8c614-3f81-11e7-97ea-0800274a5156"
            },
            "value": "15"
        }
    };


    var q = jasmine.createSpyObj('$q', ['all']);
    var state = jasmine.createSpyObj('$state', ['go']);
    var spinner = jasmine.createSpyObj('spinner', ['forPromise', 'then', 'catch']);
    var surgicalAppointmentService = jasmine.createSpyObj('surgicalAppointmentService', ['getSurgeons', 'saveSurgicalBlock', 'getSurgicalAppointmentAttributeTypes', 'getSurgicalBlockFor', 'updateSurgicalBlock']);
    var locationService = jasmine.createSpyObj('locationService', ['getAllByTag']);

    var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
    var appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
    var messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
    var ngDialog = jasmine.createSpyObj('ngDialog', ['open', 'close']);
    appService.getAppDescriptor.and.returnValue(appDescriptor);

    appDescriptor.getConfigValue.and.callFake(function (value) {
        if (value === 'primarySurgeonsForOT') {
            return ["provider1", "provider2"];
        }
        if (value === 'calendarView') {
            return {dayViewStart: '08:00', dayViewEnd: '18:00', dayViewSplit: '60'}
        }
        return value;
    });

    var appointmentAttributeTypes ={data: {results: [
                {
                    "uuid": "bde7e794-3f81-11e7-97ea-0800274a5156",
                    "name": "procedure"
                },
                {
                    "uuid": "bde80e15-3f81-11e7-97ea-0800274a5156",
                    "name": "estTimeHours"
                },
                {
                    "uuid": "bde85c99-3f81-11e7-97ea-0800274a5156",
                    "name": "estTimeMinutes"
                },
                {
                    "uuid": "bde8c614-3f81-11e7-97ea-0800274a5156",
                    "name": "cleaningTime"
                },
                {
                    "uuid": "bde8faf8-3f81-11e7-97ea-0800274a5156",
                    "name": "otherSurgeon"
                },
                {
                    "uuid": "bde92009-3f81-11e7-97ea-0800274a5156",
                    "name": "surgicalAssistant"
                },
                {
                    "uuid": "bde9429e-3f81-11e7-97ea-0800274a5156",
                    "name": "anaesthetist"
                },
                {
                    "uuid": "bde96224-3f81-11e7-97ea-0800274a5156",
                    "name": "scrubNurse"
                },
                {
                    "uuid": "bde9821c-3f81-11e7-97ea-0800274a5156",
                    "name": "circulatingNurse"
                }
            ]}};

    var surgeonList = {data: {results: [{uuid: "uuid1", person: {display: "provider1"}}, {uuid: "uuid2", person: {display: "provider2"}}]}};
    surgicalAppointmentService.getSurgeons.and.callFake(function () {
        return surgeonList;
    });

    surgicalAppointmentService.getSurgicalAppointmentAttributeTypes.and.callFake(function () {
        return appointmentAttributeTypes;
    });

    var allTags = {data: {results: [{uuid: "uuid1", name: "location1"}, {uuid: "uuid2", name: "location2"}]}};
    locationService.getAllByTag.and.callFake(function () {
        return allTags;
    });

    q.all.and.returnValue(specUtil.simplePromise([surgeonList, allTags, appointmentAttributeTypes]));


    beforeEach(function () {
        module('bahmni.ot');
        inject(function ($controller, $rootScope, _surgicalAppointmentHelper_, _surgicalBlockHelper_) {
            controller = $controller;
            scope = $rootScope.$new();
            surgicalAppointmentHelper = _surgicalAppointmentHelper_;
            surgicalBlockHelper = _surgicalBlockHelper_;
        });
    });

    //This function converts a date into locale specific date
    var toDateString = function(dateValue){
        //dateValue expected in the format -> 2017-08-18 20:00:00
        return moment(dateValue,"YYYY-MM-DD HH:mm:ss").format();
    };

    var toDate = function(dateValue){
        //dateValue expected in the format -> 2017-08-18 20:00:00
        return moment(dateValue,"YYYY-MM-DD HH:mm:ss").toDate();
    };

    var createController = function () {
        controller('surgicalBlockController', {
            $scope: scope,
            $q: q,
            $state: state,
            $stateParams: stateParams,
            spinner: spinner,
            surgicalAppointmentService: surgicalAppointmentService,
            locationService: locationService,
            appService: appService,
            messagingService: messagingService,
            surgicalAppointmentHelper: surgicalAppointmentHelper,
            ngDialog: ngDialog
        });
    };

    it("should get the surgeon Names from openMRS", function () {
        var surgeons = {results: [{answers: [{displayString: "sample name"}, {displayString: "sample name2"}, {displayString: "sample name3"}]}]};
        var locations = {
            results: [{display: 'OT1'}, {display: 'OT2'}, {display: 'OT3'}]
        };
        surgicalAppointmentService.saveSurgicalBlock.and.returnValue(specUtil.simplePromise({data: surgeons}));
        locationService.getAllByTag.and.returnValue(specUtil.simplePromise({data: locations}));
        expect(scope.surgeons).toBeUndefined();

        createController();
        expect(surgicalAppointmentService.getSurgeons).toHaveBeenCalled();
    });

    it("should not invalidate start datetime or end datetime when either of them is missing", function () {
        createController();
        expect(scope.isStartDatetimeBeforeEndDatetime()).toBeTruthy();
        expect(scope.isStartDatetimeBeforeEndDatetime(new Date())).toBeTruthy();
        expect(scope.isStartDatetimeBeforeEndDatetime(undefined, new Date())).toBeTruthy();
    });

    it("should validate a form having end date greater than start date", function () {
        createController();
        scope.createSurgicalBlockForm = {};
        scope.createSurgicalBlockForm.$valid = true;
        scope.surgicalForm.startDatetime = new Date(2017, 1, 30, 1, 11);
        scope.surgicalForm.endDatetime = new Date(2017, 1, 30, 2, 11);
        expect(scope.isFormValid()).toBeTruthy();
    });

    it("should not validate a form having end date less than start date", function () {
        createController();
        scope.createSurgicalBlockForm = {};
        scope.createSurgicalBlockForm.$valid = true;
        scope.surgicalForm.endDatetime = new Date(2017, 1, 30, 1, 11);
        scope.surgicalForm.startDatetime = new Date(2017, 1, 30, 2, 11);
        expect(scope.isFormValid()).toBeFalsy();
    });

    it("should not validate a form having invalid data", function () {
        createController();
        scope.createSurgicalBlockForm = {};
        scope.createSurgicalBlockForm.$valid = false;
        scope.surgicalForm.startDatetime = new Date(2017, 1, 30, 1, 11);
        scope.surgicalForm.endDatetime = new Date(2017, 1, 30, 2, 11);
        expect(scope.isFormValid()).toBeFalsy();
    });

    it("should throw message if the surgical form is not valid on save", function () {
        createController();
        scope.createSurgicalBlockForm = {};
        scope.createSurgicalBlockForm.$valid = false;
        scope.surgicalForm.endDatetime = new Date(2017, 1, 30, 1, 11);
        scope.surgicalForm.startDatetime = new Date(2017, 1, 30, 2, 11);
        scope.save(scope.surgicalForm);
        expect(messagingService.showMessage).toHaveBeenCalledWith('error', "{{'OT_ENTER_MANDATORY_FIELDS' | translate}}");
    });

    it("should throw message if the surgical appointments duration exceeds the the block duration", function () {
        createController();
        scope.createSurgicalBlockForm = {};
        scope.createSurgicalBlockForm.$valid = true;
        scope.surgicalForm.startDatetime = new Date(2017, 1, 30, 1, 11);
        scope.surgicalForm.endDatetime = new Date(2017, 1, 30, 2, 11);
        scope.surgicalForm.surgicalAppointments = [{patient: {uuid: "patientUuid"}, notes: "need more assistants", surgicalAppointmentAttributes: {cleaningTime: {value: 15}, estTimeMinutes: {value: 30}, estTimeHours: {value: 1}}}];
        scope.save(scope.surgicalForm);
        expect(messagingService.showMessage).toHaveBeenCalledWith('error', "{{'OT_SURGICAL_APPOINTMENT_EXCEEDS_BLOCK_DURATION' | translate}}");
    });

    it("should save a valid surgical form", function (done) {
        var surgicalBlock = {};
        surgicalBlock.voided = false;
        surgicalBlock.startDatetime = new Date(2017, 1, 29, 2, 11);
        surgicalBlock.endDatetime = new Date(2017, 1, 30, 3, 11);
        surgicalBlock.provider = {uuid: "providerUuid"};
        surgicalBlock.location = {uuid: "locationUuid"};
        surgicalBlock.surgicalAppointments = [{id: "11", patient: {uuid: "patientUuid"}, notes: "need more assistants", sortWeight: 0, surgicalAppointmentAttributes: openmrsSurgicalAppointmentAttributes}];

        surgicalAppointmentService.saveSurgicalBlock.and.returnValue(specUtil.simplePromise({data: surgicalBlock}));
        spinner.forPromise.and.returnValue(specUtil.simplePromise({data: surgicalBlock}));

        createController();

        scope.createSurgicalBlockForm = {};
        scope.createSurgicalBlockForm.$valid = true;
        scope.surgicalForm = {};
        scope.surgicalForm.startDatetime = new Date(2017, 1, 29, 2, 11);
        scope.surgicalForm.endDatetime = new Date(2017, 1, 30, 3, 11);
        scope.surgicalForm.provider = {uuid: "providerUuid"};
        scope.surgicalForm.location = {uuid: "locationUuid"};
        scope.surgicalForm.surgicalAppointments = [{id: "11", patient: {uuid: "patientUuid"}, notes: "need more assistants", sortWeight: 0, surgicalAppointmentAttributes: uiSurgicalAppointmentAttributes}];

        scope.saveAnywaysFlag = true;
        scope.save(scope.surgicalForm);

        expect(surgicalAppointmentService.saveSurgicalBlock).toHaveBeenCalled();
        expect(surgicalAppointmentService.saveSurgicalBlock).toHaveBeenCalledWith(jasmine.objectContaining({voided: false, provider: surgicalBlock.provider, location: surgicalBlock.location}));
        expect(messagingService.showMessage).toHaveBeenCalledWith('info', "{{'OT_SAVE_SUCCESS_MESSAGE_KEY' | translate}}");
        expect(state.go).toHaveBeenCalledWith('editSurgicalAppointment', {surgicalBlockUuid: surgicalBlock.uuid});
        done();
    });


    it("should update a valid surgical form", function (done) {
        var surgicalBlock = {};
        surgicalBlock.id = 10;
        surgicalBlock.uuid = "surgicalBlockUuid";
        surgicalBlock.voided = false;
        surgicalBlock.startDatetime = new Date(2017, 1, 29, 2, 11);
        surgicalBlock.endDatetime = new Date(2017, 1, 30, 3, 11);
        surgicalBlock.provider = {uuid: "providerUuid"};
        surgicalBlock.location = {uuid: "locationUuid"};
        surgicalBlock.surgicalAppointments = [{id: "11", patient: {uuid: "patientUuid"}, notes: "need more assistants", sortWeight: 0, surgicalAppointmentAttributes: openmrsSurgicalAppointmentAttributes}];

        surgicalAppointmentService.updateSurgicalBlock.and.returnValue(specUtil.simplePromise({data: surgicalBlock}));
        spinner.forPromise.and.returnValue(specUtil.simplePromise({data: surgicalBlock}));

        createController();

        scope.createSurgicalBlockForm = {};
        scope.createSurgicalBlockForm.$valid = true;
        scope.surgicalForm = {};
        scope.surgicalForm.id = 10;
        scope.surgicalForm.uuid = "someUuid";
        scope.surgicalForm.startDatetime = new Date(2017, 1, 29, 2, 11);
        scope.surgicalForm.endDatetime = new Date(2017, 1, 30, 3, 11);
        scope.surgicalForm.provider = {uuid: "providerUuid"};
        scope.surgicalForm.location = {uuid: "locationUuid"};
        scope.surgicalForm.surgicalAppointments = [{id: "11", patient: {uuid: "patientUuid"}, notes: "need more assistants", sortWeight: 0, surgicalAppointmentAttributes: uiSurgicalAppointmentAttributes}];

        scope.saveAnywaysFlag = true;
        scope.save(scope.surgicalForm);

        expect(surgicalAppointmentService.updateSurgicalBlock).toHaveBeenCalled();
        expect(surgicalAppointmentService.updateSurgicalBlock).toHaveBeenCalledWith(jasmine.objectContaining({id:10, voided: false, provider: surgicalBlock.provider, location: surgicalBlock.location}));
        expect(messagingService.showMessage).toHaveBeenCalledWith('info', "{{'OT_SAVE_SUCCESS_MESSAGE_KEY' | translate}}");
        expect(state.go).toHaveBeenCalledWith('editSurgicalAppointment', {surgicalBlockUuid: surgicalBlock.uuid});
        done();
    });

    it("should get the patient name of surgical appointment", function () {
        createController();
        var surgicalAppointment = {id: "12", patient: {uuid: "patientUuid2", display: "I02345 - Ad hasan"}, notes: "need more assistants and blood", surgicalAppointmentAttributes: defaultSurgicalAppointmentAttributes};
        expect(scope.getPatientName(surgicalAppointment)).toEqual("Ad hasan ( I02345 )");
        surgicalAppointment.patient.value = "Ad hasan Mohammed";
        expect(scope.getPatientName(surgicalAppointment)).toEqual("Ad hasan Mohammed");

    });

    it("should go to home page", function () {
        createController();
        scope.gotoCalendarPage();

        expect(state.go).toHaveBeenCalledWith('otScheduling', jasmine.any(Object));
    });

    it("should open an ngDialog with data of given surgical appointment", function () {
        createController();
        var surgicalAppointment = {id: "11", patient: {uuid: "patientUuid"}, notes: "need more assistants", sortWeight: 0, surgicalAppointmentAttributes: uiSurgicalAppointmentAttributes};
        scope.addNewSurgicalAppointment(surgicalAppointment);

        expect(ngDialog.open).toHaveBeenCalledWith(jasmine.objectContaining({
            template: "views/surgicalAppointment.html",
            controller: "NewSurgicalAppointmentController",
            closeByDocument: false,
            className: 'ngdialog-theme-default surgical-appointment-dialog',
            showClose: true,
            closeByNavigation: true,
            scope: scope,
            data: surgicalAppointment
        }));
    });

    it("should open an ngDialog with data of given surgical appointment for editing the the appointment", function () {
        createController();
        var surgicalAppointment = {id: "11", patient: {uuid: "patientUuid"}, notes: "need more assistants", sortWeight: 0, surgicalAppointmentAttributes: uiSurgicalAppointmentAttributes, isBeingEdited: true};
        scope.editAppointment(surgicalAppointment);

        expect(ngDialog.open).toHaveBeenCalledWith(jasmine.objectContaining({
            template: "views/surgicalAppointment.html",
            controller: "NewSurgicalAppointmentController",
            closeByDocument: false,
            className: 'ngdialog-theme-default surgical-appointment-dialog',
            showClose: true,
            closeByNavigation: true,
            scope: scope,
            data: surgicalAppointment
        }));
    });

    it("should throw an error if the newly added surgical appointment is not fitting into the surgical block time", function () {
        createController();

        scope.surgicalForm = {};
        scope.surgicalForm.id = 10;
        scope.surgicalForm.startDatetime = new Date(2017, 1, 30, 2, 10);
        scope.surgicalForm.endDatetime = new Date(2017, 1, 30, 4, 0);
        scope.surgicalForm.provider = {uuid: "providerUuid"};
        scope.surgicalForm.location = {uuid: "locationUuid"};
        scope.surgicalForm.surgicalAppointments = [{id: "11", patient: {uuid: "patientUuid"}, notes: "need more assistants", sortWeight: 0, surgicalAppointmentAttributes: uiSurgicalAppointmentAttributes}];
        var newSurgicalAppointment = {id: "12", patient: {uuid: "patientUuid2"}, notes: "need more assistants and blood", surgicalAppointmentAttributes: defaultSurgicalAppointmentAttributes};

        scope.addSurgicalAppointment(newSurgicalAppointment);

        expect(messagingService.showMessage).toHaveBeenCalledWith('error', "{{'OT_SURGICAL_APPOINTMENT_EXCEEDS_BLOCK_DURATION' | translate}}");
    });

    it("should throw an error if the existing surgical appointment duration is modified and it is not fitting into the surgical block time", function () {
        createController();

        scope.surgicalForm = {};
        scope.surgicalForm.id = 10;
        scope.surgicalForm.startDatetime = new Date(2017, 1, 30, 1, 0);
        scope.surgicalForm.endDatetime = new Date(2017, 1, 30, 4, 0);
        scope.surgicalForm.provider = {uuid: "providerUuid"};
        scope.surgicalForm.location = {uuid: "locationUuid"};
        var newSurgicalAppointment = {id: "12", patient: {uuid: "patientUuid2"}, notes: "need more assistants and blood", sortWeight: 1, surgicalAppointmentAttributes: defaultSurgicalAppointmentAttributes};

        scope.surgicalForm.surgicalAppointments = [{id: "11", patient: {uuid: "patientUuid"}, notes: "need more assistants", sortWeight: 0, surgicalAppointmentAttributes: uiSurgicalAppointmentAttributes}, newSurgicalAppointment];


        var clonedSurgicalAppointment = _.cloneDeep(newSurgicalAppointment);
        clonedSurgicalAppointment.surgicalAppointmentAttributes.estTimeHours.value = "1";
        clonedSurgicalAppointment.surgicalAppointmentAttributes.estTimeMinutes.value = "30";
        scope.addSurgicalAppointment(clonedSurgicalAppointment);

        expect(messagingService.showMessage).toHaveBeenCalledWith('error', "{{'OT_SURGICAL_APPOINTMENT_EXCEEDS_BLOCK_DURATION' | translate}}");
    });

    it("should add the surgical appointment if the newly added surgical appointment is fitting into the surgical block time", function () {
        createController();

        scope.surgicalForm = {};
        scope.surgicalForm.id = 10;
        scope.surgicalForm.startDatetime = new Date(2017, 1, 30, 2, 0);
        scope.surgicalForm.endDatetime = new Date(2017, 1, 30, 4, 30);
        scope.surgicalForm.provider = {uuid: "providerUuid"};
        scope.surgicalForm.location = {uuid: "locationUuid"};
        scope.surgicalForm.surgicalAppointments = [{id: "11", patient: {uuid: "patientUuid"}, notes: "need more assistants", sortWeight: 0, surgicalAppointmentAttributes: uiSurgicalAppointmentAttributes}];
        var newSurgicalAppointment = {id: undefined, patient: {uuid: "patientUuid2"}, notes: "need more assistants and blood", surgicalAppointmentAttributes: defaultSurgicalAppointmentAttributes};

        scope.addSurgicalAppointment(newSurgicalAppointment);

        expect(scope.surgicalForm.surgicalAppointments.length).toEqual(2);
        expect(scope.surgicalForm.surgicalAppointments[1]).toBe(newSurgicalAppointment);
        expect(scope.surgicalForm.surgicalAppointments[1].sortWeight).toEqual(1);
        expect(scope.availableBlockDuration).toEqual("0 hr 30 mins");
        expect(ngDialog.close).toHaveBeenCalled();
    });

    it("should update the existing appointment with updated values if it is fitting into the surgical block time", function () {
        createController();

        scope.surgicalForm = {};
        scope.surgicalForm.id = 10;
        scope.surgicalForm.startDatetime = new Date(2017, 1, 30, 1, 0);
        scope.surgicalForm.endDatetime = new Date(2017, 1, 30, 4, 0);
        scope.surgicalForm.provider = {uuid: "providerUuid"};
        scope.surgicalForm.location = {uuid: "locationUuid"};
        var newSurgicalAppointment = {id: "12", patient: {uuid: "patientUuid2"}, notes: "need more assistants and blood", sortWeight: 1, surgicalAppointmentAttributes: defaultSurgicalAppointmentAttributes, isBeingEdited: true};

        scope.surgicalForm.surgicalAppointments = [{id: "11", patient: {uuid: "patientUuid"}, notes: "need more assistants", sortWeight: 0, surgicalAppointmentAttributes: uiSurgicalAppointmentAttributes}, newSurgicalAppointment];

        var clonedSurgicalAppointment = _.cloneDeep(newSurgicalAppointment);
        clonedSurgicalAppointment.surgicalAppointmentAttributes.estTimeMinutes.value = "30";
        clonedSurgicalAppointment.surgicalAppointmentAttributes.procedure.value = "surgery on left leg";
        clonedSurgicalAppointment.notes = "assistants are not needed";
        scope.addSurgicalAppointment(clonedSurgicalAppointment);

        expect(scope.surgicalForm.surgicalAppointments.length).toEqual(2);
        expect(scope.surgicalForm.surgicalAppointments[1].sortWeight).toEqual(1);
        expect(scope.surgicalForm.surgicalAppointments[1].isDirty).toBeTruthy();
        expect(scope.surgicalForm.surgicalAppointments[1].notes).toEqual("assistants are not needed");
        expect(scope.surgicalForm.surgicalAppointments[1].surgicalAppointmentAttributes.procedure.value).toEqual("surgery on left leg");
        expect(scope.surgicalForm.surgicalAppointments[1].surgicalAppointmentAttributes.estTimeMinutes.value).toEqual("30");
        expect(scope.surgicalForm.surgicalAppointments[1].surgicalAppointmentAttributes.estTimeHours.value).toEqual("0");
        expect(scope.availableBlockDuration).toEqual("0 hr 30 mins");
        expect(ngDialog.close).toHaveBeenCalled();
    });

    it("should initialize the controller and map the surgical block from the server format to surgical form for UI, and should map the remaining attribute apart from the saved ones from attribute types", function () {
        var surgicalBlock = {};
        surgicalBlock.id = 10;
        surgicalBlock.uuid = "surgicalBlockUuid";
        surgicalBlock.voided = false;
        surgicalBlock.startDatetime = new Date(2017, 1, 29, 2, 11);
        surgicalBlock.endDatetime = new Date(2017, 1, 30, 3, 11);
        surgicalBlock.provider = {uuid: "providerUuid"};
        surgicalBlock.location = {uuid: "locationUuid"};
        var attributes = [{
            "id": 107,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde92009-3f81-11e7-97ea-0800274a5156",
                "name": "surgicalAssistant"
            },
            "value": "Dr. yaya"
        }, {
            "id": 108,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde7e794-3f81-11e7-97ea-0800274a5156",
                "name": "procedure"
            },
            "value": "surgery on left leg"
        }];
        surgicalBlock.surgicalAppointments = [{id: 11, status: "SCHEDULED", patient: {uuid: "patientUuid"}, sortWeight: 0, surgicalAppointmentAttributes: attributes}];

        surgicalAppointmentService.getSurgicalBlockFor.and.returnValue(specUtil.simplePromise({data: surgicalBlock}));
        stateParams.surgicalBlockUuid = "surgicalBlockUuid";

        createController();

        expect(scope.surgeons).toEqual([{uuid: "uuid1", person: {display: "provider1"}}, {uuid: "uuid2", person: {display: "provider2"}}]);
        expect(scope.locations).toEqual([{uuid: "uuid1", name: "location1"}, {uuid: "uuid2", name: "location2"}]);
        expect(scope.attributeTypes).toEqual(appointmentAttributeTypes.data.results);
        expect(scope.surgicalForm).not.toBeUndefined();
        expect(scope.surgicalForm.id).toBe(10);
        expect(scope.surgicalForm.uuid).toBe("surgicalBlockUuid");
        expect(scope.surgicalForm.voided).toBeFalsy();
        expect(scope.surgicalForm.uuid).toBe("surgicalBlockUuid");
        expect(scope.surgicalForm.provider).toEqual({uuid: "providerUuid"});
        expect(scope.surgicalForm.location).toEqual({uuid: "locationUuid"});
        expect(scope.surgicalForm.surgicalAppointments.length).toBe(1);
        expect(scope.surgicalForm.surgicalAppointments[0].id).toBe(11);
        expect(scope.surgicalForm.surgicalAppointments[0].patient).toEqual({uuid: "patientUuid"});
        expect(scope.surgicalForm.surgicalAppointments[0].sortWeight).toBe(0);
        expect(_.keys(scope.surgicalForm.surgicalAppointments[0].surgicalAppointmentAttributes).length).toBe(9);
        expect(scope.surgicalForm.surgicalAppointments[0].surgicalAppointmentAttributes.cleaningTime.value).toBe(15);
        expect(scope.surgicalForm.surgicalAppointments[0].surgicalAppointmentAttributes.estTimeMinutes.value).toBe(0);
        expect(scope.surgicalForm.surgicalAppointments[0].surgicalAppointmentAttributes.estTimeHours.value).toBe(0);
        expect(scope.surgicalForm.surgicalAppointments[0].surgicalAppointmentAttributes.surgicalAssistant.value).toBe("Dr. yaya");
        expect(scope.surgicalForm.surgicalAppointments[0].surgicalAppointmentAttributes.procedure.value).toBe("surgery on left leg");
    });

    it("should update the sort weight of surgical appointments with the index of the appointment", function () {
        createController();
        scope.surgicalForm = {};
        scope.surgicalForm.surgicalAppointments = [{id:3, sortWeight:1},{id:1, sortWeight:0}, {id:2, sortWeight:2}];

        scope.updateSortWeight(scope.surgicalForm);

        expect(scope.surgicalForm.surgicalAppointments[0].id).toBe(3);
        expect(scope.surgicalForm.surgicalAppointments[0].sortWeight).toBe(0);
        expect(scope.surgicalForm.surgicalAppointments[1].id).toBe(1);
        expect(scope.surgicalForm.surgicalAppointments[1].sortWeight).toBe(1);
        expect(scope.surgicalForm.surgicalAppointments[2].id).toBe(2);
        expect(scope.surgicalForm.surgicalAppointments[2].sortWeight).toBe(2);
    });

    it("should open the surgical appointment for edit when appointment id is provided in stateparams", function () {
        var surgicalBlock = {};
        surgicalBlock.uuid = "surgicalBlockUuid";
        surgicalBlock.voided = false;
        surgicalBlock.surgicalAppointments = [
            {
                id: 11,
                patient: {uuid: "patientUuid"},
                notes: "need more assistants",
                sortWeight: 0,
                status: "SCHEDULED",
                surgicalAppointmentAttributes: []
            },
            {
                id: 12,
                patient: {uuid: "patientUuid"},
                notes: "need more assistants",
                sortWeight: 1,
                surgicalAppointmentAttributes: []
            }
        ];

        surgicalAppointmentService.getSurgicalBlockFor.and.returnValue(specUtil.simplePromise({data: surgicalBlock}));
        stateParams.surgicalBlockUuid = "surgicalBlockUuid";
        stateParams.surgicalAppointmentId = 11;

        createController();

        expect(ngDialog.open).toHaveBeenCalledWith(jasmine.objectContaining({
            template: "views/surgicalAppointment.html",
            controller: "NewSurgicalAppointmentController",
            closeByDocument: false,
            className: 'ngdialog-theme-default surgical-appointment-dialog',
            showClose: true,
            scope: scope,
            data: _.omit(scope.surgicalForm.surgicalAppointments[0], ['isBeingEdited'])
        }));
    });

    it('should open an ngDialog with data of given surgical appointment for cancelling an appointment', function () {
        createController();
        var surgicalAppointment = {id: "11", patient: {uuid: "patientUuid"}, status: "SCHEDULED", notes: "need more assistants", sortWeight: 0, surgicalAppointmentAttributes: uiSurgicalAppointmentAttributes};
        scope.cancelAppointment(surgicalAppointment);

        expect(ngDialog.open).toHaveBeenCalledWith(jasmine.objectContaining({
            template: "views/cancelAppointment.html",
            controller: "surgicalBlockViewCancelAppointmentController",
            closeByDocument: false,
            showClose: true,
            className: 'ngdialog-theme-default ng-dialog-adt-popUp',
            scope: scope,
            data: { surgicalAppointment: surgicalAppointment, surgicalForm:  scope.surgicalForm, updateAvailableBlockDurationFn: jasmine.any(Function)}
        }));
    });

    it('should disable the cancel block button when surgical block has completed appointments', function () {
        createController();
        scope.surgicalForm = {id: 1, surgicalAppointments: [ {id:1, status: 'COMPLETED'}, {id:2, status:'CANCELLED'}]};

        expect(scope.cancelDisabled()).toEqual({id:1, status: 'COMPLETED'});
    });

    it('should disable the cancel block button when surgical block is not saved', function () {
        createController();
        scope.surgicalForm = {surgicalAppointments: [ {id:1, status: 'COMPLETED'}, {id:2, status:'CANCELLED'}]};

        expect(scope.cancelDisabled()).toBeTruthy();
    });

    it('should populate end date if start date is entered and end date is undefined', function () {
        createController();
        scope.surgicalForm.startDatetime = toDate('2017-07-03 09:00:00');
        scope.surgicalForm.endDatetime = undefined;
        scope.changeInStartDateTime();
        expect(scope.surgicalForm.endDatetime).toEqual(toDate('2017-07-03 18:00:00'));
    });

    it('should not populate end date if start date is entered and end date in already present', function () {
        createController();
        scope.surgicalForm.endDatetime = new Date("Mon Jul 03 2017 15:00:00 GMT+0530 (IST)");
        scope.surgicalForm.startDatetime = new Date("Mon Jul 03 2017 09:00:00 GMT+0530 (IST)");
        scope.changeInStartDateTime();
        expect(scope.surgicalForm.endDatetime).toEqual(new Date("Mon Jul 03 2017 15:00:00 GMT+0530 (IST)"));
    });

    it("should remove isBeingEdited field for other appointments which are not selected", function () {
        createController();
        scope.surgicalForm = {uuid: "someUUID", startDatetime:new Date("Mon Jul 03 2017 09:00:00 GMT+0530 (IST)"), endDatetime:new Date("Mon Jul 03 2017 15:00:00 GMT+0530 (IST)")};
        var surgicalAppointment = {
            id: 12,
            patient: {uuid: "patientUuid"},
            notes: "need more assistants",
            sortWeight: 1,
            surgicalAppointmentAttributes: []
        };
        scope.surgicalForm.surgicalAppointments = [
            {
                id: 11,
                patient: {uuid: "patientUuid"},
                notes: "need more assistants",
                sortWeight: 0,
                status: "SCHEDULED",
                surgicalAppointmentAttributes: [],
                isBeingEdited: true
            },
            surgicalAppointment
        ];
        scope.editAppointment(surgicalAppointment);
        expect(scope.surgicalForm.surgicalAppointments[0].isBeingEdited).toBeUndefined();
    });

    it('should return surgery attributes from config', function () {
        appDescriptor.getConfigValue.and.returnValue(['procedure', 'surgicalAssistant']);

        createController();
        expect(appDescriptor.getConfigValue).toHaveBeenCalledWith('surgeryAttributes');
        expect(scope.configuredSurgeryAttributeNames.length).toBe(2);
        expect(scope.configuredSurgeryAttributeNames[0]).toBe('procedure');
        expect(scope.configuredSurgeryAttributeNames[1]).toBe('surgicalAssistant');

    });

    describe('isSurgeryAttributesConfigurationAvailableAndValid', function () {
        it('should return true if "surgeryAttributes" configuration is available', function () {
            createController();
            scope.configuredSurgeryAttributeNames = ["procedure", "surgicalAssistant"];
            expect(scope.isSurgeryAttributesConfigurationAvailableAndValid()).toBeTruthy();

        });

        it('should return false if "surgeryAttributes" configuration is not defined', function () {
            createController();
            scope.configuredSurgeryAttributeNames = undefined;
            expect(scope.isSurgeryAttributesConfigurationAvailableAndValid()).toBeFalsy();
        });

        it('should return false if "surgeryAttributes" configuration is an empty array', function () {
            createController();
            scope.configuredSurgeryAttributeNames = [];
            expect(scope.isSurgeryAttributesConfigurationAvailableAndValid()).toBeFalsy();
        });
    });

    it('should get configured surgery attributes', function () {
        createController();
        scope.configuredSurgeryAttributeNames = ["surgicalAssistant", "procedure"];
        var attributes = {
            procedure: {surgicalAppointmentAttributeType: {name: 'procedure'}},
            surgicalAssistant: {surgicalAppointmentAttributeType: {name: 'surgicalAssistant'}},
            cleaningTime: {surgicalAppointmentAttributeType: {name: 'cleaningTime'}}
        };

        var expectedAttributes = {
            procedure: {surgicalAppointmentAttributeType: {name: 'procedure'}},
            surgicalAssistant: {surgicalAppointmentAttributeType: {name: 'surgicalAssistant'}}
        };
        var configuredAttributes = scope.getConfiguredAttributes(attributes);
        expect(_.isEqual(expectedAttributes, configuredAttributes)).toBeTruthy();
    });

    it('should sort attributes by "attributeTypes"', function () {
        var attributes = {
            procedure: {surgicalAppointmentAttributeType: {name: 'procedure'}},
            surgicalAssistant: {surgicalAppointmentAttributeType: {name: 'surgicalAssistant'}},
            cleaningTime: {surgicalAppointmentAttributeType: {name: 'cleaningTime'}},
            estTimeHours: {surgicalAppointmentAttributeType: {name: 'estTimeHours'}},
            estTimeMinutes: {surgicalAppointmentAttributeType: {name: 'estTimeMinutes'}},
            Notes: {surgicalAppointmentAttributeType: {name: 'Notes'}}
        };
        var attributesTypes = [{"uuid": "34c1cace-7367-11e7-a46a-000c29e530d2", "name": "procedure"},
            {"uuid": "34c1e03b-7367-11e7-a46a-000c29e530d2", "name": "Notes"},
            {"uuid": "34c26d4b-7367-11e7-a46a-000c29e530d5", "name": "estTimeHours"},
            {"uuid": "34c26d4b-7367-11e7-a46a-000c29e530d3", "name": "estTimeMinutes"},
            {"uuid": "34c26d4b-7367-11e7-a46a-000c29e530d8", "name": "cleaningTime"}];

        var expectedAttributes = {
            procedure: {surgicalAppointmentAttributeType: {name: 'procedure'}},
            Notes: {surgicalAppointmentAttributeType: {name: 'Notes'}},
            estTimeHours: {surgicalAppointmentAttributeType: {name: 'estTimeHours'}},
            estTimeMinutes: {surgicalAppointmentAttributeType: {name: 'estTimeMinutes'}},
            cleaningTime: {surgicalAppointmentAttributeType: {name: 'cleaningTime'}}
        };

        createController();

        scope.attributeTypes = attributesTypes;

        var finalAttributes = scope.sort(attributes);

        expect(_.isEqual(expectedAttributes, finalAttributes)).toBeTruthy();
    });

});
