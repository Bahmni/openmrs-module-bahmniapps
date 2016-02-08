'use strict';

xdescribe("conceptSet", function () {
    var appService, spinner, conceptSetUiConfigService, contextChangeHandler, observationsService,
        messagingService, compile, scope, recursionHelper, conceptSetService;

    beforeEach(function () {
        module('ui.select2');
        module('bahmni.common.uiHelper');
        module('bahmni.common.conceptSet');
        module('ngHtml2JsPreprocessor');
        module('bahmni.common.i18n');
        module(function ($provide) {
            recursionHelper = jasmine.createSpyObj('RecursionHelper', ['compile']);
            conceptSetService = jasmine.createSpyObj('conceptSetService', ['getConcept']);
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            contextChangeHandler = jasmine.createSpyObj('contextChangeHandler', ['add']);
            observationsService = jasmine.createSpyObj('observationsService', ['fetch']);
            messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
            conceptSetUiConfigService = jasmine.createSpyObj('conceptSetUiConfigService', ['getConfig']);
            spinner = jasmine.createSpyObj('spinner', ['forPromise']);
            $provide.value('RecursionHelper', recursionHelper);
            $provide.value('appService', appService);
            $provide.value('conceptSetService', conceptSetService);
            $provide.value('contextChangeHandler', contextChangeHandler);
            $provide.value('observationsService', observationsService);
            $provide.value('messagingService', messagingService);
            $provide.value('messagingService', messagingService);
            $provide.value('conceptSetUiConfigService', conceptSetUiConfigService);
            $provide.value('spinner', spinner);
        });
        inject(function ($compile, $rootScope) {
            compile = $compile;
            scope = $rootScope.$new();
        });
    });
    beforeEach(function () {
        scope.additionalAttributesConceptName = "dummy";
        scope.observations = {};
        scope.patient = {uuid: "patientUuid"};
        scope.observations = {
            primaryObs: {
                concept: {},
                value: ""
            }
        };

        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function (value) {
                return {}
            }
        });

        conceptSetUiConfigService.getConfig.and.returnValue({
            additionalAttributesConceptName: {}
        });

        conceptSetService.getConcept.and.returnValue({
            then: function () {
                return function () {
                    return {}
                }
            }
        });
    });

    var generateElement = function () {
        var unCompiledHtml =
            '<concept-set ' +
            'show-title="false" ' +
            'patient="patient" ' +
            'concept-set-name="additionalAttributesConceptName" ' +
            'observations="observations">' +
            '</concept-set>';
        var element = compile(angular.element(unCompiledHtml))(scope);
        scope.$digest();
        return element;
    };

    it("should apply form conditions for observation on AddMore", function () {
        scope.selectOptions = function(){
            return {}
        };

        var element = generateElement();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        //scope.$digest();
        //spyOn(scope, '$broadcast');
        //
        //scope.$broadcast('event:addMore', scope.observations[0]);
        //expect(scope.$root.$on).toHaveBeenCalled();
    });
});
