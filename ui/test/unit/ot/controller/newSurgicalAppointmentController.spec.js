'use strict';

describe("newSurgicalAppointmentController", function () {
    var scope, controller, q, surgicalAppointmentHelper, _window, getAppDescriptor, programHelper;
    q = jasmine.createSpyObj('$q', ['all', 'when']);
    var patientService = jasmine.createSpyObj('patientService', ['search']);
    var spinner = jasmine.createSpyObj('spinner', ['forPromise', 'then', 'catch']);
    var messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
    var surgicalAppointmentService = jasmine.createSpyObj('surgicalAppointmentService', ['getSurgeons', 'saveSurgicalBlock', 'getSurgicalAppointmentAttributeTypes']);
    var programService = jasmine.createSpyObj('programService', ['getEnrollmentInfoFor']);
    var getAppDescriptor = jasmine.createSpyObj('getAppDescriptor', ['getExtensions', 'getConfigValue', 'formatUrl']);
    var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
    var queryService = jasmine.createSpyObj('queryService', ['getResponseFromQuery']);
    appService.getAppDescriptor.and.returnValue(getAppDescriptor);
    programHelper = jasmine.createSpyObj('programHelper', ['groupPrograms']);

    var ngDialog = jasmine.createSpyObj('ngDialog', ['close']);
    _window = jasmine.createSpyObj('$window', ['open', 'location']);


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
            },
            {
                "uuid": "25f0060e-3a1f-11e7-83f8-0800274a5156",
                "name": "notes"
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
    var enrollmentInfo = {
        patient: {uuid: "patientUuid"},
        dateEnrolled: "06-08-2017",
        uuid: "enrollmentUuid",
        program: {uuid: "programUuid"}
    };
    programService.getEnrollmentInfoFor.and.returnValue(specUtil.simplePromise([]));

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
            $window: _window,
            spinner: spinner,
            surgicalAppointmentService: surgicalAppointmentService,
            patientService: patientService,
            messagingService: messagingService,
            queryService: queryService,
            programService: programService,
            appService: appService,
            surgicalAppointmentHelper: surgicalAppointmentHelper,
            ngDialog: ngDialog,
            programHelper: programHelper
        });
    };

    it("should map the display name for patients", function () {
        var patients = [{givenName: "Natsume", familyName: "Hyuga", identifier: "IQ12345"},
            {givenName: "Sakura", familyName: "Mikan", identifier: "IQ12346"}];

        createController();
        var patientsWithDisplayName = scope.responseMap(patients);

        expect(patientsWithDisplayName.length).toEqual(2);
        expect(patientsWithDisplayName[0].label).toEqual("Natsume Hyuga ( IQ12345 )");
        expect(patientsWithDisplayName[1].label).toEqual("Sakura Mikan ( IQ12346 )");
    });

    it("should save data in proper format ", function () {
        scope.ngDialogData = {id: 1, actualStartDatetime: "2017-02-02T09:09:00.0Z", actualEndDatetime: "2017-02-02T10:09:00.0Z", status: "COMPLETED",
            sortWeight: 0, patient: {uuid:"patientUuid", display: "firstName lastName", person: {given_name: "firstName", family_name: "lastName"}},
            notes: "notes for appointment", uuid: "surgicalAppointment uuid", voided: false};
        createController();
        scope.addSurgicalAppointment = jasmine.createSpy("addSurgicalAppointment");
        scope.surgicalAppointmentForm = {$valid: true};

        scope.createAppointmentAndAdd();

        var appointment = {
            id: 1,
            patient: scope.ngDialogData.patient,
            sortWeight: 0,
            actualStartDatetime: "2017-02-02T09:09:00.0Z",
            actualEndDatetime: "2017-02-02T10:09:00.0Z",
            status: "COMPLETED",
            notes: "notes for appointment",
            uuid: "surgicalAppointment uuid",
            voided: false,
            surgicalAppointmentAttributes: {
                procedure: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25ef8484-3a1f-11e7-83f8-0800274a5156',
                        name: 'procedure'
                    }, value: ""
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
                    }, value: ""
                },
                surgicalAssistant: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25efdf1b-3a1f-11e7-83f8-0800274a5156',
                        name: 'surgicalAssistant'
                    }, value: ""
                },
                anaesthetist: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25efec33-3a1f-11e7-83f8-0800274a5156',
                        name: 'anaesthetist'
                    }, value: ""
                },
                scrubNurse: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25eff89a-3a1f-11e7-83f8-0800274a5156',
                        name: 'scrubNurse'
                    }, value: ""
                },
                circulatingNurse: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25f0060e-3a1f-11e7-83f8-0800274a5156',
                        name: 'circulatingNurse'
                    }, value: ""
                },
                notes: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25f0060e-3a1f-11e7-83f8-0800274a5156',
                        name: 'notes'
                    }, value: ""
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
        var ngDialogData = {
            id: 1,
            sortWeight: 0,
            notes: "need more assistants",
            patient: {
                uuid: "patientUuid",
                display: "firstName lastName",
                person: {given_name: "firstName", family_name: "lastName"}
            },
            isBeingEdited: true,
            isDirty: true
        };
        scope.ngDialogData = ngDialogData;
        scope.surgicalForm = {surgicalAppointments: [ngDialogData]}
        createController();
        scope.close();
        expect(ngDialog.close).toHaveBeenCalled();
        expect(ngDialog.isBeingEdited).toBe(undefined);
        expect(scope.surgicalForm.surgicalAppointments[0].isBeingEdited).toBe(undefined);
    });

    it("should initialize scope variables for appointment with data from the dialogData in edit appointment mode", function () {
        var ngDialogData = {
            id: 1,
            sortWeight: 0,
            notes: "need more assistants",
            patient: {
                uuid: "patientUuid",
                display: "firstName lastName",
                person: {given_name: "firstName", family_name: "lastName"}
            }
        };
        ngDialogData.surgicalAppointmentAttributes = {
            surgicalAppointmentAttributeType: {
                uuid: "25ef8484-3a1f-11e7-83f8-0800274a5156",
                name: "procedure"
            }, value: "surgery on left leg"
        };
        scope.ngDialogData = ngDialogData;

        createController();

        expect(scope.attributes).toBe(ngDialogData.surgicalAppointmentAttributes);
        expect(scope.attributeTypes).toBe(attributeTypes.results);
        expect(scope.selectedPatient).toBe(ngDialogData.patient);
    });

    it("should only initialize the attributes, attributeTypes, when dialogData is not provided, in create appointment mode", function () {
        var ngDialogData = {};
        var surgicalAppointmentAttributes = {
            procedure: {
                surgicalAppointmentAttributeType: {
                    uuid: '25ef8484-3a1f-11e7-83f8-0800274a5156',
                    name: 'procedure'
                }, value: ""
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
                }, value: ""
            },
            surgicalAssistant: {
                surgicalAppointmentAttributeType: {
                    uuid: '25efdf1b-3a1f-11e7-83f8-0800274a5156',
                    name: 'surgicalAssistant'
                }, value: ""
            },
            anaesthetist: {
                surgicalAppointmentAttributeType: {
                    uuid: '25efec33-3a1f-11e7-83f8-0800274a5156',
                    name: 'anaesthetist'
                }, value: ""
            },
            scrubNurse: {
                surgicalAppointmentAttributeType: {
                    uuid: '25eff89a-3a1f-11e7-83f8-0800274a5156',
                    name: 'scrubNurse'
                }, value: ""
            },
            circulatingNurse: {
                surgicalAppointmentAttributeType: {
                    uuid: '25f0060e-3a1f-11e7-83f8-0800274a5156',
                    name: 'circulatingNurse'
                }, value: ""
            },
            notes: {
                surgicalAppointmentAttributeType: {
                    uuid: '25f0060e-3a1f-11e7-83f8-0800274a5156',
                    name: 'notes'
                }, value: ""
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

        expect(scope.isEditMode()).toBeTruthy();
    });

    it("should enable the edit patient name when trying to edit the unsaved surgical appointment", function () {
        var ngDialogData = { sortWeight: 0, notes: "need more assistants", patient: {uuid:"patientUuid", display: "firstName lastName", person: {given_name: "firstName", family_name: "lastName"}}};
        ngDialogData.surgicalAppointmentAttributes = {surgicalAppointmentAttributeType:{uuid: "25ef8484-3a1f-11e7-83f8-0800274a5156", name: "procedure"}, value: "surgery on left leg"};
        scope.ngDialogData = ngDialogData;
        scope.patient = ngDialogData.patient.display;

        createController();

        expect(scope.isEditMode()).toBeFalsy();
    });

    it("should deep clone the surgeon for other surgeon", function () {
        scope.surgeons = [{name: "surgeon1", uuid: "surgeon1Uuid"},{name: "surgeon2", uuid: "surgeon2Uuid"}];

        createController();

        expect(scope.otherSurgeons).toEqual([{name: "surgeon1", uuid: "surgeon1Uuid"},{name: "surgeon2", uuid: "surgeon2Uuid"}]);
        scope.otherSurgeons[0].name= "surgeon1 modified";
        expect(scope.surgeons).toEqual([{name: "surgeon1", uuid: "surgeon1Uuid"},{name: "surgeon2", uuid: "surgeon2Uuid"}]);
    });

    it("should open the patient program dashboard when user click on patient name in edit mode", function () {
        getAppDescriptor.getConfigValue.and.returnValue({
            link : "/bahmni/clinical/#/programs/patient/{{patientUuid}}/dashboard?dateEnrolled={{dateEnrolled}}&programUuid={{programUuid}}&enrollment={{enrollment}}&currentTab=DASHBOARD_TAB_GENERAL_KEY"
        });
        getAppDescriptor.formatUrl.and.returnValue("formattedUrl");
        programHelper.groupPrograms.and.returnValue({activePrograms : [enrollmentInfo]});
        scope.patient = { uuid: "patientUuid", display: "patient-GAN2020" };
        scope.ngDialogData = { id: "someId", patient: scope.patient };
        programService.getEnrollmentInfoFor.and.returnValue(specUtil.simplePromise([enrollmentInfo]));
        createController();

        scope.goToForwardUrl();
        expect(scope.enrollmentInfo).toBe(enrollmentInfo);
        expect(getAppDescriptor.getConfigValue).toHaveBeenCalledWith('patientDashboardUrl');
        expect(getAppDescriptor.formatUrl).toHaveBeenCalledWith("/bahmni/clinical/#/programs/patient/{{patientUuid}}/dashboard?dateEnrolled={{dateEnrolled}}&programUuid={{programUuid}}&enrollment={{enrollment}}&currentTab=DASHBOARD_TAB_GENERAL_KEY", jasmine.any(Object));
        expect(_window.open).toHaveBeenCalledWith("formattedUrl");
    });

    it("should open the patient clinical dashboard when user click on patient name in edit mode", function () {
        getAppDescriptor.getConfigValue.and.returnValue({
            link : "/bahmni/clinical/#/default/patient/{{patientUuid}}/dashboard"
        });
        getAppDescriptor.formatUrl.and.returnValue("formattedUrl");
        scope.patient = { uuid: "patientUuid", display: "patient-GAN2020" };
        scope.ngDialogData = { id: "someId", patient: scope.patient };
        createController();
        scope.goToForwardUrl();
        expect(getAppDescriptor.getConfigValue).toHaveBeenCalledWith('patientDashboardUrl');
        expect(getAppDescriptor.formatUrl).toHaveBeenCalledWith("/bahmni/clinical/#/default/patient/{{patientUuid}}/dashboard", jasmine.any(Object));
        expect(_window.open).toHaveBeenCalledWith("formattedUrl");
    });

    it("should throw error when the forward url configured for the patient is invalid, all the required params are not present on the scope", function () {
        var forwardUrl = {
            link : "/bahmni/clinical/#/programs/patient/{{patientUuid}}/dashboard?dateEnrolled={{dateEnrolled}}&programUuid={{programUuid}}&enrollment={{enrollment}}&currentTab=DASHBOARD_TAB_GENERAL_KEY",
            errorMessage: "Configured forward url is invalid"
        };
        getAppDescriptor.getConfigValue.and.returnValue(forwardUrl);
        scope.patient = { uuid: "patientUuid", display: "patient-GAN2020" };
        scope.ngDialogData = { id: "someId", patient: scope.patient };
        programService.getEnrollmentInfoFor.and.returnValue(specUtil.simplePromise([]));
        programHelper.groupPrograms.and.returnValue({activePrograms: []});

        scope.enrollmentInfo = undefined;
        createController();

        scope.goToForwardUrl();
        expect(getAppDescriptor.getConfigValue).toHaveBeenCalledWith('patientDashboardUrl');
        expect(messagingService.showMessage).toHaveBeenCalledWith('error', forwardUrl.errorMessage);
    });

    it("should set appointment status to scheduled by default", function () {
        scope.ngDialogData = {id: 1,
            sortWeight: 0,
            patient: {uuid:"patientUuid", display: "firstName lastName", person: {given_name: "firstName", family_name: "lastName"}},
            notes: "notes for appointment", uuid: "surgicalAppointment uuid", voided: false };
        createController();
        scope.addSurgicalAppointment = jasmine.createSpy("addSurgicalAppointment");
        scope.surgicalAppointmentForm = {$valid: true};

        scope.createAppointmentAndAdd();

        var appointment = {
            id: 1,
            patient: scope.ngDialogData.patient,
            sortWeight: 0,
            status: "SCHEDULED",
            actualStartDatetime: undefined,
            actualEndDatetime: undefined,
            notes: "notes for appointment",
            uuid: "surgicalAppointment uuid",
            voided: false,
          surgicalAppointmentAttributes: {
                procedure: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25ef8484-3a1f-11e7-83f8-0800274a5156',
                        name: 'procedure'
                    }, value: ""
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
                    }, value: ""
                },
                surgicalAssistant: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25efdf1b-3a1f-11e7-83f8-0800274a5156',
                        name: 'surgicalAssistant'
                    }, value: ""
                },
                anaesthetist: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25efec33-3a1f-11e7-83f8-0800274a5156',
                        name: 'anaesthetist'
                    }, value: ""
                },
                scrubNurse: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25eff89a-3a1f-11e7-83f8-0800274a5156',
                        name: 'scrubNurse'
                    }, value: ""
                },
                circulatingNurse: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25f0060e-3a1f-11e7-83f8-0800274a5156',
                        name: 'circulatingNurse'
                    }, value: ""
                },
                notes: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25f0060e-3a1f-11e7-83f8-0800274a5156',
                        name: 'notes'
                    }, value: ""
                }
            }
        };

        expect(scope.addSurgicalAppointment).toHaveBeenCalledWith(appointment);
        expect(q.when).toHaveBeenCalled();
    });

    it('should pull procedures,estimated hours and estimated minutes', function () {
        getAppDescriptor.getConfigValue.and.callFake(function (value) {
            if (value == 'printListViewTemplateUrl') {
                return '';
            }
            return value;
        });
        createController();
        queryService.getResponseFromQuery.and.returnValue(specUtil.simplePromise({data: [{'all_procedures': "maxilofacial", 'esthrs': "1", 'estmins': "30"}]}));
        var data = {uuid: "patientUuid1"};
        scope.onSelectPatient(data);
        expect(queryService.getResponseFromQuery).toHaveBeenCalledWith({ patientUuid : data.uuid, q : 'procedureSQLGlobalProperty', v : 'full' });
        expect(scope.attributes.procedure.value).toEqual("maxilofacial");
        expect(scope.attributes.estTimeHours.value).toEqual(1);
        expect(scope.attributes.estTimeMinutes.value).toEqual(30);

        queryService.getResponseFromQuery.and.returnValue(specUtil.simplePromise({data: []}));
        var data = {uuid: "patientUuid2"};
        scope.onSelectPatient(data);
        expect(queryService.getResponseFromQuery).toHaveBeenCalledWith({ patientUuid : data.uuid, q : 'procedureSQLGlobalProperty', v : 'full' });
        expect(scope.attributes.procedure.value).toEqual("");
        expect(scope.attributes.estTimeHours.value).toEqual(0);
        expect(scope.attributes.estTimeMinutes.value).toEqual(0);

        queryService.getResponseFromQuery.and.returnValue(specUtil.simplePromise({data: [{'all_procedures': "surgery1 on left hand + surgery2 on right leg", 'esthrs': "2", 'estmins': "75"}]}));
        var data = {uuid: "patientUuid3"};
        scope.onSelectPatient(data);
        expect(queryService.getResponseFromQuery).toHaveBeenCalledWith({ patientUuid : data.uuid, q : 'procedureSQLGlobalProperty', v : 'full' });
        expect(scope.attributes.procedure.value).toEqual("surgery1 on left hand + surgery2 on right leg");
        expect(scope.attributes.estTimeHours.value).toEqual(3);
        expect(scope.attributes.estTimeMinutes.value).toEqual(15);
    });

    it("should remove isBeingEdit field for appointment which is selected when user clicks on cancel the changes", function () {
        createController();
        var appointment =  {sortWeight: 0, notes: "need more assistants", patient: {uuid:"patientUuid", display: "firstName lastName", person: {given_name: "firstName", family_name: "lastName"}}};
        scope.ngDialogData = { sortWeight: 0, notes: "need more assistants", patient: {uuid:"patientUuid", display: "firstName lastName", person: {given_name: "firstName", family_name: "lastName"}}, isBeingEdited: true};
        scope.surgicalForm  = {surgicalAppointments: [scope.ngDialogData, appointment]};
        scope.close();
        expect(scope.surgicalForm.surgicalAppointments[0].isBeingEdited).toBeUndefined();
        expect(scope.ngDialogData.isBeingEdited).toBeUndefined();
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
