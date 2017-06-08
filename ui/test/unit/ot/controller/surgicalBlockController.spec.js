'use strict';

describe("surgicalBlockController", function () {
    var scope, controller, surgicalAppointmentHelper, stateParams = {};
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
    var surgicalAppointmentService = jasmine.createSpyObj('surgicalAppointmentService', ['getSurgeons', 'saveSurgicalBlock', 'getSurgicalAppointmentAttributeTypes', 'getSurgicalBlockFor']);
    var locationService = jasmine.createSpyObj('locationService', ['getAllByTag']);

    var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
    var appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
    var messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
    var ngDialog = jasmine.createSpyObj('ngDialog', ['open', 'close']);
    appService.getAppDescriptor.and.returnValue(appDescriptor);

    appDescriptor.getConfigValue.and.callFake(function (value) {
        if (value == 'primarySurgeonsForOT') {
            return ["uuid1", "uuid2"];
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

    var surgeonList = {data: {results: [{uuid: "uuid1", name: "provider1"}, {uuid: "uuid2", name: "provider2"}]}};
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
        inject(function ($controller, $rootScope, _surgicalAppointmentHelper_) {
            controller = $controller;
            scope = $rootScope.$new();
            surgicalAppointmentHelper = _surgicalAppointmentHelper_;
        });
    });

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
        surgicalBlock.id = 10;
        surgicalBlock.uuid = "surgicalBlockUuid";
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
        scope.surgicalForm.id = 10;
        scope.surgicalForm.startDatetime = new Date(2017, 1, 29, 2, 11);
        scope.surgicalForm.endDatetime = new Date(2017, 1, 30, 3, 11);
        scope.surgicalForm.provider = {uuid: "providerUuid"};
        scope.surgicalForm.location = {uuid: "locationUuid"};
        scope.surgicalForm.surgicalAppointments = [{id: "11", patient: {uuid: "patientUuid"}, notes: "need more assistants", sortWeight: 0, surgicalAppointmentAttributes: uiSurgicalAppointmentAttributes}];

        scope.save(scope.surgicalForm);

        expect(surgicalAppointmentService.saveSurgicalBlock).toHaveBeenCalled();
        expect(surgicalAppointmentService.saveSurgicalBlock).toHaveBeenCalledWith(jasmine.objectContaining({id:10, voided: false, provider: surgicalBlock.provider, location: surgicalBlock.location}));
        expect(messagingService.showMessage).toHaveBeenCalledWith('info', "{{'OT_SAVE_SUCCESS_MESSAGE_KEY' | translate}}");
        expect(state.go).toHaveBeenCalledWith('editSurgicalAppointment', {surgicalBlockUuid: surgicalBlock.uuid});
        done();
    });

    it("should get the pateint name of surgical appointment", function () {
        createController();
        var surgicalAppointment = {id: "12", patient: {uuid: "patientUuid2", display: "Ad hasan"}, notes: "need more assistants and blood", surgicalAppointmentAttributes: defaultSurgicalAppointmentAttributes};
        expect(scope.getPatientName(surgicalAppointment)).toEqual("Ad hasan");
        surgicalAppointment.patient.value = "Ad hasan Mohammed";
        expect(scope.getPatientName(surgicalAppointment)).toEqual("Ad hasan Mohammed");

    });

    it("should go to home page", function () {
        createController();
        scope.goToHome();

        expect(state.go).toHaveBeenCalledWith('home', jasmine.any(Object));
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
            scope: scope,
            data: surgicalAppointment
        }));
    });

    it("should open an ngDialog with data of given surgical appointment for editing the the appointment", function () {
        createController();
        var surgicalAppointment = {id: "11", patient: {uuid: "patientUuid"}, notes: "need more assistants", sortWeight: 0, surgicalAppointmentAttributes: uiSurgicalAppointmentAttributes};
        scope.editAppointment(surgicalAppointment);

        expect(ngDialog.open).toHaveBeenCalledWith(jasmine.objectContaining({
            template: "views/surgicalAppointment.html",
            controller: "NewSurgicalAppointmentController",
            closeByDocument: false,
            className: 'ngdialog-theme-default surgical-appointment-dialog',
            showClose: true,
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
        var newSurgicalAppointment = {id: "12", patient: {uuid: "patientUuid2"}, notes: "need more assistants and blood", surgicalAppointmentAttributes: defaultSurgicalAppointmentAttributes};

        scope.addSurgicalAppointment(newSurgicalAppointment);

        expect(scope.surgicalForm.surgicalAppointments.length).toEqual(2);
        expect(scope.surgicalForm.surgicalAppointments[1]).toBe(newSurgicalAppointment);
        expect(scope.surgicalForm.surgicalAppointments[1].sortWeight).toEqual(1);
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
        var newSurgicalAppointment = {id: "12", patient: {uuid: "patientUuid2"}, notes: "need more assistants and blood", sortWeight: 1, surgicalAppointmentAttributes: defaultSurgicalAppointmentAttributes};

        scope.surgicalForm.surgicalAppointments = [{id: "11", patient: {uuid: "patientUuid"}, notes: "need more assistants", sortWeight: 0, surgicalAppointmentAttributes: uiSurgicalAppointmentAttributes}, newSurgicalAppointment];

        var clonedSurgicalAppointment = _.cloneDeep(newSurgicalAppointment);
        clonedSurgicalAppointment.surgicalAppointmentAttributes.estTimeMinutes.value = "30";
        clonedSurgicalAppointment.surgicalAppointmentAttributes.procedure.value = "surgery on left leg";
        clonedSurgicalAppointment.notes = "assistants are not needed";
        scope.addSurgicalAppointment(clonedSurgicalAppointment);

        expect(scope.surgicalForm.surgicalAppointments.length).toEqual(2);
        expect(scope.surgicalForm.surgicalAppointments[1]).toBe(newSurgicalAppointment);
        expect(scope.surgicalForm.surgicalAppointments[1].sortWeight).toEqual(1);
        expect(scope.surgicalForm.surgicalAppointments[1].notes).toEqual("assistants are not needed");
        expect(scope.surgicalForm.surgicalAppointments[1].surgicalAppointmentAttributes.procedure.value).toEqual("surgery on left leg");
        expect(scope.surgicalForm.surgicalAppointments[1].surgicalAppointmentAttributes.estTimeMinutes.value).toEqual("30");
        expect(scope.surgicalForm.surgicalAppointments[1].surgicalAppointmentAttributes.estTimeHours.value).toEqual("0");
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
        surgicalBlock.surgicalAppointments = [{id: 11, patient: {uuid: "patientUuid"}, sortWeight: 0, surgicalAppointmentAttributes: attributes}];

        surgicalAppointmentService.getSurgicalBlockFor.and.returnValue(specUtil.simplePromise({data: surgicalBlock}));
        stateParams.surgicalBlockUuid = "surgicalBlockUuid";

        createController();

        expect(scope.surgeons).toEqual([{uuid: "uuid1", name: "provider1"}, {uuid: "uuid2", name: "provider2"}]);
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

        scope.updateSortWeight();

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
            data: scope.surgicalForm.surgicalAppointments[0]
        }));
    });
});
