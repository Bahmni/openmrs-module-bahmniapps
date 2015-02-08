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
        encounterConfig:function(){}
    };
    var clinicalAppConfigService ={
        getVisitConfig: function(){}
    };
    var q;
    var state;
    var rootScope ;
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
        state.current =  state.current || {views :{content:{templateUrl:"/template/url"}}};
        $controller = $injector.get('$controller');
        scope = $rootScope.$new() ;
        scope.patient=patient;
        dateUtil = Bahmni.Common.Util.DateUtil;
        $timeout = timeout;
        success = jasmine.createSpy();
        encounterService = jasmine.createSpyObj('encounterService', ['getEncountersForEncounterType']);
        getEncounterPromise = specUtil.createServicePromise('getEncountersForEncounterType');
        encounterService.getEncountersForEncounterType.and.returnValue(getEncounterPromise);
        spyOn(clinicalAppConfigService,'getVisitConfig').and.returnValue([]);
        spyOn(configurations,'encounterConfig').and.returnValue({
            getPatientDocumentEncounterTypeUuid:function(){   return "patient-document-encounter-typeuuid"; }
        });
        scope.currentProvider = {uuid: ''};
    }]));

    var visitPageConfig ={
        title:"visit",
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

    describe('initialization', function () {
        it('should pick default config for each section on visit page ',function(){
            $controller('VisitController', {
                $scope: scope,
                $state:state,
                encounterService: encounterService,
                clinicalAppConfigService:clinicalAppConfigService,
                visitSummary:{},
                visitContext:{},
                configurations:configurations,
                $timeout:$timeout,
                printer:{}
            });

            expect(scope.visitPageConfig.investigationResult.showChart).toBeFalsy();
            expect(scope.visitPageConfig.investigationResult.showTable).toBeTruthy();
            expect(scope.visitPageConfig.investigationResult.numberOfVisits).toBe(10);
            expect(scope.visitPageConfig.investigationResult.patientUuid).toBe('21308498-2502-4495-b604-7b704a55522d');
            expect(scope.visitPageConfig.treatment.showFlowSheet).toBeTruthy();
            expect(scope.visitPageConfig.disposition.numOfVisits).toBe(1);
        });

        it('should pick proper config for each section on visit page on dashboard switch',function(){
            $controller('VisitController', {
                $scope: scope,
                $state:state,
                encounterService: encounterService,
                clinicalAppConfigService:clinicalAppConfigService,
                visitSummary:{},
                visitContext:{},
                configurations:configurations,
                $timeout:$timeout,
                printer:{}
            });

            rootScope.$broadcast('event:visitTabSwitch',visitPageConfig);
            expect(scope.visitPageConfig.investigationResult.showChart).toBeFalsy();
            expect(scope.visitPageConfig.investigationResult.showTable).toBeFalsy();
            expect(scope.visitPageConfig.investigationResult.patientUuid).toBe('21308498-2502-4495-b604-7b704a55522d');
            expect(scope.visitPageConfig.treatment.showFlowSheet).toBeFalsy();
            expect(scope.visitPageConfig.disposition.numOfVisits).toBe(1);
        });
    });

});