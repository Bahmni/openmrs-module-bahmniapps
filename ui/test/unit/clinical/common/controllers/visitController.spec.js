'use strict';

describe('VisitController', function () {
    var scope, $controller, success, encounterService, patient, dateUtil, $timeout, getEncounterPromise, window;
    var locationService, appService, $location, auditLogService, sessionService;
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
        $controller = $injector.get('$controller');
        scope = $rootScope.$new();
        scope.patient = patient;
        dateUtil = Bahmni.Common.Util.DateUtil;
        $timeout = timeout;
        success = jasmine.createSpy();
        encounterService = jasmine.createSpyObj('encounterService', ['getEncountersForEncounterType']);
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        getEncounterPromise = specUtil.createServicePromise('getEncountersForEncounterType');
        allergyService = jasmine.createSpyObj('allergyService', ['getAllergyForPatient']);
        $location = jasmine.createSpyObj('$location', ['search']);
        auditLogService = jasmine.createSpyObj('auditLogService', ['log']);
        sessionService = jasmine.createSpyObj('sessionService', ['destroy']);
        allergyService.getAllergyForPatient.and.returnValue(Promise.resolve(allergiesMock));
        encounterService.getEncountersForEncounterType.and.returnValue(getEncounterPromise);
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

        it('should call auditLogService.log and sessionService.destroy on logout', function (){
            scope.ipdDashboard.hostApi.onLogOut();
            expect(auditLogService.log).toHaveBeenCalledWith(undefined, 'USER_LOGOUT_SUCCESS', undefined, 'MODULE_LABEL_LOGOUT_KEY');
            expect(sessionService.destroy).toHaveBeenCalled();
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

});
