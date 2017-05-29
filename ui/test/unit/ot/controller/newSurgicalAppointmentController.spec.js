'use strict';

describe("newSurgicalAppointmentController", function () {
    var scope, controller, q, surgicalAppointmentHelper;
    q = jasmine.createSpyObj('$q', ['all', 'when']);
    var patientService = jasmine.createSpyObj('patientService', ['search']);
    var spinner = jasmine.createSpyObj('spinner', ['forPromise', 'then', 'catch']);
    var messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
    var surgicalAppointmentService = jasmine.createSpyObj('surgicalAppointmentService', ['getSurgeons', 'saveSurgicalBlock', 'getSurgicalAppointmentAttributeTypes']);
    var ngDialog = jasmine.createSpyObj('ngDialog', ['close']);


    var attributeTypes = {
        "results": [
            {
                "uuid": "25ef8484-3a1f-11e7-83f8-0800274a5156",
                "name": "procedure"
            },
            {
                "uuid": "25ef9562-3a1f-11e7-83f8-0800274a5156",
                "name": "estTimeHours"
            },
            {
                "uuid": "25efa512-3a1f-11e7-83f8-0800274a5156",
                "name": "estTimeMinutes"
            },
            {
                "uuid": "25efb2ef-3a1f-11e7-83f8-0800274a5156",
                "name": "cleaningTime"
            },
            {
                "uuid": "25efd013-3a1f-11e7-83f8-0800274a5156",
                "name": "otherSurgeon"
            },
            {
                "uuid": "25efdf1b-3a1f-11e7-83f8-0800274a5156",
                "name": "surgicalAssistant"
            },
            {
                "uuid": "25efec33-3a1f-11e7-83f8-0800274a5156",
                "name": "anaesthetist"
            },
            {
                "uuid": "25eff89a-3a1f-11e7-83f8-0800274a5156",
                "name": "scrubNurse"
            },
            {
                "uuid": "25f0060e-3a1f-11e7-83f8-0800274a5156",
                "name": "circulatingNurse"
            }
        ]
    };
    q.all.and.returnValue(specUtil.simplePromise([{data: attributeTypes}]));
    spinner.forPromise.and.returnValue(specUtil.createFakePromise({}));
    patientService.search.and.returnValue(specUtil.simplePromise({data: {pageOfResults: [{name: "patient1 uuid"}, {name: "patient"}]}}));
    surgicalAppointmentService.getSurgicalAppointmentAttributeTypes.and.returnValue(specUtil.simplePromise({data: attributeTypes}));
    surgicalAppointmentService.getSurgeons.and.callFake(function () {
        return {data: {results: [{uuid: "uuid1", name: "provider1"}, {uuid: "uuid2", name: "provider2"}]}};
    });

    beforeEach(function () {
        module('bahmni.ot');
        inject(function ($controller, $rootScope, _surgicalAppointmentHelper_) {
            controller = $controller;
            scope = $rootScope.$new();
            surgicalAppointmentHelper = _surgicalAppointmentHelper_;
        });
    });

    var createController = function () {
        controller('NewSurgicalAppointmentController', {
            $scope: scope,
            $q: q,
            spinner: spinner,
            surgicalAppointmentService: surgicalAppointmentService,
            patientService: patientService,
            messagingService: messagingService,
            surgicalAppointmentHelper: surgicalAppointmentHelper,
            ngDialog: ngDialog
        });
    };

    it("should map the display name for patients", function () {
        var patients = [{givenName: "Natsume", familyName: "Hyuga", identifier: "IQ12345"},
            {givenName: "Sakura", familyName: "Mikan", identifier: "IQ12346"}];

        createController();
        var patientsWithDisplayName = scope.responseMap(patients);

        expect(patientsWithDisplayName.length).toEqual(2);
        expect(patientsWithDisplayName[0].label).toEqual("Natsume Hyuga (IQ12345)");
        expect(patientsWithDisplayName[1].label).toEqual("Sakura Mikan (IQ12346)");
    });

    it("should save data in proper format ", function () {
        scope.ngDialogData = {id: 1, sortWeight: 0, notes: "need more assistants", patient: {uuid:"patientUuid", display: "firstName lastName", person: {given_name: "firstName", family_name: "lastName"}}};
        createController();
        scope.addSurgicalAppointment = jasmine.createSpy("addSurgicalAppointment");
        scope.surgicalAppointmentForm = {$valid: true};

        scope.createAppointmentAndAdd();

        var appointment = {
            id: 1,
            patient: scope.ngDialogData.patient,
            notes: "need more assistants",
            sortWeight: 0,
            surgicalAppointmentAttributes: {
                procedure: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25ef8484-3a1f-11e7-83f8-0800274a5156',
                        name: 'procedure'
                    }
                },
                cleaningTime: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25efb2ef-3a1f-11e7-83f8-0800274a5156',
                        name: 'cleaningTime'
                    }, value: 15
                },
                estTimeMinutes: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25efa512-3a1f-11e7-83f8-0800274a5156',
                        name: 'estTimeMinutes'
                    }, value: 0
                },
                estTimeHours: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25ef9562-3a1f-11e7-83f8-0800274a5156',
                        name: 'estTimeHours'
                    }, value: 0
                },
                otherSurgeon: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25efd013-3a1f-11e7-83f8-0800274a5156',
                        name: 'otherSurgeon'
                    }
                },
                surgicalAssistant: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25efdf1b-3a1f-11e7-83f8-0800274a5156',
                        name: 'surgicalAssistant'
                    }
                },
                anaesthetist: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25efec33-3a1f-11e7-83f8-0800274a5156',
                        name: 'anaesthetist'
                    }
                },
                scrubNurse: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25eff89a-3a1f-11e7-83f8-0800274a5156',
                        name: 'scrubNurse'
                    }
                },
                circulatingNurse: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25f0060e-3a1f-11e7-83f8-0800274a5156',
                        name: 'circulatingNurse'
                    }
                }
            }
        };

        expect(scope.addSurgicalAppointment).toHaveBeenCalledWith(appointment);
        expect(q.when).toHaveBeenCalled();
    });

    it("should search the patient, when patientinfo passed to it", function () {
        createController();
        scope.patient = "pa";
        scope.search();
        expect(patientService.search).toHaveBeenCalledWith("pa");

    });

    it("should close the dialog when clicked on close", function () {
        createController();
        scope.close();
        expect(ngDialog.close).toHaveBeenCalled();
    });

    it("should initialize scope variables for appointment with data from the dialogData in edit appointment mode", function () {
        var ngDialogData = {id: 1, sortWeight: 0, notes: "need more assistants", patient: {uuid:"patientUuid", display: "firstName lastName", person: {given_name: "firstName", family_name: "lastName"}}};
        ngDialogData.surgicalAppointmentAttributes = {surgicalAppointmentAttributeType:{uuid: "25ef8484-3a1f-11e7-83f8-0800274a5156", name: "procedure"}, value: "surgery on left leg"};
        scope.ngDialogData = ngDialogData;

        createController();

        expect(scope.attributes).toBe(ngDialogData.surgicalAppointmentAttributes);
        expect(scope.attributeTypes).toBe(attributeTypes.results);
        expect(scope.notes).toBe("need more assistants");
        expect(scope.selectedPatient).toBe(ngDialogData.patient);
    });

    it("should only initialize the attributes, attributeTypes, when dialogData is not provided, in create appointment mode", function () {
        var ngDialogData = {};
        var surgicalAppointmentAttributes ={
            procedure: {
                surgicalAppointmentAttributeType: {
                    uuid: '25ef8484-3a1f-11e7-83f8-0800274a5156',
                    name: 'procedure'
                }
            },
            cleaningTime: {
                surgicalAppointmentAttributeType: {
                    uuid: '25efb2ef-3a1f-11e7-83f8-0800274a5156',
                    name: 'cleaningTime'
                }, value: 15
            },
            estTimeMinutes: {
                surgicalAppointmentAttributeType: {
                    uuid: '25efa512-3a1f-11e7-83f8-0800274a5156',
                    name: 'estTimeMinutes'
                }, value: 0
            },
            estTimeHours: {
                surgicalAppointmentAttributeType: {
                    uuid: '25ef9562-3a1f-11e7-83f8-0800274a5156',
                    name: 'estTimeHours'
                }, value: 0
            },
            otherSurgeon: {
                surgicalAppointmentAttributeType: {
                    uuid: '25efd013-3a1f-11e7-83f8-0800274a5156',
                    name: 'otherSurgeon'
                }
            },
            surgicalAssistant: {
                surgicalAppointmentAttributeType: {
                    uuid: '25efdf1b-3a1f-11e7-83f8-0800274a5156',
                    name: 'surgicalAssistant'
                }
            },
            anaesthetist: {
                surgicalAppointmentAttributeType: {
                    uuid: '25efec33-3a1f-11e7-83f8-0800274a5156',
                    name: 'anaesthetist'
                }
            },
            scrubNurse: {
                surgicalAppointmentAttributeType: {
                    uuid: '25eff89a-3a1f-11e7-83f8-0800274a5156',
                    name: 'scrubNurse'
                }
            },
            circulatingNurse: {
                surgicalAppointmentAttributeType: {
                    uuid: '25f0060e-3a1f-11e7-83f8-0800274a5156',
                    name: 'circulatingNurse'
                }
            }
        };
        scope.ngDialogData = ngDialogData;

        createController();

        expect(scope.attributes).toEqual(surgicalAppointmentAttributes);
        expect(scope.attributeTypes).toBe(attributeTypes.results);
        expect(scope.notes).toBeUndefined();
        expect(scope.selectedPatient).toBeUndefined();
    });

    it("should disable the edit patient name when trying to edit the saved surgical appointment", function () {
        var ngDialogData = {id: 1, sortWeight: 0, notes: "need more assistants", patient: {uuid:"patientUuid", display: "firstName lastName", person: {given_name: "firstName", family_name: "lastName"}}};
        ngDialogData.surgicalAppointmentAttributes = {surgicalAppointmentAttributeType:{uuid: "25ef8484-3a1f-11e7-83f8-0800274a5156", name: "procedure"}, value: "surgery on left leg"};
        scope.ngDialogData = ngDialogData;
        scope.patient = ngDialogData.patient.display;

        createController();

        expect(scope.shouldBeDisabled()).toBeTruthy();
    });

    it("should enable the edit patient name when trying to edit the unsaved surgical appointment", function () {
        var ngDialogData = { sortWeight: 0, notes: "need more assistants", patient: {uuid:"patientUuid", display: "firstName lastName", person: {given_name: "firstName", family_name: "lastName"}}};
        ngDialogData.surgicalAppointmentAttributes = {surgicalAppointmentAttributeType:{uuid: "25ef8484-3a1f-11e7-83f8-0800274a5156", name: "procedure"}, value: "surgery on left leg"};
        scope.ngDialogData = ngDialogData;
        scope.patient = ngDialogData.patient.display;

        createController();

        expect(scope.shouldBeDisabled()).toBeFalsy();
    });

    it("should deep clone the surgeon for other surgeon", function () {
        scope.surgeons = [{name: "surgeon1", uuid: "surgeon1Uuid"},{name: "surgeon2", uuid: "surgeon2Uuid"}];

        createController();

        expect(scope.otherSurgeons).toEqual([{name: "surgeon1", uuid: "surgeon1Uuid"},{name: "surgeon2", uuid: "surgeon2Uuid"}]);
        scope.otherSurgeons[0].name= "surgeon1 modified";
        expect(scope.surgeons).toEqual([{name: "surgeon1", uuid: "surgeon1Uuid"},{name: "surgeon2", uuid: "surgeon2Uuid"}]);
    });

});
