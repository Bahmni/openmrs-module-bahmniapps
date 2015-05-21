'use strict';

describe('Diagnosis DisplayControl', function () {
    var rootScope, scope, compiledElementScope, q, 
        compile, diagnosis,
        mockBackend,
        spinner,
        diagnosis,
        element,
        directiveHtml='<bahmni-diagnosis patient-uuid="patient.uuid" config="section"></bahmni-diagnosis>';

    beforeEach(module('bahmni.common.domain'),function(){});
    beforeEach(module('bahmni.common.uiHelper'), function(){});


    beforeEach(module('bahmni.common.displaycontrol.diagnosis'), function($provide){
        var _spinner = jasmine.createSpyObj('spinner',['forPromise','then']);
        _spinner.forPromise.and.callFake(function(){
            var deferred = q.defer();
            deferred.resolve({data: {}});
            return deferred.promise;
        });

        _spinner.then.and.callThrough({data: {}});

        var _diagnosisService = jasmine.createSpyObj('diagnosisService',['getPastDiagnoses']);

        $provide.value('spinner', _spinner);
        $provide.value('diagnosisService', _diagnosisService);        
    });

    beforeEach(inject(function ($compile, $httpBackend, $rootScope, $q) {
        compile = $compile;
        mockBackend = $httpBackend;
        rootScope = $rootScope;
        q = $q;
    }));

    function init() {
        scope = rootScope.$new();
        mockBackend.expectGET('../common/displaycontrols/diagnosis/views/diagnosisDisplayControl.html').respond("<div>dummy</div>");
        mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/diagnosis/search').respond([]);
        scope.section = {
            title: "Diagnosis"
        };

        element = compile(directiveHtml)(scope);
        scope.$digest();
        mockBackend.flush();

        compiledElementScope = element.isolateScope();
        scope.$digest();

        diagnosis = {showLatestDetails: false,
                     showDetails: false,
                     providers: [{name: "Super Woman"}]};
    }

    it('should check diagnosis date toggle', function(){
        init();
        compiledElementScope.toggle(diagnosis, true);

        expect(diagnosis.showLatestDetails).toBeTruthy();
        expect(diagnosis.showDetails).toBeFalsy();

        compiledElementScope.toggle(diagnosis, false)

        expect(diagnosis.showLatestDetails).toBeFalsy();
        expect(diagnosis.showDetails).toBeTruthy();
    });

    it('should display diagnosis provider name', function(){
        init();
        diagnosis.creatorName = "Super Woman";
        expect(compiledElementScope.providerName(diagnosis)).toBe("Super Woman");
        diagnosis.creatorName = "Super Person";
        expect(compiledElementScope.providerName(diagnosis)).toBe("Super Person on behalf of Super Woman");
    });

});