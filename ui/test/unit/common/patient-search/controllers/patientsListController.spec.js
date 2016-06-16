'use strict';

describe("PatientsListController", function () {
        var _spinner, _patientService, _appService, $bahmniCookieStore;
        var controller, scope, findPatientsPromise, searchPatientsPromise, retrospectiveEntryService, offlineService, getRecentPatientsPromise;
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
                    "display": "All active patients",
                    "refreshTime": "10"
                },
                "label": "All active patients",
                "order": 1,
                "requiredPrivilege": "app:clinical"
            },
            {
                "id": "bahmni.clinical.patients.all",
                "extensionPointId": "org.bahmni.patient.search",
                "type": "config",
                "extensionParams": {
                    "display": "All patients",
                    "refreshTime": "10"
                },
                "label": "All patients",
                "order": 1,
                "requiredPrivilege": "app:clinical"
            },
            {
                "id": "bahmni.clinical.patients.patientsToAdmit",
                "extensionPointId": "org.bahmni.patient.search",
                "type": "config",
                "extensionParams": {
                    "searchHandler": "emrapi.sqlSearch.patientsToAdmit",
                    "display": "Patients to be admitted",
                    "refreshTime": "10"
                },
                "label": "Patients to be admitted",
                "order": 2,
                "offline": false,
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
            $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['remove', 'put', 'get']);
            $bahmniCookieStore.get.and.callFake(function (cookie) {
                if (cookie == Bahmni.Common.Constants.locationCookieName) {
                    return {uuid: 1, display: "Location" };
                }
            });
            offlineService = jasmine.createSpyObj('offlineService', ['isOfflineApp']);

            _spinner = jasmine.createSpyObj('spinner', ['forPromise']);
            _spinner.forPromise.and.callFake(function (promiseParam) {
                return promiseParam;
            });

            _appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            _appService.getAppDescriptor.and.returnValue(
                {
                    'getExtensions': function () {
                        return appExtensions;
                    },
                    'getConfigValue': function () {
                        return {
                            "recentPatientsDuration": 14
                        }
                    }
                });

            _patientService = jasmine.createSpyObj('patientService', ['findPatients', 'search','getRecentPatients']);
            findPatientsPromise = specUtil.createServicePromise('findPatients');
            searchPatientsPromise = specUtil.createServicePromise('search');
            getRecentPatientsPromise = specUtil.createServicePromise('getRecentPatients');
            _patientService.findPatients.and.returnValue(findPatientsPromise);
            _patientService.search.and.returnValue(searchPatientsPromise);
            _patientService.getRecentPatients.and.returnValue(getRecentPatientsPromise);
            offlineService.isOfflineApp.and.returnValue(true);
        });

        beforeEach(inject(function ($rootScope) {
            scope = $rootScope.$new();
            $rootScope.patientConfig = Bahmni.Registration.PatientConfig();
            $rootScope.currentProvider = {uuid: "1111-2222"}

            var retrospectiveEntry = Bahmni.Common.Domain.RetrospectiveEntry.createFrom(Date.now());
            retrospectiveEntryService = jasmine.createSpyObj('retrospectiveEntryService', ['getRetrospectiveEntry']);
            retrospectiveEntryService.getRetrospectiveEntry.and.returnValue(retrospectiveEntry);
        }));

        var setUp = function () {
            inject(function ($controller, $rootScope) {
                controller = $controller('PatientsListController', {
                    $scope: scope,
                    patientService: _patientService,
                    appService: _appService,
                    spinner: _spinner,
                    $stateParams: stateParams,
                    retrospectiveEntryService: retrospectiveEntryService,
                    $bahmniCookieStore: $bahmniCookieStore,
                    offlineService: offlineService
                });
            });
        };

        describe("initialization", function () {
            it('should initialize configurations and fetch patients', function () {
                scope.$apply(setUp);

                expect(scope.search.searchType).toEqual({ name: 'All active patients', display: 'All active patients', handler: 'emrapi.sqlSearch.activePatients', forwardUrl: undefined, id: 'bahmni.clinical.patients.allPatients', params: undefined, refreshTime: '10', view : 'tile', additionalParams : undefined ,translationKey : undefined, patientCount : '...' });
                expect(_patientService.findPatients).toHaveBeenCalled();

                findPatientsPromise.callThenCallBack({data: patients});

                expect(scope.search.activePatients.length).toBe(patients.length);
                expect(scope.search.searchResults.length).toBe(patients.length);
            });


        });

        describe("searchPatients", function () {
            beforeEach(function () {
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



            it('should navigate to patient dashboard when the filter yields a single patient', function () {
                var ramSingh = {identifier: 'GAN1234', name: 'Ram Singh', uuid: 'p-uuid-1', activeVisitUuid: 'v-uuid-1'};
                scope.search.searchResults = [ ramSingh ];
                var result = undefined;
                scope.forwardPatient = function (patient) {
                    result = patient;
                };
                scope.filterPatientsAndSubmit();
                expect(result).toEqual(ramSingh);
            });


        });

        describe("patientCount",function(){
            beforeEach(function(){
                scope.$apply(setUp);
            });

            it('should return the patient count for the provided tab', function(){
                var searchType = { name: 'All active patients', display: 'All active patients', handler: 'emrapi.sqlSearch.activePatients', forwardUrl: undefined, id: 'bahmni.clinical.patients.allPatients', params: undefined , refreshTime: '10'};

                scope.getPatientCount(searchType);
                expect(_patientService.findPatients).toHaveBeenCalled();
                findPatientsPromise.callThenCallBack({data: patients});

                expect(searchType.patientCount).toEqual(4);
            });

        });

    describe("Offline",function(){
        beforeEach(function(){
            scope.$apply(setUp);
        });

        it('should show recent patients in all tab for offline app', function () {
            scope.$apply(setUp);
            expect(_patientService.findPatients).toHaveBeenCalled();

            scope.search.searchType = {
                "id": "bahmni.clinical.patients.all",
                "extensionPointId": "org.bahmni.patient.search",
                "type": "config",
                "extensionParams": {
                    "display": "All patients",
                    "refreshTime": "10"
                },
                "label": "All patients",
                "order": 1,
                "requiredPrivilege": "app:clinical"
            };


            scope.$apply();

            expect(offlineService.isOfflineApp).toHaveBeenCalled();
            expect(_patientService.getRecentPatients).toHaveBeenCalled();
        });

        it('should not display tab in offline app if offline is set to false in tab config', function(){
            expect(scope.search.searchTypes.length).toBe(2);
        });

    });
    }
); 