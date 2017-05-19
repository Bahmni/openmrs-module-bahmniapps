'use strict';

describe("newSurgicalAppointmentController", function () {
    var scope, controller, q, surgicalAppointmentHelper;
    var q = jasmine.createSpyObj('$q', ['all', 'when']);
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
        scope.ngDialogData = {};
        createController();
        scope.addSurgicalAppointment = jasmine.createSpy("addSurgicalAppointment");
        scope.selectedPatient = {label: "Natsume Hyuga (IQ12345)"};
        scope.surgicalAppointmentForm = {$valid: true};

        scope.createAppointmentAndAdd();

        var appointment = {
            patient: {label: 'Natsume Hyuga (IQ12345)'},
            notes: undefined,
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
                    }, value: null
                },
                surgicalAssistant: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25efdf1b-3a1f-11e7-83f8-0800274a5156',
                        name: 'surgicalAssistant'
                    }, value: null
                },
                anaesthetist: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25efec33-3a1f-11e7-83f8-0800274a5156',
                        name: 'anaesthetist'
                    }, value: null
                },
                scrubNurse: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25eff89a-3a1f-11e7-83f8-0800274a5156',
                        name: 'scrubNurse'
                    }, value: null
                },
                circulatingNurse: {
                    surgicalAppointmentAttributeType: {
                        uuid: '25f0060e-3a1f-11e7-83f8-0800274a5156',
                        name: 'circulatingNurse'
                    }, value: null
                }
            },
            otherSurgeon: null,
            duration: 15
        };
        expect(scope.addSurgicalAppointment).toHaveBeenCalledWith(appointment);
        expect(q.when).toHaveBeenCalled();
    });

    it("should search the patient, when patientinfo passed to it", function () {
        scope.patient = "pa";
        createController();
        scope.search();
        expect(patientService.search).toHaveBeenCalledWith("pa");

    });

    it("should close the dialog when clicked on close", function () {
        createController();
        scope.close();
        expect(ngDialog.close).toHaveBeenCalled();
    });
});
