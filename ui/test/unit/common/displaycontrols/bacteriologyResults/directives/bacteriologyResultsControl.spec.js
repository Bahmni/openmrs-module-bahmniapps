'use strict';

describe('Bacteriology Results Control', function () {
    var $compile,
        mockBackend, q,messagingService,
        scope,deferred,
        section,element,_bacteriologyResultsService, appService, _spinner,mockedBacteriologyTabInitialization,patient={uuid:"patientUuid"},
        simpleHtml = '<bacteriology-results-control id="dashboard-drug-order-details" patient="patient" section="section"></bacteriology-results-control>',
        mockDialog,mockConsultationInitialization;

    var messageServiceMock = jasmine.createSpyObj('messagingService', ['showMessage']);
    beforeEach(module('bahmni.common.bacteriologyresults'));
    beforeEach(module('bahmni.common.appFramework'));
    beforeEach(module('bahmni.common.displaycontrol.bacteriologyresults'));
    beforeEach(module(function ($provide) {
        _bacteriologyResultsService = jasmine.createSpyObj('bacteriologyResultsService', ['getBacteriologyResults', 'saveBacteriologyResults']);
        _bacteriologyResultsService.saveBacteriologyResults.and.returnValue(specUtil.createFakePromise({}));
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        var mockAppDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
        appService.getAppDescriptor.and.returnValue(mockAppDescriptor);
        _spinner = jasmine.createSpyObj('spinner',['forPromise','then']);
        _spinner.forPromise.and.returnValue(specUtil.createFakePromise({}));


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
            },
            close: function () {
                return true;
            }
        };

        $provide.value('bacteriologyTabInitialization', mockedBacteriologyTabInitialization);
        $provide.value('bacteriologyResultsService', _bacteriologyResultsService);
        $provide.value('appService', appService);
        $provide.value('spinner', _spinner);
        $provide.value('ngDialog', mockDialog);
        $provide.value('consultationInitialization', mockConsultationInitialization);
        $provide.value('messagingService', messageServiceMock);
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
    describe('save specimens', function() {
       it("should validate form before saving and throw error message", function() {
           var specimen = {
               dateCollected: "2016-02-25",
               existingObs: "9a0827e3-de02-4b68-bfc8-3150842d8f7f",
               identifier: null,
               report: {},
               sample: {},
               sampleResult: [],
               showTypeFreeText: false,
               specimenCollectionDate: "2016-02-25",
               specimenId: null,
               specimenSource: "Lymph node",
               type: null,
               typeFreeText: null,
               typeObservation: Bahmni.ConceptSet.SpecimenTypeObservation

           };
           var savableSpecimen = new Bahmni.Clinical.Specimen(specimen);
           var compiledElementScope = compileScope();

           compiledElementScope.saveBacteriologySample(savableSpecimen);
           expect(savableSpecimen.hasIllegalType).toBeTruthy();
           expect(savableSpecimen.hasIllegalDateCollected).toBeFalsy();
           expect(messageServiceMock.showMessage).toHaveBeenCalledWith('error', "{{'CLINICAL_FORM_ERRORS_MESSAGE_KEY' | translate }}");
       });


        it("should validate form before saving and give save confirmation message", function () {
            var specimen = {
                dateCollected: "2016-02-25",
                existingObs: "9a0827e3-de02-4b68-bfc8-3150842d8f7f",
                identifier: null,
                report: {},
                sample: {},
                sampleResult: [],
                showTypeFreeText: false,
                specimenCollectionDate: "2016-02-25",
                specimenId: null,
                specimenSource: "Lymph node",
                type: {concept: {name: "sputum"}},
                typeFreeText: null,
                typeObservation: Bahmni.ConceptSet.SpecimenTypeObservation

            };
            var savableSpecimen = new Bahmni.Clinical.Specimen(specimen);
            var compiledElementScope = compileScope();

            compiledElementScope.saveBacteriologySample(savableSpecimen);
            expect(savableSpecimen.hasIllegalType).toBeFalsy();
            expect(savableSpecimen.hasIllegalDateCollected).toBeFalsy();
            expect(messageServiceMock.showMessage).toHaveBeenCalledWith('info', "{{'CLINICAL_SAVE_SUCCESS_MESSAGE_KEY' | translate}}");
        });
    });
});
