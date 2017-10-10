'use strict';

describe('multiSelectAutocomplete', function () {
    var compile, scope, httpBackend, event, document;

    beforeEach(module('bahmni.appointments', function ($provide) {
        event = jasmine.createSpyObj('$event', ['stopPropagation']);
        $provide.value('$event', event);
    }));

    beforeEach(inject(function ($compile, $httpBackend, $rootScope, $document) {
        compile = $compile;
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        document = $document;
        httpBackend.expectGET('../i18n/appointments/locale_en.json').respond('<div></div>');
        httpBackend.expectGET('/bahmni_config/openmrs/i18n/appointments/locale_en.json').respond('<div></div>');
        httpBackend.expectGET('../appointments/views/manage/multiSelectAutocomplete.html').respond('<div></div>');
    }));

    var createElement = function () {
        var html = '<multi-select-autocomplete input-items="providers" selected-values="selectedProviders" display-property="display" key-property="keyProperty" load-on-down-arrow="true" auto-complete-min-length="1"></multi-select-autocomplete>';

        var element = compile(angular.element(html))(scope);
        scope.$digest();
        httpBackend.flush();
        return element;
    };

    it('should remove item from selectedValues', function () {
        scope.providers = [{name: "test1",person:{display:"test1"}, display: "test1", uuid: "test1"}];
        scope.keyProperty = "uuid";
        scope.selectedProviders = [];

        var item = {name: "item1", uuid: "item1"};
        var scope1 = createElement().isolateScope();
        scope1.selectedValues = [{name: "item1", uuid: "item1"}, {name:"item2", uuid:"item2"}];
        scope1.removeItem(item);
        expect(scope1.selectedValues.length).toBe(1);
    });

    it('should return the matched values when we pass the query', function () {
        scope.providers = [];
        scope.keyProperty = "uuid";
        scope.selectedProviders = [];

        var item = {name: "item1", uuid: "item1"};
        var scope1 = createElement().isolateScope();
        scope1.selectedValues = [{name: "item1", uuid: "item1"}, {name:"item2", uuid:"item2"}];
        var results = scope1.search("1");
        expect(results.length).toBe(1);
        var results = scope1.search("item");
        expect(results.length).toBe(2);
    });
});
