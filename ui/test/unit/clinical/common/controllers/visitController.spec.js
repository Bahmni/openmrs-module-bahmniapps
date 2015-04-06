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
        state.current = state.current || {views: {content: {templateUrl: "/template/url"}}};
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
    }]));

    var defaultTab = {
        title: "visit",
        default: true,
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
            $controller('VisitController', {
                $scope: scope,
                $state: state,
                encounterService: encounterService,
                clinicalAppConfigService: clinicalAppConfigService,
                visitSummary: {},
                configurations: configurations,
                $timeout: $timeout,
                printer: {},
                visitTabConfig: visitTabConfig,
                visitHistory:[],
                $stateParams: {}
            });

            expect(scope.visitTabConfig.currentTab).toBe(defaultTab);
        });
    });

});