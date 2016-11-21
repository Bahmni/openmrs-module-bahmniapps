'use strict';

describe("conceptSetGroup", function () {
    var _provide, scope, contextChangeHandler, spinner, messagingService, conceptSetService, rootScope, sessionService,
        encounterService, treatmentConfig, retrospectiveEntryService,
        userService, conceptSetUiConfigService, timeout, clinicalAppConfigService, stateParams, compile, httpBackend;

    beforeEach(function () {
        module('bahmni.common.conceptSet');
        module(function ($provide) {
            contextChangeHandler = jasmine.createSpyObj('contextChangeHandler', ['add']);
            messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
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
            $provide.value('messagingService', messagingService);
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
                    "uuid" : "conceptSet2",
                    "klass" : "active"
                }
            ]
        };

        conceptSetUiConfigService.getConfig.and.returnValue({
            "conceptSetName" : {"showPreviousButton" : true}
        });
    });

    var executeDirective  = function () {
        httpBackend.expectGET("../common/concept-set/views/conceptSetGroup.html").respond('<div>dummy</div>');

        var html = '<concept-set-group patient="patient" consultation="consultation" observations="consultation.observations" all-templates="consultation.selectedObsTemplate" context="context" auto-scroll-enabled="::scrollingEnabled"></concept-set-group>';
        var element = compile(html)(scope);
        scope.$digest();
        httpBackend.flush();
        return element.isolateScope();
    }


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
        expect(contextChangeHandler.add).toHaveBeenCalled();
        expect(compiledElementScope.leftPanelConceptSet).toBeDefined();
        expect(compiledElementScope.leftPanelConceptSet.klass).toBe("active");
    });

    it("showLeftPanelConceptSet should set the selected conceptset to be loaded, open, klass as active", function () {
        var compiledElementScope = executeDirective();
        scope.$digest();

        var selectConceptSetSection = {
            name : "template",
            hasSomeValue : function () {
                return true;
            },
            label : "formName"
        },
        previousLeftPanel = {
            name : "previous",
            isOpen : true,
            isLoaded : true,
            klass : "active"
        };
        compiledElementScope.leftPanelConceptSet = previousLeftPanel;

        messagingService.showMessage.and.returnValue();

        compiledElementScope.showLeftPanelConceptSet(selectConceptSetSection);
        expect(compiledElementScope.leftPanelConceptSet.name).toBe("template");
        expect(compiledElementScope.leftPanelConceptSet.isOpen).toBeTruthy();
        expect(compiledElementScope.leftPanelConceptSet.isLoaded).toBeTruthy();
        expect(compiledElementScope.leftPanelConceptSet.klass).toBe("active");
        expect(previousLeftPanel.isOpen).toBeFalsy();
        expect(previousLeftPanel.isLoaded).toBeFalsy();
        expect(previousLeftPanel.klass).toBe("");
    });

    it("focusOnErrors should broadcast, show error message", function () {
        var compiledElementScope = executeDirective();
        scope.$digest();

        compiledElementScope.leftPanelConceptSet = {
            name : "form",
            isOpen : true,
            isLoaded : true,
            klass : "active"
        };
        spyOn(scope, '$broadcast');
        compiledElementScope.focusOnErrors();
        expect(scope.$broadcast).toHaveBeenCalled;
        expect(messagingService.showMessage('error',"{{'CLINICAL_FORM_ERRORS_MESSAGE_KEY' | translate }}")).toHaveBeenCalled;
    });

    it("focusOnErrors should show error message from selected concept set section", function () {
        var compiledElementScope = executeDirective();
        scope.$digest();

        spyOn(scope, '$broadcast');
        compiledElementScope.leftPanelConceptSet = {
            name : "form",
            isOpen : true,
            isLoaded : true,
            klass : "active",
            errorMessage : "error message"
        };
        compiledElementScope.focusOnErrors();
        expect(messagingService.showMessage('error',"error message")).toHaveBeenCalled;
    });

    it("openActiveForm should open the form and scroll to top", function () {
        var compiledElementScope = executeDirective();
        var selectConceptSetSection = {
                name : "activeForm",
                hasSomeValue : function () {
                    return true;
                },
                klass : 'active'
            };
        scope.$digest();

        compiledElementScope.leftPanelConceptSet = {
            name : "alreadyOpenedForm",
            isOpen : true,
            isLoaded : true,
            klass : "active"
        };
        var conceptKlass = compiledElementScope.openActiveForm(selectConceptSetSection);
        expect(conceptKlass).toEqual("active");
        expect(compiledElementScope.leftPanelConceptSet.name).toEqual("activeForm");
    });
});
