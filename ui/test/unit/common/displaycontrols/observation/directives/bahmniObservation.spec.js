'use strict';

describe("BahmniObservation", function () {
    var appService, scope, $compile, mockBackend, observationsService, q, spinner, formHierarchyService, encounterService, providerInfoService, formPrintService;
    var simpleHtml = '<bahmni-observation section="section" patient="patient" is-on-dashboard="true" config="config" enrollment="enrollment" observations="observations"></bahmni-observation>';

    beforeEach(module('ngHtml2JsPreprocessor'));
    beforeEach(module('bahmni.common.patient'));
    beforeEach(module('bahmni.common.uiHelper'));
    beforeEach(module('bahmni.common.i18n'));
    beforeEach(module('bahmni.common.displaycontrol.observation', function ($provide) {
        observationsService = jasmine.createSpyObj('observationsService', ['fetch', 'fetchForEncounter', 'getByUuid', 'fetchForPatientProgram', 'encounterService']);
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function () {
                return {
                    concept: ""
                }
            }, getExtensions: function (a, b) {
                return {
                    maxPatientsPerBed: 2
                }
            },
            getConfig: function(){

            }
        });
        formHierarchyService = jasmine.createSpyObj('formHierarchyService',['build']);
        encounterService = jasmine.createSpyObj('encounterService',['findByEncounterUuid']);
        providerInfoService = jasmine.createSpyObj('providerInfoService', ['setProvider']);
        formPrintService = jasmine.createSpyObj('formPrintService', ['printForm']);
        formHierarchyService.build.and.returnValue(null);

        spinner = jasmine.createSpyObj('spinner', ['forPromise']);

        spinner.forPromise.and.callFake(function (param) {
            return {
                then: function () {
                    return {};
                }
            }
        });

        $provide.value('observationsService', observationsService);
        $provide.value('appService', appService);
        $provide.value('spinner', spinner);
        $provide.value('formHierarchyService',formHierarchyService);
        $provide.value('encounterService',encounterService);
        $provide.value('providerInfoService',providerInfoService);
        $provide.value('formPrintService',formPrintService);
    }));

    beforeEach(inject(function (_$compile_, $rootScope, $httpBackend, $q) {
        scope = $rootScope.$new();
        $compile = _$compile_;
        q = $q;
        mockBackend = $httpBackend;
    }));

    describe("Initialization", function () {
        it("should fetch observations for encounter if the encounterUuid is provided but formType is not formsV2", function () {
            scope.patient = {uuid: '123'};
            scope.config = {showGroupDateTime: false, encounterUuid: "encounterUuid", conceptNames: ["Concept Name"]};
            scope.section = {};
            observationsService.fetchForEncounter.and.returnValue(specUtil.respondWithPromise(q, {data: {}}));

            mockBackend.expectGET('../common/displaycontrols/observation/views/observationDisplayControl.html').respond("<div>dummy</div>");

            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(compiledElementScope.config).not.toBeUndefined();
            expect(observationsService.fetchForEncounter).toHaveBeenCalledWith(scope.config.encounterUuid, scope.config.conceptNames);
            expect(observationsService.fetchForEncounter.calls.count()).toEqual(1);
            expect(observationsService.fetch.calls.count()).toEqual(0);
            expect(observationsService.fetchForPatientProgram.calls.count()).toEqual(0);
        });

        it("should fetch observations for encounter if formType is formsV2", function () {
            scope.patient = {uuid: '123'};
            scope.config = {showGroupDateTime: false, encounterUuid: "encounterUuid", formType: "formsV2"};
            scope.section = {};
            encounterService.findByEncounterUuid.and.returnValue(specUtil.respondWithPromise(q, {data: {observations: ["abc"]}}));

            mockBackend.expectGET('../common/displaycontrols/observation/views/observationDisplayControl.html').respond("<div>dummy</div>");

            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(compiledElementScope.config).not.toBeUndefined();
            expect(encounterService.findByEncounterUuid).toHaveBeenCalledWith(scope.config.encounterUuid, { includeAll : false });
            expect(encounterService.findByEncounterUuid.calls.count()).toEqual(1);
            expect(observationsService.fetch.calls.count()).toEqual(0);
            expect(observationsService.fetchForPatientProgram.calls.count()).toEqual(0);
            expect(observationsService.fetchForEncounter.calls.count()).toEqual(0);
        });

        it("should fetch observations for patient if the encounterUuid is not provided", function () {
            scope.patient = {uuid: '123'};
            scope.config = {showGroupDateTime: false, conceptNames: ["Concept Name"], scope: "latest", numberOfVisits: 1};
            scope.section = {};
            observationsService.fetch.and.returnValue(specUtil.respondWithPromise(q, {data: {}}));

            mockBackend.expectGET('../common/displaycontrols/observation/views/observationDisplayControl.html').respond("<div>dummy</div>");

            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(compiledElementScope.config).not.toBeUndefined();
            expect(observationsService.fetch).toHaveBeenCalledWith(scope.patient.uuid, scope.config.conceptNames, scope.config.scope,
                scope.config.numberOfVisits, undefined, undefined, null);
            expect(observationsService.fetch.calls.count()).toEqual(1);
            expect(observationsService.fetchForEncounter.calls.count()).toEqual(0);
            expect(observationsService.fetchForPatientProgram.calls.count()).toEqual(0);
        });

        it("should fetch observations within daterange if you want to fetch program specific data.", function () {
            scope.patient = {uuid: '123'};
            scope.config = {showGroupDateTime: false, conceptNames: ["Concept Name"], scope: "latest", numberOfVisits: 1};
            scope.section = {};
            observationsService.fetch.and.returnValue(specUtil.respondWithPromise(q, {data: {}}));
            appService.getAppDescriptor.and.returnValue({
                getConfigValue: function () {
                    return {
                        showDetailsWithinDateRange: true
                    }
                }, getExtensions: function (a, b) {
                    return {
                        maxPatientsPerBed: 2
                    }
                },
                getConfig: function(){

                }
            });

            mockBackend.expectGET('../common/displaycontrols/observation/views/observationDisplayControl.html').respond("<div>dummy</div>");

            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(compiledElementScope.config).not.toBeUndefined();
            expect(observationsService.fetch).toHaveBeenCalledWith(scope.patient.uuid, scope.config.conceptNames,
                scope.config.scope, scope.config.numberOfVisits, undefined, undefined, null);
            expect(observationsService.fetch.calls.count()).toEqual(1);
            expect(observationsService.fetchForEncounter.calls.count()).toEqual(0);
            expect(observationsService.fetchForPatientProgram.calls.count()).toEqual(0);
        });

        it("should fetch the only the specific observation if observation uuid is specified in config", function () {
            scope.patient = {uuid: '123'};
            scope.config = {observationUuid : "observationUuid"};
            scope.section = {};
            scope.enrollment = "uuid";
            observationsService.getByUuid.and.returnValue(specUtil.respondWithPromise(q, {data: {concept: {name: "obsConcept"}}}));
            mockBackend.expectGET('../common/displaycontrols/observation/views/observationDisplayControl.html').respond("<div>dummy</div>");

            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            var compiledElementScope = element.isolateScope();
            scope.$digest();


            expect(observationsService.getByUuid).toHaveBeenCalledWith("observationUuid");
            expect(observationsService.getByUuid.calls.count()).toEqual(1);
        });

        it("should fetch observations for patient if the patientProgramUuid is provided", function () {
            scope.config = {conceptNames: ["Concept Name"], scope: "latest", obsIgnoreList: ["obsIgnoreList"]};
            scope.section = {};
            scope.enrollment = 'patientProgramUuid';
            observationsService.fetchForPatientProgram.and.returnValue(specUtil.respondWithPromise(q, {data: {}}));

            mockBackend.expectGET('../common/displaycontrols/observation/views/observationDisplayControl.html').respond("<div>dummy</div>");

            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(compiledElementScope.config).not.toBeUndefined();

            expect(observationsService.fetchForPatientProgram).toHaveBeenCalledWith(scope.enrollment, scope.config.conceptNames, scope.config.scope, scope.config.obsIgnoreList);
            expect(observationsService.fetchForPatientProgram.calls.count()).toEqual(1);
            expect(observationsService.fetch.calls.count()).toEqual(0);
            expect(observationsService.fetchForEncounter.calls.count()).toEqual(0);
        });

        it("should only fetch observations from config which are fully specified", function () {
            scope.patient = {uuid: '123'};
            scope.config = {
                conceptNames: [
                    "Vitals",
                    "History and Examination"
                ],
                scope: "latest"
            };
            scope.section = {};
            scope.observations = [
                {
                    concept: {
                        name: "Vitals",
                        shortName: "Vitals"
                    }
                },
                {
                    concept: {
                        name: "History and Examination Template",
                        shortName: "History and Examination"
                    }
                }
            ];

            mockBackend.expectGET('../common/displaycontrols/observation/views/observationDisplayControl.html').respond("<div>dummy</div>");

            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope.bahmniObservations[0].value.length).toEqual(1);
            expect(compiledElementScope.bahmniObservations[0].value[0].concept.name).toEqual("Vitals");
        });
    });
});
