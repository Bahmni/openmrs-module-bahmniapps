'use strict';

describe("PatientListController", function () {
        var _spinner, _patientService, _appService;
        var controller, scope;
        var stateParams = { location: "Ganiyari"};

        beforeEach(module('bahmni.common.patientSearch'));
        beforeEach(module('bahmni.common.uiHelper'));

        var appExtensions = [
            {
                "id": "bahmni.clinical.patients.allPatients",
                "extensionPointId": "org.bahmni.patient.search",
                "type": "config",
                "extensionParams": {
                    "searchHandler": "emrapi.sqlSearch.activePatients",
                    "display": "All active patients"
                },
                "label": "All active patients",
                "order": 1,
                "requiredPrivilege": "app:clinical"
            },
            {
                "id": "bahmni.clinical.patients.patientsToAdmit",
                "extensionPointId": "org.bahmni.patient.search",
                "type": "config",
                "extensionParams": {
                    "searchHandler": "emrapi.sqlSearch.patientsToAdmit",
                    "display": "Patients to be admitted"
                },
                "label": "Patients to be admitted",
                "order": 2,
                "requiredPrivilege": "app:clinical"
            }
        ];
        
        var allActivePatients = [
            {identifier: 'GAN1234', name: 'Ram Singh', uuid: 'p-uuid-1', activeVisitUuid: 'v-uuid-1'},
            {identifier: 'BAM1234', name: 'Shyam Singh', uuid: 'p-uuid-2', activeVisitUuid: 'v-uuid-2'},
            {identifier: 'SEM1234', name: 'Ganesh Singh', uuid: 'p-uuid-3', activeVisitUuid: 'v-uuid-3'},
            {identifier: 'GAN1235', name: 'Gani Singh', uuid: 'p-uuid-4', activeVisitUuid: 'v-uuid-4'}
        ];
        
        var allActivePatientsForAdmission = [
            {identifier: 'GAN1235', name: 'Gani Singh', uuid: 'p-uuid-4', activeVisitUuid: 'v-uuid-4'}
        ];

        beforeEach(function () {
            _spinner = jasmine.createSpyObj('spinner', ['forPromise']);
            _spinner.forPromise.and.callFake(function (promiseParam) {
                return promiseParam;
            });

            _appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            _appService.getAppDescriptor.and.returnValue({'getExtensions': function () {
                return appExtensions;
            } });

            _patientService = jasmine.createSpyObj('patientService', ['findPatients']);
            _patientService.findPatients.and.callFake(function (param) {
                if (param.q === "emrapi.sqlSearch.activePatients") {
                    return specUtil.respondWith({"data": allActivePatients})
                } else if (param.q === "emrapi.sqlSearch.patientsToAdmit") {
                    return specUtil.respondWith({"data": allActivePatientsForAdmission});
                }
                fail();
            });
        });

        var setUp = function () {
            inject(function ($controller, $rootScope) {
                scope = $rootScope.$new();
                $rootScope.patientConfig = Bahmni.Registration.PatientConfig();
                $rootScope.currentProvider = {uuid:"1111-2222"}
                controller = $controller('PatientsListController', {
                    $scope: scope,
                    $rootScope: $rootScope,
                    patientService: _patientService,
                    appService: _appService,
                    spinner: _spinner,
                    $stateParams: stateParams,
                    $q: Q
                });
            });
        };

        describe("initialization", function () {
            it('should initialize configurations', function (done) {
                setUp();
                controller.loaded.then(function () {
                    expect(_patientService.findPatients).toHaveBeenCalled();
                    expect(scope.searchResults.length).toBe(4);
                    expect(scope.searchCriteria.type).toEqual({ name: 'All active patients', display: 'All active patients', handler: 'emrapi.sqlSearch.activePatients', forwardUrl: undefined, id: 'bahmni.clinical.patients.allPatients',params:undefined });
                    done();
                })
            });
        });

        describe("searchPatientsTest", function () {
            it('should search the activePatients based on the search text (case insensitive)', function (done) {
                setUp();
                controller.loaded.then(function () {
                    scope.searchCriteria.searchParameter = "Gan";
                    scope.searchPatients();
                    expect(scope.searchResults.length).toBe(3);
                    expect(scope.visiblePatients.length).toBe(3);
                    done();
                });
            });

            it('should filter the activePatients to be admitted based on the search text', function (done) {
                setUp();
                controller.loaded.then(function () {
                    scope.switchSearchType({handler:"emrapi.sqlSearch.patientsToAdmit"}).then(function() {
                        scope.searchCriteria.searchParameter = "Gan";
                        scope.searchPatients();
                        expect(scope.searchResults.length).toBe(1);
                        expect(scope.visiblePatients.length).toBe(1);
                        done();    
                    });
                });
            });
        });

    }
); 