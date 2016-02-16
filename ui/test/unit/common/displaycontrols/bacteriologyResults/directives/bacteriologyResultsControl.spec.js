'use strict';

describe('Bacteriology Results Control', function () {
    var $compile,
        mockBackend, q,
        scope,deferred,
        section,element,_bacteriologyResultsService, appService, _spinner,mockedBacteriologyTabInitialization,patient={uuid:"patientUuid"},
        simpleHtml = '<bacteriology-results-control id="dashboard-drug-order-details" patient="patient" section="section"></bacteriology-results-control>',
        mockDialog,mockConsultationInitialization;

    beforeEach(module('bahmni.common.bacteriologyresults'));
    beforeEach(module('bahmni.common.appFramework'));
    beforeEach(module('bahmni.common.displaycontrol.bacteriologyresults'));
    beforeEach(module(function ($provide) {
        _bacteriologyResultsService = jasmine.createSpyObj('bacteriologyResultsService', ['getBacteriologyResults']);
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        var mockAppDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
        appService.getAppDescriptor.and.returnValue(mockAppDescriptor);
        _spinner = jasmine.createSpyObj('spinner',['forPromise','then']);

        mockConsultationInitialization = function(){
            deferred = q.defer();
            deferred.resolve({observations:[{"uuid":"obsOneUuid"}]});
            return deferred.promise;
        };

        mockedBacteriologyTabInitialization = function(){ deferred = q.defer();
             return deferred.promise;};

        mockDialog = {
            open: function(item){
                //this is the item passed from the controller
                console.log(item);
            }
        };

        $provide.value('bacteriologyTabInitialization', mockedBacteriologyTabInitialization);
        $provide.value('bacteriologyResultsService', _bacteriologyResultsService);
        $provide.value('appService', appService);
        $provide.value('spinner', _spinner);
        $provide.value('ngDialog', mockDialog);
        $provide.value('consultationInitialization', mockConsultationInitialization);
        $provide.value('messagingService', {});
        $provide.value('$translate', {});
    }));

    var compileScope = function () {
        section = section || {};
        inject(function (_$compile_, $rootScope, $httpBackend, $q) {
            scope = $rootScope;
            $compile = _$compile_;
            q = $q;
            scope.patient= {uuid:'123'};
            scope.section = section;
            mockBackend = $httpBackend;
            mockBackend.expectGET('../common/displaycontrols/bacteriologyresults/views/bacteriologyResultsControl.html').respond("<div>dummy</div>");
            element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.flush();
        });

        var compiledElementScope = element.isolateScope();
        scope.$digest();
        return compiledElementScope;
    };

    describe('Initialization', function () {
        it("should set title to bacteriology results", function () {
            section = {};
            var compiledElementScope = compileScope();
            expect(compiledElementScope.title).toBe("bacteriology results");
        });
    });
});
