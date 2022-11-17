/* eslint-disable angular/module-getter */
/* eslint-disable angular/di */
'use strict';

describe("Recent patients", function () {
    var element, scope, $compile, httpBackend, state, provide, patientService, sessionService;

    beforeEach(module('bahmni.clinical'));
    beforeEach(module(function ($provide) {
        provide = $provide;
        provide.value('$stateParams', {configName: 'default'});
        provide.value('clinicalDashboardConfig', {
            getMaxRecentlyViewedPatients: function () {
                return 3;
            }
        });
        state = jasmine.createSpyObj('$state', ['go']);
        provide.value('$state', state);
        patientService = jasmine.createSpyObj('patientService', ['findPatients']);
        sessionService = jasmine.createSpyObj('sessionService', ['getLoginLocationUuid']);
        sessionService.getLoginLocationUuid.and.returnValue("uuid");
        provide.value('patientService', patientService);
        provide.value('sessionService', sessionService);
    }));

    beforeEach(inject(function (_$compile_, $rootScope, $httpBackend) {
        scope = $rootScope;
        $compile = _$compile_;
        httpBackend = $httpBackend;
        scope.patient = {
            "uuid": "abc",
            "name": "Patient name"
        };
        scope.currentUser = {
            recentlyViewedPatients: [{"uuid": "patient1"}, {"uuid": "abc"}, {"uuid": "def"}, {"uuid": "ghi"}, {"uuid": "jkl"}]
        };
        createElement();
    }));

    describe('init', function () {
        it('should set show patients list to false', function () {
            expect(scope.showPatientsList).toBe(false);
        });

        it("should display only max patients as specified in config", function () {
            expect(scope.recentlyViewedPatients.length).toBe(3);
            expect(scope.recentlyViewedPatients).toEqual([{"uuid": "patient1"}, {"uuid": "abc"}, {"uuid": "def"}]);
        });

        it("should create a search object to search patients", function () {
            expect(scope.search).not.toBeUndefined();
        });

        it('should set show patients by search to false', function () {
            expect(scope.showPatientsBySearch).toBe(false);
        });

        it('should set trigger by button to true when attribute is passed', function () {
            expect(scope.showPatientsBySearch).toBe(false);
        });
    });

    describe('has previous', function () {
        it("should check whether user has visited any patient previously", function () {
            expect(scope.hasPrevious()).toBe(true);
            expect(scope.hasPrevious()).toBe(true);
        });

        it("should not have any previous patient if he/she is the first patient", function () {
            scope.currentUser = {
                recentlyViewedPatients: [{"uuid": "abc"}]
            };
            $compile(element)(scope);
            scope.$digest();

            expect(scope.hasPrevious()).toBe(false);
        });
    });

    describe('has next', function () {
        it("should check whether user has visited any patient after the current patient", function () {
            expect(scope.hasNext()).toBe(true);
        });

        it("should not have any next patient if he/she is the last patient", function () {
            scope.currentUser = {
                recentlyViewedPatients: [{"uuid": "abc"}]
            };
            $compile(element)(scope);
            scope.$digest();

            expect(scope.hasNext()).toBe(false);
        });
    });

    describe('Previous', function () {
        it("should go to previous patient in the list", function () {
            scope.currentUser = {
                recentlyViewedPatients: [{"uuid": "abc"}, {"uuid": "def"}]
            };

            $compile(element)(scope);
            scope.$digest();

            scope.previous();
            expect(state.go).toHaveBeenCalledWith('patient.dashboard', {configName: 'default', patientUuid: 'def'});
        });
    });

    describe('Next', function () {
        it("should go to next patient in the list", function () {
            scope.currentUser = {
                recentlyViewedPatients: [{"uuid": "patient1"}, {"uuid": "abc"}, {"uuid": "def"}]
            };
            $compile(element)(scope);
            scope.$digest();

            scope.next();

            expect(state.go).toHaveBeenCalledWith('patient.dashboard', {
                configName: 'default',
                patientUuid: 'patient1'
            });
        });
    });

    describe("toggle patients list", function () {
        it("should toggle to true from false", function () {
            expect(scope.showPatientsList).toBe(false);

            scope.togglePatientsList();

            expect(scope.showPatientsList).toBe(true);
        });

        it("should toggle to false from true", function () {
            scope.showPatientsList = true;

            scope.togglePatientsList();

            expect(scope.showPatientsList).toBe(false);
        });
    });

    describe("hidePatientsBySearch", function () {
        it("should set showPatientsBySearch to false", function () {
            scope.showPatientsBySearch = true;

            scope.hidePatientsBySearch();

            expect(scope.showPatientsBySearch).toBe(false);
        });
    });

    describe("clearSearch", function () {
        it("should set search parameter to empty", function () {
            scope.search.searchParameter = "John";

            scope.clearSearch();

            expect(scope.search.searchParameter).toBe("");
        });
    });

    describe("getActivePatients", function () {
        beforeEach(inject(function ($q) {
            var patients = {
                data: [{
                    uuid: 'uuid1'
                }]
            };

            patientService.findPatients.and.returnValue(function () {
                var deferred = $q.defer();
                deferred.resolve(patients);
                return deferred.promise;
            }());
        }));

        it('should set show patients by search to true', function () {
            scope.showPatientsBySearch = false;
            scope.getActivePatients();
            expect(scope.showPatientsBySearch).toBe(true);
        });

        it("should make a call to get active patients and store pass it to search object", function () {
            scope.getActivePatients();
            scope.$digest();

            expect(patientService.findPatients).toHaveBeenCalledWith({q: 'emrapi.sqlSearch.activePatients', location_uuid: 'uuid'});

            expect(scope.search.patientsCount()).toBe(1);
        });

        it("should not make a call to get active patients if it already fetched", function () {
            scope.getActivePatients();
            scope.$digest();
            scope.getActivePatients();

            expect(patientService.findPatients).toHaveBeenCalledWith({q: 'emrapi.sqlSearch.activePatients', location_uuid: 'uuid'});
            expect(patientService.findPatients.calls.count()).toBe(1);
            expect(scope.search.patientsCount()).toBe(1);
        });
    });

    var createElement = function () {
        element = angular.element('<recent-patients triggred-by-button></recent-patients>');
        httpBackend.expectGET('dashboard/views/recentPatients.html').respond('<div>dummy</div>');

        $compile(element)(scope);
        scope.$digest();
        httpBackend.flush();
    };
});
