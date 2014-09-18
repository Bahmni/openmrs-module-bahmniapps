'use strict';

describe("PatientListController", function () {
        var _spinner, _patientService, _appService;
        var controller, scope, findPatientsPromise, searchPatientsPromise;
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
        
        var patients = [
            {identifier: 'GAN1234', name: 'Ram Singh', uuid: 'p-uuid-1', activeVisitUuid: 'v-uuid-1'},
            {identifier: 'BAM1234', name: 'Shyam Singh', uuid: 'p-uuid-2', activeVisitUuid: 'v-uuid-2'},
            {identifier: 'SEM1234', name: 'Ganesh Singh', uuid: 'p-uuid-3', activeVisitUuid: 'v-uuid-3'},
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

            _patientService = jasmine.createSpyObj('patientService', ['findPatients', 'search']);
            findPatientsPromise = specUtil.createServicePromise('findPatients');
            searchPatientsPromise = specUtil.createServicePromise('search');
            _patientService.findPatients.and.returnValue(findPatientsPromise);
            _patientService.search.and.returnValue(searchPatientsPromise);
        });

        beforeEach(inject(function ($rootScope) {
            scope = $rootScope.$new();
            $rootScope.patientConfig = Bahmni.Registration.PatientConfig();
            $rootScope.currentProvider = {uuid:"1111-2222"}
        }));

        var setUp = function () {
            inject(function ($controller, $rootScope) {
                controller = $controller('PatientsListController', {
                    $scope: scope,
                    patientService: _patientService,
                    appService: _appService,
                    spinner: _spinner,
                    $stateParams: stateParams
                });
            });
        };

        describe("initialization", function () {
            it('should initialize configurations and fetch patients', function () {
                scope.$apply(setUp);

                expect(scope.search.searchType).toEqual({ name: 'All active patients', display: 'All active patients', handler: 'emrapi.sqlSearch.activePatients', forwardUrl: undefined, id: 'bahmni.clinical.patients.allPatients',params:undefined });
                expect(_patientService.findPatients).toHaveBeenCalled();

                findPatientsPromise.callThenCallBack({data: patients});

                expect(scope.search.activePatients.length).toBe(patients.length);
                expect(scope.search.searchResults.length).toBe(patients.length);
            });
        });

        describe("searchPatients", function () {
            beforeEach(function() {
                scope.$apply(setUp);
            });

            it('should search for patients with given search parameter', function () {
                scope.search.searchParameter = "GAN111";
                scope.searchPatients();
                
                expect(_patientService.search).toHaveBeenCalled();

                searchPatientsPromise.callThenCallBack({data: {pageOfResults: patients}});

                expect(scope.search.activePatients.length).toBe(patients.length);
                expect(scope.search.searchResults.length).toBe(patients.length);
            });
        });
    }
); 