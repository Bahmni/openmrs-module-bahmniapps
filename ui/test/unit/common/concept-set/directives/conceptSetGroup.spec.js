'use strict';

describe("conceptSetGroup", function () {
    var _provide, scope, contextChangeHandler, spinner, conceptSetService, rootScope, sessionService,
        encounterService, treatmentConfig, retrospectiveEntryService,
        userService, conceptSetUiConfigService, timeout, clinicalAppConfigService, stateParams, compile, httpBackend;

    beforeEach(function () {
        module('bahmni.common.conceptSet');
        module(function ($provide) {
            contextChangeHandler = jasmine.createSpyObj('contextChangeHandler', ['add']);
            conceptSetService = jasmine.createSpyObj('conceptSetService', ['getComputedValue']);
            sessionService = jasmine.createSpyObj('sessionService', ['getLoginLocationUuid']);
            encounterService = jasmine.createSpyObj('encounterService', ['buildEncounter']);
            treatmentConfig = {};
            retrospectiveEntryService = jasmine.createSpyObj('retrospectiveEntryService', ['getRetrospectiveEntry']);
            userService = jasmine.createSpyObj('userService', ['savePreferences']);
            conceptSetUiConfigService = jasmine.createSpyObj('conceptSetUiConfigService', ['getConfig']);
            clinicalAppConfigService = jasmine.createSpyObj('clinicalAppConfigService', ['getVisitTypeForRetrospectiveEntries']);
            spinner = jasmine.createSpyObj('spinner', ['forPromise']);
            $provide.value('contextChangeHandler', contextChangeHandler);
            $provide.value('conceptSetService', conceptSetService);
            $provide.value('sessionService', sessionService);
            $provide.value('encounterService', encounterService);
            $provide.value('treatmentConfig', treatmentConfig);
            $provide.value('retrospectiveEntryService', retrospectiveEntryService);
            $provide.value('userService', userService);
            $provide.value('conceptSetUiConfigService', conceptSetUiConfigService);
            $provide.value('clinicalAppConfigService', clinicalAppConfigService);
            $provide.value('spinner', spinner);
            _provide = $provide;
        });
        inject(function ($compile, $rootScope, $httpBackend) {
            compile = $compile;
            scope = $rootScope.$new();
            httpBackend = $httpBackend;
            rootScope = $rootScope;
        });
    });
    beforeEach(function () {
        _provide.value('$stateParams', { encounterUuid : "uuid"});
        scope.conceptSetGroupExtensionId = "";
        scope.context = {};
        scope.scrollingEnabled = true;
        scope.patient = {uuid: "patientUuid"};
        scope.consultation = {
            observations : {
                primaryObs: {
                    concept: {},
                    value: ""
                }
            },
            selectedObsTemplate : [
                {
                    "uuid" : "conceptSet1"
                },
                {
                    "uuid" : "conceptSet2"
                }
            ]
        };

        conceptSetUiConfigService.getConfig.and.returnValue({
            "conceptSetName" : {"showPreviousButton" : true}
        });
    });


    it("should conceptSetGroup controller be initialized", function () {
        var conceptSetName = "conceptSetName";
        var event = jasmine.createSpyObj("event",["stopPropagation"])
        var compiledElementScope = executeDirective();
        scope.$digest();

        expect(compiledElementScope.validationHandler).toBeDefined();

        expect(compiledElementScope.getNormalized("Concept Set.Name/Title(Label)")).toBe("Concept_Set_Name_Title_Label_");

        expect(compiledElementScope.showPreviousButton("conceptSetName")).toBeTruthy();

        spyOn(scope, '$broadcast');
        compiledElementScope.showPrevious(conceptSetName, event);
        expect(event.stopPropagation).toHaveBeenCalled();
        expect(scope.$broadcast).toHaveBeenCalled;

        expect(compiledElementScope.isInEditEncounterMode()).toBeTruthy();

        // compiledElementScope.computeField({}, event);
        // expect(event.stopPropagation).toHaveBeenCalled();

        expect(contextChangeHandler.add).toHaveBeenCalled();
        expect(compiledElementScope.leftPanelConceptSet).toBeUndefined();
    });

    var executeDirective  = function () {
        httpBackend.expectGET("../common/concept-set/views/conceptSetGroup.html").respond('<div>dummy</div>');

        var html = '<concept-set-group patient="patient" consultation="consultation" observations="consultation.observations" all-templates="consultation.selectedObsTemplate" context="context" auto-scroll-enabled="::scrollingEnabled"></concept-set-group>';
        var element = compile(html)(scope);
        scope.$digest();
        httpBackend.flush();
        return element.isolateScope();
    }
});
