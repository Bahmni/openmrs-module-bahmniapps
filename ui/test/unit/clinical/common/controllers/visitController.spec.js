'use strict';

describe('VisitController', function () {
    var scope;
    var $controller;
    var success;
    var encounterService;
    var patient;
    var dateUtil;
    var $timeout;
    var getEncounterPromise;
    var configurations = {
        encounterConfig: function () {
        }
    };
    var clinicalAppConfigService = {
        getVisitConfig: function () {
        }
    };
    var q;
    var state;
    var rootScope;
    var controller;
    var stubAllPromise = function () {
        return {
            then: function () {
                return stubAllPromise();
            }
        }
    };

    beforeEach(module('bahmni.clinical'));
    beforeEach(module('stateMock'));
    beforeEach(inject(['$injector', '$timeout', '$q', '$rootScope', '$state', function ($injector, timeout, $q, $rootScope, $state) {
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
        getEncounterPromise = specUtil.createServicePromise('getEncountersForEncounterType');
        encounterService.getEncountersForEncounterType.and.returnValue(getEncounterPromise);
        spyOn(clinicalAppConfigService, 'getVisitConfig').and.returnValue([]);
        spyOn(configurations, 'encounterConfig').and.returnValue({
            getPatientDocumentEncounterTypeUuid: function () {
                return "patient-document-encounter-typeuuid";
            }
        });
        scope.currentProvider = {uuid: ''};
        controller =   $controller('VisitController', {
                $scope: scope,
                $state: state,
                encounterService: encounterService,
                clinicalAppConfigService: clinicalAppConfigService,
                visitSummary: {},
                configurations: configurations,
                $timeout: $timeout,
                printer: {},
                visitConfig: visitTabConfig,
                visitHistory:[],
                $stateParams: {}
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
            expect(scope.displayDate(new Date('2014', '7', '15', '12'))).toBe('15-Aug-14');
        });

        it('should check test result class for expected style', function () {
            var inputLine = {isSummary: true};
            var expectedStyle =  {"pending-result": true, "header": true};
            expect(scope.testResultClass(inputLine)).toEqual(expectedStyle);
        });
    });

});