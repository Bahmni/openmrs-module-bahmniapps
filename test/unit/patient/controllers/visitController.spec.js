'use strict';

describe('VisitController', function () {
    var scope = { "$watch": jasmine.createSpy() };
    var $controller;
    var conceptService;
    var success;
    var visitService;
    var patientService;
    var patient;
    var date;
    var $location;
    var $window;
    var $timeout;
    var spinner;
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

    var sampleConcepts = {
        "results": [
            {
                "setMembers": [
                    {
                        "uuid": "d7c66ef3-1f55-4b83-8f10-009e4acec1e3",
                        "name": {
                            "name": "COMMENTS"
                        }
                    },
                    {
                        "uuid": "8032ad29-0591-4ec6-9776-22e7a3062df8",
                        "name": {
                            "name": "REGISTRATION FEES"
                        }
                    }
                ]
            }
        ]
    }

    beforeEach(module('registration.visitController'));
    beforeEach(inject(['$injector', 'date', '$location', '$window', '$timeout', function ($injector, dateModule, location, window, timeout) {
        $controller = $injector.get('$controller');
        patientService = jasmine.createSpyObj('patientService', ['getPatient', 'clearPatient']);
        date = dateModule;
        patient = {};
        $location = location;
        $window = window;
        $timeout = timeout;
        patientService.getPatient.andReturn(patient);
        success = jasmine.createSpy();
        conceptService = {
            getRegistrationConcepts: function () {
                return {
                    success: function (callBack) {
                        callBack(sampleConcepts);
                    }
                }
            }
        };
        spinner = jasmine.createSpyObj('spinner', ['forPromise'])
        visitService = jasmine.createSpyObj('visitService', ['create', 'clearPatient']);
    }]));

    describe('initialization', function () {
        it('should set the patient from patient data and the default registration fee', function () {
            patient.isNew = true;
            $controller('VisitController', {
                $scope: scope,
                concept: conceptService,
                spinner: spinner,
                patientService: patientService
            });

            expect(scope.obs.registration_fees).toBe(defaults.registration_fees_newPatient);
            expect(scope.patient).toBe(patient);
        });

        it('should set the registration fee for returning patient', function () {
            patient.isNew = false;
            $controller('VisitController', {
                $scope: scope,
                concept: conceptService,
                spinner: spinner,
                patientService: patientService
            });

            expect(scope.obs.registration_fees).toBe(defaults.registration_fees_oldPatient);
            expect(scope.patient).toBe(patient);
        });
    });

    describe("validate", function () {
        beforeEach(function () {
            scope = { "$watch": jasmine.createSpy() };
            $controller('VisitController', {
                $scope: scope,
                concept: conceptService,
                patientService: patientService,
                visitService: visitService,
                $location: $location,
                spinner: spinner,
                date: date
            });
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
            scope.obs.registration_fees = 0;
            scope.obs.comments = '';
            scope.confirmDialog = jasmine.createSpyObj('confirmDialog', ['show']);
            scope.confirmDialog.show.andCallFake(stubOnePromise);

            scope.validate();

            expect(scope.confirmDialog.show).toHaveBeenCalled();
        });

        it("should not open popup when consultation fee != 0", function () {
            scope.obs.registration_fees = 10;
            scope.obs.comments = '';
            scope.confirmDialog = jasmine.createSpyObj('confirmDialog', ['show']);
            scope.confirmDialog.show.andCallFake(stubOnePromise);

            scope.validate();

            expect(scope.confirmDialog.show).not.toHaveBeenCalled();
        });

        it("should not open popup when comments are not empty", function () {
            scope.obs.registration_fees = 0;
            scope.obs.comments = 'adfadfs';
            scope.confirmDialog = jasmine.createSpyObj('confirmDialog', ['show']);
            scope.confirmDialog.show.andCallFake(stubOnePromise);

            scope.validate();

            expect(scope.confirmDialog.show).not.toHaveBeenCalled();
        })

        it("should always return a promise", function () {
            scope.obs.registration_fees = 0;
            scope.obs.comments = 'adfadfs';
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
                concept: conceptService,
                patientService: patientService,
                visitService: visitService,
                $location: $location,
                spinner: spinner,
                date: date
            });
            visitService.create.andCallFake(stubOnePromise);
            patientService.clearPatient.andCallFake(stubOnePromise);
            scope.patient = {uuid: "21308498-2502-4495-b604-7b704a55522d", isNew: "true"};
            spyOn(scope, 'validate').andCallFake(stubOnePromise);
        });

        it("should create visit", function () {
            var now = new Date();
            spyOn(date, "now").andReturn(now);
            scope.print = jasmine.createSpy().andCallFake(stubOnePromise);
            scope.obs.comments = "fine";
            scope.obs.registration_fees = "100";

            scope.saveAndPrint();

            expect(scope.visit.patient).toBe(scope.patient.uuid);
            expect(scope.visit.startDatetime).toBe(now.toISOString());
            expect(scope.visit.visitType).toBe(constants.visitType.registration);
            expect(scope.encounter.patient).toBe(scope.patient.uuid);
            expect(scope.encounter.encounterDatetime).toBe(now.toISOString());
            expect(scope.encounter.encounterType).toBe(constants.visitType.registration);
            expect(scope.encounter.obs).toEqual([
                {concept: "d7c66ef3-1f55-4b83-8f10-009e4acec1e3", value: "fine"},
                {concept: "8032ad29-0591-4ec6-9776-22e7a3062df8", value: "100"}
            ])
            expect(scope.visit.encounters).toEqual([scope.encounter]);
            expect(visitService.create).toHaveBeenCalledWith(scope.visit);
        });

        describe("once saved and printed", function () {
            beforeEach(function () {
                scope = { "$watch": jasmine.createSpy() };
                $controller('VisitController', {
                    $scope: scope,
                    concept: conceptService,
                    patientService: patientService,
                    visitService: visitService,
                    $location: $location,
                    spinner: spinner,
                    date: date
                });
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
                concept: conceptService,
                patientService: patientService,
                spinner: spinner,
                visitService: visitService
            });
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
                concept: conceptService,
                spinner: spinner,
                patientService: patientService
            });
        });

        it("should set bmi, bmi_status and bmi_error when height and weight are present", function () {
            scope.obs.height = 50;
            scope.obs.weight = 100;

            scope.calculateBMI();

            expect(scope.obs.bmi).toBe(400);
            expect(scope.obs.bmi_error).toBe(true);
            expect(scope.obs.bmi_status).toBe("Invalid");

        });

        it("should clear the bmi, bmi_status when height is not present", function () {
            scope.obs.bmi = 200;
            scope.obs.bmi_status = "Invalid";
            scope.obs.bmi_error = true;
            scope.obs.height = null;
            scope.obs.weight = 100;

            scope.calculateBMI();

            expect(scope.obs.bmi).toBe(null);
            expect(scope.obs.bmi_error).toBe(false);
            expect(scope.obs.bmi_status).toBe(null);
        });

        it("should clear the bmi, bmi_status when weight is not present", function () {
            scope.obs.bmi = 200;
            scope.obs.bmi_status = "Invalid";
            scope.obs.bmi_error = true;
            scope.obs.height = 100;
            scope.obs.weight = null;

            scope.calculateBMI();

            expect(scope.obs.bmi).toBe(null);
            expect(scope.obs.bmi_error).toBe(false);
            expect(scope.obs.bmi_status).toBe(null);
        });
    });
});