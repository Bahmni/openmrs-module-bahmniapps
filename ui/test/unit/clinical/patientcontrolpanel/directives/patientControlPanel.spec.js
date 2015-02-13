'use strict';

xdescribe('patientControlPanelTest', function () {
    var q,
        compile,
        mockBackend,
        rootScope,
        state,
        clinicalAppConfigService,
        simpleHtml = '<patient-control-panel patient="patient" visit-history="visitHistory" visit="visit" show="showControlPanel"/>';

    beforeEach(module('ui.router'));
    beforeEach(module('bahmni.clinical'));
    beforeEach(module('bahmni.common.appFramework'));
    beforeEach(module('bahmni.common.util'));

    beforeEach(module('bahmni.common.patient'), function($provide){
        var state = {current:{name : "patient.consultation"}};
        var stateParams = {visitUuid: "12345"};
        $provide.value('$state',state);
        $provide.value('$stateParams', stateParams);
    });


    beforeEach(inject(function ($compile, $httpBackend, $rootScope,$q) {
        compile = $compile;
        mockBackend = $httpBackend;
        rootScope = $rootScope;
        q = $q;
    }));

    it('ensure links are correctly populated', function () {
        var scope = rootScope.$new();

        scope.visitHistory={
            activeVisit: true
        };
        scope.section = {
            numberOfVisits:1
        };
        scope.visitUuid= "1234";

        mockBackend.expectGET('patientcontrolpanel/views/controlPanel.html').respond("<div>dummy</div>");

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        //mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        expect(compiledElementScope.links).not.toBeUndefined();
    });

});