/* eslint-disable angular/di */
'use strict';

describe('visitHeaderController', function () {
    var scope, controller, rootScope, visitTabConfig, configurations, encounterService;
    var mockClinicalAppConfigService = jasmine.createSpyObj('clinicalAppConfigService', ['getConsultationBoardLink', 'getAllConsultationBoards']);
    var mockLocation = jasmine.createSpyObj('$location', ['path', 'url']);
    var mockUrlHelper = {
        getPatientUrl: function () {
            return "/patient/somePatientUuid/dashboard";
        }
    };
    var config = [
        {
            dashboardName: "visit",
            displayByDefault: false
        },
        {
            dashboardName: "disposition",
            displayByDefault: true
        },
        {
            dashboardName: "trends",
            displayByDefault: true,
            printing: {title: "Awesome"}
        }
    ];

    configurations = {
        encounterConfig: function () {
            return configurations;
        },
        getPatientDocumentEncounterTypeUuid: function () {
            return "patientDocumentEncounterTypeUuid";
        }
    };
    var contextChangeHandler = {
        execute: function () {
            return {allow: true};
        },
        reset: function () {
        }
    };

    beforeEach(function () {
        module('bahmni.clinical');
        inject(function ($controller, $rootScope) {
            controller = $controller;
            scope = $rootScope.$new();
            rootScope = $rootScope;
        });
        spyOn(rootScope, '$broadcast');
    });

    beforeEach(function () {
        mockClinicalAppConfigService.getConsultationBoardLink.and.returnValue("/patient/patient_uuid/dashboard/consultation");
        visitTabConfig = new Bahmni.Clinical.TabConfig(config);
        var boards = [{
            url: "bacteriology",
            extensionParams: {
                "tabConfigName": "allMedicationTabConfig",
                "priority": "high"
            }
        }, {
            url: "observations",
            extensionParams: {
                "tabConfigName": "obsTabConfig"
            }
        }];
        mockClinicalAppConfigService.getAllConsultationBoards.and.returnValue(boards);

        encounterService = jasmine.createSpyObj('encounterService', ['getEncounterType', 'create', 'getEncountersForEncounterType', 'then']);
        encounterService.getEncountersForEncounterType.and.callFake(function () {
            var deferred = Q.defer();
            deferred.resolve({data: {results: []}});
            return deferred.promise;
        });
        encounterService.then.and.returnValue({data: {results: []}});
    });

    function createController (stateParams) {
        return controller('VisitHeaderController', {
            $scope: scope,
            $state: null,
            $rootScope: rootScope,
            clinicalAppConfigService: mockClinicalAppConfigService,
            patientContext: {patient: {uuid: "patient_uuid"}},
            visitHistory: {visits: [{uuid: "visitUuid", stopDatetime: null, visitType: {name: "IPD"}}]},
            visitConfig: visitTabConfig,
            $stateParams: stateParams || {configName: "default"},
            contextChangeHandler: contextChangeHandler,
            $location: mockLocation,
            urlHelper: mockUrlHelper,
            configurations: configurations,
            encounterService: encounterService
        });
    }

    describe('switchTab', function () {
        it("should broadcast event:clearVisitBoard with the particular tab as param", function () {
            createController();
            scope.switchTab(config[1]);
            expect(rootScope.$broadcast).toHaveBeenCalledWith('event:clearVisitBoard', config[1]);
        });
    });

    describe('closeTab', function () {
        it("should broadcast event:clearVisitBoard with the particular tab as param", function () {
            createController();
            scope.closeTab(config[1]);
            expect(rootScope.$broadcast).toHaveBeenCalledWith('event:clearVisitBoard', config[1]);
        });
    });

    describe('print', function () {
        it("should broadcastevent:printVisitTab with the current tab as param", function () {
            createController();
            scope.visitTabConfig.currentTab = config[0];
            scope.print();
            expect(rootScope.$broadcast).toHaveBeenCalledWith('event:printVisitTab', config[0]);
        });
    });

    describe('showPrint', function () {
        it("should return false if current tab doesnt have printing configured", function () {
            createController();
            scope.visitTabConfig.currentTab = config[0];
            expect(scope.showPrint()).toBeFalsy();
        });
        it("should return true if current tab have printing configured", function () {
            createController();
            scope.visitTabConfig.currentTab = config[0];
            scope.visitTabConfig.currentTab.printing = {"header": "Printing header"};
            expect(scope.showPrint()).toBeTruthy();
        });
    });

    it("should toggle mobile menu", function () {
        createController();
        scope.toggleMobileMenu();

        expect(scope.showMobileMenu).toBeTruthy();
    });

    describe('gotoPatientDashboard', function () {
        it("should call location path method", function () {
            createController();
            scope.gotoPatientDashboard();
            expect(mockLocation.path).toHaveBeenCalledWith("default/patient/patient_uuid/dashboard");
        });
    });

    describe('gotoConsultation', function () {
        it("should goto consultation from Visit page", function () {
            createController();
            scope.collapseControlPanel = jasmine.createSpy('collapseControlPanel');

            scope.openConsultation();

            expect(rootScope.hasVisitedConsultation).toBeTruthy();
            expect(scope.collapseControlPanel).toHaveBeenCalled();
            expect(mockLocation.url).toHaveBeenCalledWith('/default/patient/somePatientUuid/dashboard/bacteriology?tabConfigName=allMedicationTabConfig&priority=high');
        });

        it("should goto consultation from Visit page with given stateParams", function () {
            var stateParams = {configName: "program", programUuid: "programUuid", enrollment: "patientProgramUuid", patientUuid: "patientUuid"};
            createController(stateParams);
            scope.collapseControlPanel = jasmine.createSpy('collapseControlPanel');
            scope.openConsultation();
            expect(rootScope.hasVisitedConsultation).toBeTruthy();
            expect(scope.collapseControlPanel).toHaveBeenCalled();
            expect(mockLocation.url).toHaveBeenCalledWith('/program/patient/somePatientUuid/dashboard/bacteriology?programUuid=programUuid&enrollment=patientProgramUuid&tabConfigName=allMedicationTabConfig&priority=high');
        });
    });
});
