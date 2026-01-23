/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

describe('VisitController', function () {
    var scope, $controller, success, encounterService, patient, dateUtil, $timeout, getEncounterPromise, window;
    var locationService, appService, $location, auditLogService, sessionService, visitService;
    var q, state, rootScope, controller, allergyService;
    var configurations = {
        encounterConfig: function () {
        }
    };
    var clinicalAppConfigService = {
        getVisitConfig: function () {
        }
    };
    var stubAllPromise = function () {
        return {
            then: function () {
                return stubAllPromise();
            }
        }
    };
    var allergiesMock = {
        data: {
            entry: [
                {resource: { code: {coding:[{display: "No Known Allergy"}]}}},
                {resource: { code: {coding:[{display: "Eggs"}]}}}
            ],
        },
        status: 200
    };

    beforeEach(module('bahmni.clinical'));
    beforeEach(module('stateMock'));
    beforeEach(inject(['$injector', '$timeout', '$q', '$rootScope', '$state', '$window', function ($injector, timeout, $q, $rootScope, $state, $window) {
        q = $q;
        rootScope = $rootScope;
        patient = {
            uuid: "21308498-2502-4495-b604-7b704a55522d",
            isNew: "true",
            person: {
                names: [
                    "name"
                ]
            }
        };
        state = $state;
        state.current = state.current || {views: {'dashboard-content': {templateUrl: "/template/url"}}};
        state.go = state.go || function() {};
        state.href = state.href || function() {};
        $controller = $injector.get('$controller');
        scope = $rootScope.$new();
        scope.patient = patient;
        dateUtil = Bahmni.Common.Util.DateUtil;
        $timeout = timeout;
        success = jasmine.createSpy();
        encounterService = jasmine.createSpyObj('encounterService', ['getEncountersForEncounterType']);
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        getEncounterPromise = specUtil.createServicePromise('getEncountersForEncounterType');
        allergyService = jasmine.createSpyObj('allergyService', ['getAllergyForPatient', 'getNoKnownAllergyUuid']);
        visitService = jasmine.createSpyObj('visitService', ['getVisit']);
        $location = jasmine.createSpyObj('$location', ['search']);
        auditLogService = jasmine.createSpyObj('auditLogService', ['log']);
        sessionService = jasmine.createSpyObj('sessionService', ['destroy']);
        allergyService.getAllergyForPatient.and.returnValue(Promise.resolve(allergiesMock));
        allergyService.getNoKnownAllergyUuid.and.returnValue(Promise.resolve("no-known-allergy-uuid"));
        encounterService.getEncountersForEncounterType.and.returnValue(getEncounterPromise);
        visitService.getVisit.and.returnValue(Promise.resolve({data: {encounters: []}}));
        $location.search.and.returnValue({source: "clinical"});
        window = $window;
        auditLogService.log.and.returnValue({
            then: function(callback) { return callback(); }
        });
        sessionService.destroy.and.returnValue({
            then: function() { }
        });
        spyOn(clinicalAppConfigService, 'getVisitConfig').and.returnValue([]);
        spyOn(configurations, 'encounterConfig').and.returnValue({
            getPatientDocumentEncounterTypeUuid: function () {
                return "patient-document-encounter-typeuuid";
            }
        });
        locationService = jasmine.createSpyObj('locationService', ['getAllByTag']);
        locationService.getAllByTag.and.callFake(function () {
            return specUtil.respondWith({"data": {"results": [
                        {name: "Bahmni", attributes: [
                                { display: "Print Header: xyz" }]
                        }]}});
        });
        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function () {
                return "";
            },
            getConfig: function () {
            }
        });
        scope.currentProvider = {uuid: ''};
        controller =   $controller('VisitController', {
                $scope: scope,
                $rootScope: {quickLogoutComboKey: 'Escape', cookieExpiryTime: 30},
                $state: state,
                encounterService: encounterService,
                clinicalAppConfigService: clinicalAppConfigService,
                visitSummary: {},
                configurations: configurations,
                $timeout: $timeout,
                printer: {},
                visitConfig: visitTabConfig,
                visitHistory:[],
                $stateParams: {},
                locationService: locationService,
                visitService: visitService,
                appService: appService,
                allergyService: allergyService,
                auditLogService: auditLogService,
                sessionService: sessionService,
                $location: $location,
                $window: window
            });
    }]));

    var defaultTab = {
        title: "visit",
        displayByDefault: true,
        investigationResult: {
            title: "Lab Investigations",
            showChart: false,
            showTable: false,
            numberOfVisits: 1
        },
        treatment: {
            title: "Treatments",
            showFlowSheet: false,
            showListView: false
        }
    };

    var pivotTableTab = {
        title: "pivot table",
        pivotTable:{
            conceptNames:["vitals"]
        }
    };
    var visitTabConfig = new Bahmni.Clinical.VisitTabConfig([defaultTab, pivotTableTab]);

    describe('initialization', function () {
        it('should pick default tab as current tab.', function () {
            expect(scope.visitTabConfig.currentTab).toBe(defaultTab);
        });

        it('should check is numeric.', function () {
            expect(scope.isNumeric(5)).toBeTruthy();
            expect(scope.isNumeric('string')).toBeFalsy();
        });

        it('should check is empty', function () {
            expect(scope.isEmpty('Some content')).toBeFalsy();
            expect(scope.isEmpty('')).toBeTruthy();
        });

        it('should check data format', function () {
            expect(scope.displayDate(new Date('2014', '7', '15', '12'))).toBe('15-Aug-2014');
        });

        it('should check test result class for expected style', function () {
            var inputLine = {isSummary: true};
            var expectedStyle =  {"pending-result": true, "header": true};
            expect(scope.testResultClass(inputLine)).toEqual(expectedStyle);
        });

        it('should handle on print event', function () {
            scope.visitTabConfig.currentTab.printing = {templateUrl: 'common/views/visitTabPrint.html', observationsConcepts: ["WEIGHT"]}
            scope.$broadcast("event:printVisitTab", {});
            expect(allergyService.getAllergyForPatient).toHaveBeenCalled();
        });


        it('should call auditLogService.log and sessionService.destroy on logout', function (){
            scope.ipdDashboard.hostApi.onLogOut();
            expect(auditLogService.log).toHaveBeenCalledWith(undefined, 'USER_LOGOUT_SUCCESS', undefined, 'MODULE_LABEL_LOGOUT_KEY');
            expect(sessionService.destroy).toHaveBeenCalled();
        });

        it('should call auditLogService.log while handleAuditEvent is triggered', function (){
            scope.ipdDashboard.hostApi.handleAuditEvent('test_patient_id','CREATE_SCHEDULED_MEDICATION_TASK','test_message_params','MODULE_LABEL_CLINICAL_KEY');
            expect(auditLogService.log).toHaveBeenCalledWith('test_patient_id','CREATE_SCHEDULED_MEDICATION_TASK','test_message_params','MODULE_LABEL_CLINICAL_KEY');
        });

        it('should call handleLogoutShortcut on keydown event', function (){
            spyOn(scope.ipdDashboard.hostApi, 'onLogOut');
            window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape', 'metaKey': true, 'ctrlKey': false}));
            expect(scope.ipdDashboard.hostApi.onLogOut).toHaveBeenCalled();
        });
        it('should remove event listener on scope destroy', function () {
            spyOn(window, 'removeEventListener');
            scope.$destroy();
            expect(window.removeEventListener).toHaveBeenCalledWith('keydown', jasmine.any(Function));
        });
    });

    function createController(rootScope) {
        return $controller('VisitController', {
            $scope: scope,
            $rootScope: rootScope,
            $state: state,
            encounterService: encounterService,
            clinicalAppConfigService: clinicalAppConfigService,
            visitSummary: {},
            configurations: configurations,
            $timeout: $timeout,
            printer: {},
            visitConfig: visitTabConfig,
            visitHistory: [],
            $stateParams: {},
            locationService: locationService,
            visitService: visitService,
            appService: appService,
            allergyService: allergyService,
            auditLogService: auditLogService,
            sessionService: sessionService,
            $location: $location,
            $window: window
        });
        }

    describe('privileges handling', function () {
        it('should set empty privileges array when rootScope.currentUser is undefined', function () {
            rootScope.currentUser = undefined;
            createController(rootScope);
            expect(scope.ipdDashboard.hostData.privileges).toEqual([]);
        });

        it('should set empty privileges array when rootScope.currentUser.privileges is undefined', function () {
            rootScope.currentUser = {
                uuid: 'user-uuid',
                username: 'testuser'
            };
            createController(rootScope);
            expect(scope.ipdDashboard.hostData.privileges).toEqual([]);
        });

        it('should handle empty privileges array from rootScope.currentUser', function () {
            rootScope.currentUser = {
                uuid: 'user-uuid',
                username: 'testuser',
                privileges: []
            };
            createController(rootScope);
            expect(scope.ipdDashboard.hostData.privileges).toEqual([]);
        });

        it('should ensure privileges are included in ipdDashboard.hostData structure', function () {
            var mockPrivileges = [{ name: 'Test Privilege' }];
            rootScope.currentUser = {
                privileges: mockPrivileges
            };
            createController(rootScope);
            expect(scope.ipdDashboard.hostData).toBeDefined();
            expect(scope.ipdDashboard.hostData.privileges).toBeDefined();
            expect(scope.ipdDashboard.hostData.privileges).toEqual(mockPrivileges);
        });
    });

    describe('template URL handling', function () {
        it('should pick template from print-content view when dashboard-content templateUrl is not available', function () {
            state.current = {views: {'dashboard-content': {}, 'print-content': {templateUrl: '/print/template/url'}}};
            createController(rootScope);
            expect(scope.currentVisitUrl).toBe('/print/template/url');
        });

        it('should pick template from dashboard-content view when available', function () {
            state.current = {views: {'dashboard-content': {templateUrl: '/dashboard/template/url'}}};
            createController(rootScope);
            expect(scope.currentVisitUrl).toBe('/dashboard/template/url');
        });
    });

    describe('config handling', function () {
        it('should set showProviderInfo to false when config is explicitly false', function () {
            appService.getAppDescriptor.and.returnValue({
                getConfigValue: function (key) {
                    if (key === 'showProviderInfoinVisits') return false;
                    return undefined;
                }
            });
            createController(rootScope);
            expect(scope.showProviderInfo).toBe(false);
        });

        it('should set showProviderInfo to true when config is not defined', function () {
            appService.getAppDescriptor.and.returnValue({
                getConfigValue: function () {
                    return undefined;
                }
            });
            createController(rootScope);
            expect(scope.showProviderInfo).toBe(true);
        });

        it('should set showPatientInformation to false when config is explicitly false', function () {
            appService.getAppDescriptor.and.returnValue({
                getConfigValue: function (key) {
                    if (key === 'showPatientInfoInVisits') return false;
                    return undefined;
                }
            });
            createController(rootScope);
            expect(scope.showPatientInformation).toBe(false);
        });

        it('should set showPatientInformation to true when config is not defined', function () {
            appService.getAppDescriptor.and.returnValue({
                getConfigValue: function () {
                    return undefined;
                }
            });
            createController(rootScope);
            expect(scope.showPatientInformation).toBe(true);
        });
    });

    describe('IPD visit mode logic', function () {
        it('should set isIpdReadMode to false when visit is IPD and not stopped', function () {
            var visitSummary = {visitType: 'IPD', stopDateTime: null};
            $controller('VisitController', {
                $scope: scope,
                $rootScope: rootScope,
                $state: state,
                encounterService: encounterService,
                clinicalAppConfigService: clinicalAppConfigService,
                visitSummary: visitSummary,
                configurations: configurations,
                $timeout: $timeout,
                printer: {},
                visitConfig: visitTabConfig,
                visitHistory: [],
                $stateParams: {},
                locationService: locationService,
                visitService: visitService,
                appService: appService,
                allergyService: allergyService,
                auditLogService: auditLogService,
                sessionService: sessionService,
                $location: $location,
                $window: window
            });
            expect(scope.isIpdReadMode).toBe(false);
            expect(scope.isActiveIpdVisit).toBe(true);
        });

        it('should set isIpdReadMode to true when visit is IPD and stopped', function () {
            var visitSummary = {visitType: 'IPD', stopDateTime: '2024-01-01'};
            $controller('VisitController', {
                $scope: scope,
                $rootScope: rootScope,
                $state: state,
                encounterService: encounterService,
                clinicalAppConfigService: clinicalAppConfigService,
                visitSummary: visitSummary,
                configurations: configurations,
                $timeout: $timeout,
                printer: {},
                visitConfig: visitTabConfig,
                visitHistory: [],
                $stateParams: {},
                locationService: locationService,
                visitService: visitService,
                appService: appService,
                allergyService: allergyService,
                auditLogService: auditLogService,
                sessionService: sessionService,
                $location: $location,
                $window: window
            });
            expect(scope.isIpdReadMode).toBe(true);
            expect(scope.isActiveIpdVisit).toBe(true);
        });

        it('should set isIpdReadMode to true when visit is not IPD', function () {
            var visitSummary = {visitType: 'OPD', stopDateTime: null};
            $controller('VisitController', {
                $scope: scope,
                $rootScope: rootScope,
                $state: state,
                encounterService: encounterService,
                clinicalAppConfigService: clinicalAppConfigService,
                visitSummary: visitSummary,
                configurations: configurations,
                $timeout: $timeout,
                printer: {},
                visitConfig: visitTabConfig,
                visitHistory: [],
                $stateParams: {},
                locationService: locationService,
                visitService: visitService,
                appService: appService,
                allergyService: allergyService,
                auditLogService: auditLogService,
                sessionService: sessionService,
                $location: $location,
                $window: window
            });
            expect(scope.isIpdReadMode).toBe(true);
            expect(scope.isActiveIpdVisit).toBe(false);
        });
    });

    describe('scope functions', function () {
        it('should toggle item show property', function () {
            var item = {show: false};
            scope.toggle(item);
            expect(item.show).toBe(true);
            scope.toggle(item);
            expect(item.show).toBe(false);
        });

        it('should return true for isEmpty when notes is null', function () {
            expect(scope.isEmpty(null)).toBe(true);
        });

        it('should return true for isEmpty when notes is undefined', function () {
            expect(scope.isEmpty(undefined)).toBe(true);
        });

        it('should return true for isEmpty when notes has only whitespace', function () {
            expect(scope.isEmpty('  ')).toBe(true);
        });

        it('should return false for isEmpty when notes has content', function () {
            expect(scope.isEmpty('Some notes')).toBe(false);
        });

        it('should return correct class for testResultClass with pending results', function () {
            var line = {isSummary: true, hasResults: false, name: 'Test'};
            var result = scope.testResultClass(line);
            expect(result['pending-result']).toBe(true);
            expect(result['header']).toBe(true);
        });

        it('should return correct class for testResultClass without pending results', function () {
            var line = {isSummary: true, hasResults: true, name: 'Test'};
            var result = scope.testResultClass(line);
            expect(result['pending-result']).toBeUndefined();
            expect(result['header']).toBe(true);
        });

        it('should return correct class for testResultClass for non-summary line', function () {
            var line = {isSummary: false};
            var result = scope.testResultClass(line);
            expect(result['pending-result']).toBeUndefined();
            expect(result['header']).toBeUndefined();
        });

        it('should return true for pendingResults when line is summary without results and has name', function () {
            var line = {isSummary: true, hasResults: false, name: 'Test'};
            expect(scope.pendingResults(line)).toBe(true);
        });

        it('should return false for pendingResults when line has results', function () {
            var line = {isSummary: true, hasResults: true, name: 'Test'};
            expect(scope.pendingResults(line)).toBe(false);
        });

        it('should return false for pendingResults when line has empty name', function () {
            var line = {isSummary: true, hasResults: false, name: ''};
            expect(scope.pendingResults(line)).toBe(false);
        });

        it('should return false for pendingResults when line is not summary', function () {
            var line = {isSummary: false, hasResults: false, name: 'Test'};
            expect(scope.pendingResults(line)).toBe(false);
        });
    });

    describe('event:clearVisitBoard', function () {
        it('should set clearBoard to true and then false after timeout', function () {
            scope.$broadcast('event:clearVisitBoard');
            expect(scope.clearBoard).toBe(true);
            $timeout.flush();
            expect(scope.clearBoard).toBe(false);
        });
    });

    describe('loadVisit', function () {
        it('should navigate to patient dashboard visit with given visitUuid', function () {
            spyOn(state, 'go');
            scope.loadVisit('test-visit-uuid');
            expect(state.go).toHaveBeenCalledWith('patient.dashboard.visit', {visitUuid: 'test-visit-uuid'});
        });
    });

});
