'use strict';

describe('VisitController', function () {
    var scope;
    var $controller;
    var success;
    var registrationCardPrinter;
    var encounterService;
    var patientService;
    var patient;
    var dateUtil;
    var $location;
    var $window;
    var $timeout;
    var spinner;
    var getEncounterPromise;
    var getPatientPromise;
    var stateParams;
    var patientMapper;
    var q;
    var appService;
    var appDescriptor;
    var sessionService;
    var stubAllPromise = function () {
        return {
            then: function () {
                return stubAllPromise();
            }
        }
    };
    var stubOnePromise = function () {
        return {
            then: function (callBack) {
                return callBack();
            }
        }
    };

    var sampleConfig = {
        "conceptData": {
            "WEIGHT": {
                "uuid": "b4aa3728-c79a-11e2-b0c0-8e397087571c"
            },
            "BMI": {
                "uuid": "b4acc09c-c79a-11e2-b0c0-8e397087571c"
            },
            "HEIGHT": {
                "uuid": "b4a7aa80-c79a-11e2-b0c0-8e397087571c"
            }
        },
        "encounterTypes": {
            "REG": "b45de99a-c79a-11e2-b0c0-8e397087571c"
        },
        "visitTypes": {
            "REG": "b45ca846-c79a-11e2-b0c0-8e397087571c",
            "REVISIT": "b5ba5576-c79a-11e2-b0c0-8e397087571c"
        }

    };
    var sampleEncounter = {
        "observations": []
    };

    beforeEach(module('bahmni.registration'));
    beforeEach(inject(['$injector', '$location', '$window', '$timeout', '$q', '$rootScope', function ($injector, location, window, timeout, $q, $rootScope) {
        q = $q;
        stateParams = { patientUuid: '21308498-2502-4495-b604-7b704a55522d' };
        patient = {
            uuid: "21308498-2502-4495-b604-7b704a55522d",
            isNew: "true",
            person: {
                names: [
                    "name"
                ]
            }
        };
        $controller = $injector.get('$controller');
        scope = { "$watch": jasmine.createSpy() }
        patientService = jasmine.createSpyObj('patientService', ['get']);
        appService = jasmine.createSpyObj('appService',['getDescription', 'getAppDescriptor']);
        appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue', 'getExtensions']);
        appService.getAppDescriptor.and.returnValue(appDescriptor);
        appDescriptor.getExtensions.and.returnValue([]);
        patientMapper = jasmine.createSpyObj('patientMapper', ['map']);
        registrationCardPrinter = jasmine.createSpyObj('registrationCardPrinter', ['print']);
        dateUtil = Bahmni.Common.Util.DateUtil;
        $location = location;
        $window = window;
        $timeout = timeout;
        success = jasmine.createSpy();
        $rootScope.regEncounterConfiguration = new Bahmni.Registration.RegistrationEncounterConfig({visitTypes: {}},{encounterTypes: {"REG" : "someUUID"}});
        scope.regEncounterConfiguration = angular.extend(new Bahmni.Registration.RegistrationEncounterConfig(), sampleConfig);
        scope.encounterConfig = angular.extend(new EncounterConfig(), sampleConfig);
        spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        sessionService = jasmine.createSpyObj('sessionService', ['getLoginLocationUuid']);
        encounterService = jasmine.createSpyObj('encounterService', ['create', 'activeEncounter']);
        getEncounterPromise = specUtil.createServicePromise('activeEncounter');
        getPatientPromise = specUtil.createServicePromise('get');
        encounterService.activeEncounter.and.returnValue(getEncounterPromise);
        patientService.get.and.returnValue(getPatientPromise);
        scope.currentProvider = {uuid: ''};
        patientMapper.map.and.returnValue(patient);

    }]));

    describe('initialization', function () {
        it('should set the patient from patient data', function () {
            $location.search("newpatient", true);

            $controller('VisitController', {
                $scope: scope,
                spinner: spinner,
                encounterService: encounterService,
                patientService: patientService,
                $stateParams: stateParams,
                openmrsPatientMapper: patientMapper,
                appService:appService,
                registrationCardPrinter: registrationCardPrinter,
                sessionService: sessionService
            });

            getPatientPromise.callSuccessCallBack(patient);
            getEncounterPromise.callSuccessCallBack(sampleEncounter);

            expect(scope.patient).toBe(patient);
        });
    });

    describe("validate", function () {
        beforeEach(function () {
            $controller('VisitController', {
                $scope: scope,
                patientService: patientService,
                encounterService: encounterService,
                $location: $location,
                spinner: spinner,
                dateUtil: dateUtil,
                $stateParams: stateParams,
                appService:appService,
                openmrsPatientMapper: patientMapper,
                registrationCardPrinter: registrationCardPrinter,
                sessionService: sessionService
            });
            getPatientPromise.callSuccessCallBack(patient);
            getEncounterPromise.callSuccessCallBack(sampleEncounter);

            spyOn(scope, 'save').and.callFake(stubAllPromise);
        });

        it("should be called during save and print", function () {
            scope.validate = jasmine.createSpy('validate').and.callFake(stubOnePromise);

            scope.saveAndPrint();

            expect(scope.validate).toHaveBeenCalled();
        })

        it("should be called during submit for new patient", function () {
            scope.patient.isNew = true;
            scope.validate = jasmine.createSpy('validate').and.callFake(stubOnePromise);

            scope.submit();

            expect(scope.validate).toHaveBeenCalled();
        });

        it("should be called during submit for existing patient", function () {
            scope.patient.isNew = false;
            scope.validate = jasmine.createSpy('validate').and.callFake(stubOnePromise);

            scope.submit();

            expect(scope.validate).toHaveBeenCalled();
        });
    });

    describe("saveAndPrint", function () {
        beforeEach(function () {
            $controller('VisitController', {
                $scope: scope,
                patientService: patientService,
                encounterService: encounterService,
                $location: $location,
                spinner: spinner,
                dateUtil: dateUtil,
                $stateParams: stateParams,
                appService:appService,
                openmrsPatientMapper: patientMapper,
                registrationCardPrinter: registrationCardPrinter,
                sessionService: sessionService
            });
            getPatientPromise.callSuccessCallBack(patient);
            getEncounterPromise.callSuccessCallBack(sampleEncounter);
            encounterService.create.and.callFake(stubOnePromise);
            spyOn(scope, 'validate').and.callFake(stubOnePromise);
        });

        it("should create visit", function () {
            var now = new Date();
            spyOn(dateUtil, "now").and.returnValue(now);
            scope.print = jasmine.createSpy().and.callFake(stubOnePromise);
            scope.observations = [];
            scope.observations = [{"concept": {"uuid": "7fd05fdb-7603-4b46-87d4-a6700dc69c1a"}, "label": "Fee Information",
                    "groupMembers": [
                        {"concept": {"uuid": "b4afc27e-c79a-11e2-b284-107d46e7b2c5"}, "label": "Fee", "value": "100"},
                        {"concept": {"uuid": "b4a3ebc0-c79a-11e2-b284-107d46e7b2c5"}, "label": "COMMENTS", "value": "fine"}
                    ],
                    "voided": false}];

            scope.saveAndPrint();

            expect(scope.encounter.observations.length).toBe(1);
            expect(scope.encounter.observations[0].concept.uuid).toBe('7fd05fdb-7603-4b46-87d4-a6700dc69c1a');
            expect(scope.encounter.observations[0].groupMembers.length).toBe(2);
            expect(encounterService.create).toHaveBeenCalledWith(scope.encounter);
        });

        describe("once saved and printed", function () {
            beforeEach(function () {
                $controller('VisitController', {
                    $scope: scope,
                    patientService: patientService,
                    encounterService: encounterService,
                    $location: $location,
                    spinner: spinner,
                    dateUtil: dateUtil,
                    $stateParams: stateParams,
                    appService:appService,
                    openmrsPatientMapper: patientMapper,
                    registrationCardPrinter: registrationCardPrinter,
                    sessionService: sessionService
                });
                getPatientPromise.callSuccessCallBack(patient);
                getEncounterPromise.callSuccessCallBack(sampleEncounter);

                scope.print = jasmine.createSpy().and.callFake(stubOnePromise);
                scope.save = jasmine.createSpy().and.callFake(stubOnePromise);
                spyOn(scope, 'validate').and.callFake(stubOnePromise);
            });

            it(" should print patient and go to create new page on creation of visit for new patient", function () {
                scope.patient.isNew = true;
                spyOn($location, 'path');
                scope.saveAndPrint();

                expect(scope.print).toHaveBeenCalled();
                $timeout.flush();
                expect($location.path).toHaveBeenCalledWith("/patient/new");
            });

            it("should print patient and go to search on creation of visit for edit of patient", function () {
                scope.patient.isNew = false;
                spyOn($location, 'path');

                scope.saveAndPrint();

                expect(scope.print).toHaveBeenCalled();
                $timeout.flush();
                expect($location.path).toHaveBeenCalledWith("/search");
            });
        });
    });

    describe("submit", function () {
        beforeEach(function () {
            $controller('VisitController', {
                $scope: scope,
                encounterService: encounterService,
                patientService: patientService,
                spinner: spinner,
                $stateParams: stateParams,
                appService:appService,
                openmrsPatientMapper: patientMapper,
                registrationCardPrinter: registrationCardPrinter,
                sessionService: sessionService
            });
            getPatientPromise.callSuccessCallBack(patient);
            getEncounterPromise.callSuccessCallBack(sampleEncounter);

            encounterService.create.and.callFake(stubOnePromise);
            scope.patient = {uuid: "21308498-2502-4495-b604-7b704a55522d"};
            spyOn(scope, 'print').and.callFake(stubOnePromise);
            spyOn($location, 'path');
            spyOn(scope, 'validate').and.callFake(stubOnePromise);
        });

        describe("on successful creation of new patient visit", function () {
            beforeEach(function () {
                scope.patient.isNew = true;
            });

            it("should print the card for new patient", function () {
                scope.submit();

                expect(scope.print).toHaveBeenCalled();
            });

            it("should go to new patient registration page", function () {
                scope.submit();
                $timeout.flush();

                expect($location.path).toHaveBeenCalledWith("/patient/new");
            });
        })

        describe("on successful creation of returning patient visit", function () {
            beforeEach(function () {
                scope.patient.isNew = false;
            });

            it("should not print card for returning patient", function () {
                scope.submit();

                expect(scope.print).not.toHaveBeenCalled();
            });

            it("should go to search page", function () {
                scope.submit();
                $timeout.flush();

                expect($location.path).toHaveBeenCalledWith("/search");
            });
        })
    });
});