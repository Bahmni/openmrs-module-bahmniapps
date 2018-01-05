'use strict';

describe('patientControlPanelTest', function () {
    var translations = {
        CONTROL_PANEL_CONSULTATION_TEXT: "Consultation",
        CONTROL_PANEL_DASHBOARD_TEXT: "Dashboard"
    };
    var q,
        compile,
        mockBackend,
        rootScope,
        _configurations,
        stateParams,
        state,
        _encounterService,
        $translate,
        deferred,
        _provide,
        $bahmniCookieStore,
        simpleHtml = '<patient-control-panel patient="patient" visit-history="visitHistory" visit="visit" show="showControlPanel"/>';

    beforeEach(module('bahmni.common.patient','bahmni.clinical','bahmni.common.appFramework','bahmni.common.util','bahmni.common.uiHelper'));

    beforeEach(module(function($provide){
        $translate = jasmine.createSpyObj('$translate', ['instant']);
        $translate.instant.and.callFake(function (value) {
            return value;
        });
        _provide = $provide;

        _configurations = {
            encounterConfig: function(){return _configurations;},
            getPatientDocumentEncounterTypeUuid: function(){return "patientDocumentEncounterTypeUuid";}
        };

        _encounterService = jasmine.createSpyObj('encounterService',['getEncountersForEncounterType','then']);
        _encounterService.getEncountersForEncounterType.and.callFake(function(){
            deferred = q.defer();
            deferred.resolve({data: {results: []}});
            return deferred.promise;
        });

        $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore',['get']);

        _encounterService.then.and.returnValue({data: {results: []}});
        $provide.value('configurations',_configurations);
        $provide.value('encounterService',_encounterService);
        $provide.value('$bahmniCookieStore', $bahmniCookieStore);
        $provide.value('$translate', $translate);
    }));

    beforeEach(inject(function ($compile, $httpBackend, $rootScope,$q) {
        compile = $compile;
        mockBackend = $httpBackend;
        rootScope = $rootScope;
        q = $q;
    }));

    it('ensure links are correctly populated on patient consultation page', function () {
        stateParams = {visitUuid: "12345", configName: "default"};
        state = {current: {name : "patient.consultation"}};

        _provide.value('$state',state);
        _provide.value('$stateParams', stateParams);

        var scope = rootScope.$new();

        scope.visitHistory={
            activeVisit: true
        };
        scope.section = {
            numberOfVisits:1
        };
        scope.patient = {uuid: "patientUuid"};
        scope.visitUuid= "1234";

        mockBackend.expectGET('patientcontrolpanel/views/controlPanel.html').respond("<div>dummy</div>");

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        expect(compiledElementScope.links).not.toBeUndefined();
        expect(compiledElementScope.links).toEqual([{text: "CONTROL_PANEL_DASHBOARD_TEXT", icon: "btn-summary dashboard-btn", href: "#/default/patient/patientUuid/dashboard"}]);
    });

    it('ensure links are correctly populated on patient visit page and without an active visit', function () {
        stateParams = {visitUuid: "12345", configName: "default"};
        state = {current: {name : "patient.visit"}};

        _provide.value('$state',state);
        _provide.value('$stateParams', stateParams);

        var scope = rootScope.$new();

        scope.visitHistory={
            activeVisit: false
        };
        scope.section = {
            numberOfVisits:1
        };
        scope.patient = {uuid: "patientUuid"};
        scope.visitUuid= "1234";

        mockBackend.expectGET('patientcontrolpanel/views/controlPanel.html').respond("<div>dummy</div>");

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        expect(compiledElementScope.links).not.toBeUndefined();
        expect(compiledElementScope.links).toEqual([{text: "CONTROL_PANEL_DASHBOARD_TEXT", icon: "btn-summary dashboard-btn", href: "#/default/patient/patientUuid/dashboard"}]);
    });

    it('ensure links are correctly populated on patient dashboard page without an active visit', function () {
        stateParams = {visitUuid: "12345"};
        state = {current: {name : "patient.dashboard"}};

        var _clinicalAppConfigService = jasmine.createSpyObj('clinicalAppConfigService',['getConsultationBoardLink']);
        _clinicalAppConfigService.getConsultationBoardLink.and.returnValue("test");

        _provide.value('$state',state);
        _provide.value('$stateParams', stateParams);
        _provide.value('clinicalAppConfigService',_clinicalAppConfigService);

        var scope = rootScope.$new();

        scope.visitHistory={
            activeVisit: false
        };
        scope.section = {
            numberOfVisits:1
        };
        scope.patient = {uuid: "patientUuid"};
        scope.visitUuid= "1234";

        mockBackend.expectGET('patientcontrolpanel/views/controlPanel.html').respond("<div>dummy</div>");

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        expect(compiledElementScope.links).not.toBeUndefined();
    });

    it('ensure links are correctly populated for an active visit', function () {
        stateParams = {visitUuid: "12345"};
        state = {current: {name : "patient.dashboard"}};

        var _clinicalAppConfigService = jasmine.createSpyObj('clinicalAppConfigService',['getConsultationBoardLink']);
        _clinicalAppConfigService.getConsultationBoardLink.and.returnValue("test");

        _provide.value('$state',state);
        _provide.value('$stateParams', stateParams);
        _provide.value('clinicalAppConfigService',_clinicalAppConfigService);


        var scope = rootScope.$new();

        scope.visitHistory={
            activeVisit: true
        };
        scope.section = {
            numberOfVisits:1
        };
        scope.patient = {uuid: "patientUuid"};
        scope.visitUuid= "1234";

        mockBackend.expectGET('patientcontrolpanel/views/controlPanel.html').respond("<div>dummy</div>");

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        expect(compiledElementScope.links).not.toBeUndefined();
        expect(compiledElementScope.links).toEqual([{text: "CONTROL_PANEL_CONSULTATION_TEXT", icon: "btn-consultation dashboard-btn", href: "#test"}]);
    });

    it("isInEditEncounterMode() should return false for active encounter",function(){
        stateParams = {encounterUuid: "active"};
        mockBackend.expectGET('patientcontrolpanel/views/controlPanel.html').respond("<div>dummy</div>");


        var _clinicalAppConfigService = jasmine.createSpyObj('clinicalAppConfigService',['getConsultationBoardLink']);
        _clinicalAppConfigService.getConsultationBoardLink.and.returnValue("test");

        _provide.value('$state',state);
        _provide.value('$stateParams', stateParams);
        _provide.value('clinicalAppConfigService',_clinicalAppConfigService);
        var scope = rootScope.$new();
        scope.visitHistory={
            activeVisit: true
        };
        scope.section = {
            numberOfVisits:1
        };
        scope.patient = {uuid: "patientUuid"};
        scope.visitUuid= "1234";


        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        expect(compiledElementScope.isInEditEncounterMode()).toBeFalsy();

    });

    it("isInEditEncounterMode() should return true on editing encounter",function(){
        stateParams = {encounterUuid: "abcd-1234-efagksjk"};
        mockBackend.expectGET('patientcontrolpanel/views/controlPanel.html').respond("<div>dummy</div>");


        var _clinicalAppConfigService = jasmine.createSpyObj('clinicalAppConfigService',['getConsultationBoardLink']);
        _clinicalAppConfigService.getConsultationBoardLink.and.returnValue("test");

        _provide.value('$state',state);
        _provide.value('$stateParams', stateParams);
        _provide.value('clinicalAppConfigService',_clinicalAppConfigService);
        var scope = rootScope.$new();
        scope.visitHistory={
            activeVisit: true
        };
        scope.section = {
            numberOfVisits:1
        };
        scope.patient = {uuid: "patientUuid"};
        scope.visitUuid= "1234";


        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        expect(compiledElementScope.isInEditEncounterMode()).toBeTruthy();
    })
});