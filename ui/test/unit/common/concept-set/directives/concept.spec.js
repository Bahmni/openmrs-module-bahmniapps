'use strict';

describe("concept", function () {
    var recursionHelper, spinner, conceptSetService, filter, compile, scope, httpBackend, translate;

    beforeEach(function () {
        module('bahmni.common.conceptSet');
        module(function ($provide) {
            conceptSetService = jasmine.createSpyObj('conceptSetService', ['getConcept']);
            spinner = jasmine.createSpyObj('spinner', ['forPromise']);
            recursionHelper = jasmine.createSpyObj('RecursionHelper', ['compile']);
            $provide.value('conceptSetService', conceptSetService);
            $provide.value('spinner', spinner);
            $provide.value('RecursionHelper', recursionHelper);
            $provide.value('$translate', translate);
        });
        inject(function ($compile, $rootScope, $httpBackend, $filter) {
            compile = $compile;
            scope = $rootScope.$new();
            httpBackend = $httpBackend;
            filter = $filter;
        });
    });
    beforeEach(function () {
        conceptSetService.getConcept.and.returnValue({
            then: function () {
                return function () {
                    return {}
                }
            }
        });
    });

    it("should set hideAbnormalButton value from config first", function(){
        scope.conceptSetName = "conceptSetName";
        scope.hideAbnormalButton = "false";
        scope.observation = {"conceptUIconfig" : {"hideAbnormalButton": true }};

        httpBackend.expectGET('../common/concept-set/views/observation.html').respond('<div>dummy</div>');
        var html = '<concept concept-set-name = "conceptSetName" hide-abnormal-button="hideAbnormalButton"></concept>';
        var element = compile(html)(scope);
        scope.$digest();
        httpBackend.flush();

        var compiledElementScope = element.isolateScope();

        expect(compiledElementScope.hideAbnormalButton).toBeTruthy();

    });
});
