'use strict';

describe('VisitController', function () {
    var scope;
    var rootScope;
    var $controller;
    var success;
    var visitService;
    var patientService;
    var patient;
    var date;
    var $location;
    var $window;
    var $timeout;
    var spinner;
    var getPromise;
    var stubAllPromise = function () {
        return {
            then: function () {
                return stubAllPromise();
            }
        }
    }
    var stubOnePromise = function () {
        return {
            then: function (callBack) {
                return callBack();
            }
        }
    }

    var sampleConfig = {
       "conceptData": {
           "WEIGHT": {
               "uuid": "b4aa3728-c79a-11e2-b0c0-8e397087571c"
           },
           "COMMENTS": {
               "uuid": "b499a980-c79a-11e2-b0c0-8e397087571c"
           },
           "BMI": {
               "uuid": "b4acc09c-c79a-11e2-b0c0-8e397087571c"
           },
           "HEIGHT": {
               "uuid": "b4a7aa80-c79a-11e2-b0c0-8e397087571c"
           },
           "REGISTRATION FEES": {
               "uuid": "b4a52102-c79a-11e2-b0c0-8e397087571c"
           }
       },
       "encounterTypes": {
           "REG": "b45de99a-c79a-11e2-b0c0-8e397087571c"
       },
       "visitTypes": {
           "REG": "b45ca846-c79a-11e2-b0c0-8e397087571c",
           "REVISIT": "b5ba5576-c79a-11e2-b0c0-8e397087571c"
       }
                       }
    var sampleEncounter = {
        "observations": []
    }

    beforeEach(module('registration.visitController'));
    beforeEach(inject(['$injector', 'date', '$location', '$window', '$timeout', function ($injector, dateModule, location, window, timeout) {
        $controller = $injector.get('$controller');
        scope = { "$watch": jasmine.createSpy() }
        patientService = jasmine.createSpyObj('patientService', ['getPatient', 'clearPatient']);
        date = dateModule;
        patient = {uuid: "21308498-2502-4495-b604-7b704a55522d", isNew: "true"};
        $location = location;
        $window = window;
        $timeout = timeout;
        patientService.getPatient.andReturn(patient);
        success = jasmine.createSpy();
        scope.encounterConfiguration = angular.extend(new EncounterConfig(), sampleConfig);
        spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        visitService = jasmine.createSpyObj('visitService', ['create', 'get']);
        getPromise = specUtil.createServicePromise('get');
        visitService.get.andReturn(getPromise);
    }]));

    describe('initialization', function () {
        it('should set the patient from patient data and the default registration fee', function () {
            patient.isNew = true;
            $controller('VisitController', {
                $scope: scope,
                spinner: spinner,
                visitService: visitService,
                patientService: patientService,
            });
            getPromise.callSuccessCallBack(sampleEncounter);

            expect(scope.obs["REGISTRATION FEES"]).toBe(defaults.registration_fees_newPatient);
            expect(scope.patient).toBe(patient);
        });

        it('should set the registration fee for returning patient', function () {
            patient.isNew = false;
            $controller('VisitController', {
                $scope: scope,
                spinner: spinner,
                visitService: visitService,
                patientService: patientService
            });
            getPromise.callSuccessCallBack(sampleEncounter);

            expect(scope.obs["REGISTRATION FEES"]).toBe(defaults.registration_fees_oldPatient);
            expect(scope.patient).toBe(patient);
        });
    });

    describe("validate", function () {
        beforeEach(function () {
            $controller('VisitController', {
                $scope: scope,
                patientService: patientService,
                visitService: visitService,
                $location: $location,
                spinner: spinner,
                date: date
            });
            getPromise.callSuccessCallBack(sampleEncounter);

            spyOn(scope, 'save').andCallFake(stubAllPromise);
        });

        it("should be called during save and print", function () {
            scope.validate = jasmine.createSpy('validate').andCallFake(stubOnePromise);

            scope.saveAndPrint();

            expect(scope.validate).toHaveBeenCalled();
        })

        it("should be called during submit for new patient", function () {
            scope.patient.isNew = true;
            scope.validate = jasmine.createSpy('validate').andCallFake(stubOnePromise);

            scope.submit();

            expect(scope.validate).toHaveBeenCalled();
        });

        it("should be called during submit for existing patient", function () {
            scope.patient.isNew = false;
            scope.validate = jasmine.createSpy('validate').andCallFake(stubOnePromise);

            scope.submit();

            expect(scope.validate).toHaveBeenCalled();
        });

        it("should open popup when consultation fee = 0 and comments are empty", function () {
            scope.obs["REGISTRATION FEES"] = 0;
            scope.obs.COMMENTS = '';
            scope.confirmDialog = jasmine.createSpyObj('confirmDialog', ['show']);
            scope.confirmDialog.show.andCallFake(stubOnePromise);

            scope.validate();

            expect(scope.confirmDialog.show).toHaveBeenCalled();
        });

        it("should not open popup when consultation fee != 0", function () {
            scope.obs["REGISTRATION FEES"] = 10;
            scope.obs.COMMENTS = '';
            scope.confirmDialog = jasmine.createSpyObj('confirmDialog', ['show']);
            scope.confirmDialog.show.andCallFake(stubOnePromise);

            scope.validate();

            expect(scope.confirmDialog.show).not.toHaveBeenCalled();
        });

        it("should not open popup when comments are not empty", function () {
            scope.obs["REGISTRATION FEES"] = 0;
            scope.obs.COMMENTS = 'adfadfs';
            scope.confirmDialog = jasmine.createSpyObj('confirmDialog', ['show']);
            scope.confirmDialog.show.andCallFake(stubOnePromise);

            scope.validate();

            expect(scope.confirmDialog.show).not.toHaveBeenCalled();
        })

        it("should always return a promise", function () {
            scope.obs["REGISTRATION FEES"] = 0;
            scope.obs.COMMENTS = 'adfadfs';
            scope.confirmDialog = jasmine.createSpyObj('confirmDialog', ['show']);
            scope.confirmDialog.show.andCallFake(stubOnePromise);

            var result = scope.validate();

            expect(result.then).toBeTruthy();
        });
    })

    describe("saveAndPrint", function () {
        beforeEach(function () {
            $controller('VisitController', {
                $scope: scope,
                patientService: patientService,
                visitService: visitService,
                $location: $location,
                spinner: spinner,
                date: date
            });
            getPromise.callSuccessCallBack(sampleEncounter);
            visitService.create.andCallFake(stubOnePromise);
            patientService.clearPatient.andCallFake(stubOnePromise);
            spyOn(scope, 'validate').andCallFake(stubOnePromise);
        });

        it("should create visit", function () {
            var now = new Date();
            spyOn(date, "now").andReturn(now);
            scope.print = jasmine.createSpy().andCallFake(stubOnePromise);
            scope.obs.COMMENTS = "fine";
            scope.obs["REGISTRATION FEES"] = "100";

            scope.saveAndPrint();

            expect(scope.encounter.observations.length).toBe(5);
            expect(scope.encounter.observations).toContain({ conceptUUID: 'b4a52102-c79a-11e2-b0c0-8e397087571c', conceptName: 'REGISTRATION FEES', value: '100' });
            expect(scope.encounter.observations).toContain({ conceptUUID: 'b4aa3728-c79a-11e2-b0c0-8e397087571c', conceptName: 'WEIGHT', value: null });
            expect(scope.encounter.observations).toContain({ conceptUUID: 'b499a980-c79a-11e2-b0c0-8e397087571c', conceptName: 'COMMENTS', value: 'fine' })
            expect(scope.encounter.observations).toContain({ conceptUUID: 'b4acc09c-c79a-11e2-b0c0-8e397087571c', conceptName: 'BMI', value: null });
            expect(scope.encounter.observations).toContain({ conceptUUID: 'b4a7aa80-c79a-11e2-b0c0-8e397087571c', conceptName: 'HEIGHT', value: null });
            expect(visitService.create).toHaveBeenCalledWith(scope.encounter);
        });

        describe("once saved and printed", function () {
            beforeEach(function () {
                $controller('VisitController', {
                    $scope: scope,
                    patientService: patientService,
                    visitService: visitService,
                    $location: $location,
                    spinner: spinner,
                    date: date
                });
                getPromise.callSuccessCallBack(sampleEncounter);

                scope.print = jasmine.createSpy().andCallFake(stubOnePromise);
                scope.save = jasmine.createSpy().andCallFake(stubOnePromise);
                spyOn(scope, 'validate').andCallFake(stubOnePromise);
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

            it("should clear the stored patient on success", function () {
                scope.saveAndPrint();

                expect(patientService.clearPatient).toHaveBeenCalled();
            });
        });
    });

    describe("submit", function () {
        beforeEach(function () {
            $controller('VisitController', {
                $scope: scope,
                visitService: visitService,
                patientService: patientService,
                spinner: spinner,
            });
            getPromise.callSuccessCallBack(sampleEncounter);

            visitService.create.andCallFake(stubOnePromise);
            patientService.clearPatient.andCallFake(stubOnePromise);
            scope.patient = {uuid: "21308498-2502-4495-b604-7b704a55522d"}
            spyOn(scope, 'print').andCallFake(stubOnePromise);
            spyOn($location, 'path');
            spyOn(scope, 'validate').andCallFake(stubOnePromise);
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

    describe("calculateBMI", function () {
        beforeEach(function () {
            $controller('VisitController', {
                $scope: scope,
                spinner: spinner,
                visitService: visitService,
                patientService: patientService
            });
            getPromise.callSuccessCallBack(sampleEncounter);
        });

        it("should set bmi, bmi_status and bmi_error when height and weight are present", function () {
            scope.obs.HEIGHT = 50;
            scope.obs.WEIGHT = 100;

            scope.calculateBMI();

            expect(scope.obs.BMI).toBe(400);
            expect(scope.obs.bmi_error).toBe(true);
            expect(scope.obs.bmi_status).toBe("Invalid");

        });

        it("should clear the bmi, bmi_status when height is not present", function () {
            scope.obs.BMI = 200;
            scope.obs.bmi_status = "Invalid";
            scope.obs.bmi_error = true;
            scope.obs.HEIGHT = null;
            scope.obs.WEIGHT = 100;

            scope.calculateBMI();

            expect(scope.obs.BMI).toBe(null);
            expect(scope.obs.bmi_error).toBe(false);
            expect(scope.obs.bmi_status).toBe(null);
        });

        it("should clear the bmi, bmi_status when weight is not present", function () {
            scope.obs.BMI = 200;
            scope.obs.bmi_status = "Invalid";
            scope.obs.bmi_error = true;
            scope.obs.HEIGHT = 100;
            scope.obs.WEIGHT = null;

            scope.calculateBMI();

            expect(scope.obs.BMI).toBe(null);
            expect(scope.obs.bmi_error).toBe(false);
            expect(scope.obs.bmi_status).toBe(null);
        });
    });
});