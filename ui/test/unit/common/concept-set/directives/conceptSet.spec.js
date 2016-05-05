'use strict';

describe("conceptSet", function () {
    var appService, spinner, conceptSetUiConfigService, contextChangeHandler, observationsService,
        messagingService, compile, scope, conceptSetService, httpBackend;

    beforeEach(function () {
        module('bahmni.common.conceptSet');
        module(function ($provide) {
            conceptSetService = jasmine.createSpyObj('conceptSetService', ['getConcept']);
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            contextChangeHandler = jasmine.createSpyObj('contextChangeHandler', ['add']);
            observationsService = jasmine.createSpyObj('observationsService', ['fetch']);
            messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
            conceptSetUiConfigService = jasmine.createSpyObj('conceptSetUiConfigService', ['getConfig']);
            spinner = jasmine.createSpyObj('spinner', ['forPromise']);
            $provide.value('appService', appService);
            $provide.value('conceptSetService', conceptSetService);
            $provide.value('contextChangeHandler', contextChangeHandler);
            $provide.value('observationsService', observationsService);
            $provide.value('messagingService', messagingService);
            $provide.value('messagingService', messagingService);
            $provide.value('conceptSetUiConfigService', conceptSetUiConfigService);
            $provide.value('spinner', spinner);
        });
        inject(function ($compile, $rootScope, $httpBackend) {
            compile = $compile;
            scope = $rootScope.$new();
            httpBackend = $httpBackend;
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
            additionalAttributesConceptName: {},
            "conceptSetName" :{"hideAbnormalButton" :true}
        });

        conceptSetService.getConcept.and.returnValue(specUtil.respondWith({}));
    });


    it("should apply form conditions for observation on AddMore", function () {
        scope.selectOptions = function(){
            return {}
        };

        httpBackend.expectGET("../common/concept-set/views/conceptSet.html").respond('<div>dummy</div>');

        var html = '<concept-set concept-set-name = "conceptSetName"  observations = "observations" required="true" show-title="" validation-handler="something" patient = "patient" concept-set-focused="no" collapse-inner-sections="no"></concept-set>';
        var element = compile(html)(scope);
        scope.$digest();
        httpBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        //scope.$digest();
        //spyOn(scope, '$broadcast');
        //
        //scope.$broadcast('event:addMore', scope.observations[0]);
        //expect(scope.$root.$on).toHaveBeenCalled();
    });

    it("should set hideAbnormalButton value from config", function(){

        httpBackend.expectGET("../common/concept-set/views/conceptSet.html").respond('<div>dummy</div>');
        scope.conceptSetName = "conceptSetName";
        var html = '<concept-set concept-set-name = "conceptSetName"  observations = "observations" required="true" show-title="" validation-handler="something" patient = "patient" concept-set-focused="no" collapse-inner-sections="no"></concept-set>';
        var element = compile(html)(scope);
        scope.$digest();
        httpBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.hideAbnormalButton).toBeTruthy();

    });
});
