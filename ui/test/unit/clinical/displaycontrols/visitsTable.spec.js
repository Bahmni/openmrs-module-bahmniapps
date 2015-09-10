'use strict';

describe("Visits Table display control", function () {
    var element, scope, $compile, mockBackend;

    beforeEach(module('ngHtml2JsPreprocessor'));
    beforeEach(module('bahmni.clinical'));
    beforeEach(module(function($provide) {
        $provide.value('$state', {});
        $provide.value('$bahmniCookieStore', {});
    }));

    beforeEach(inject(function (_$compile_, $rootScope, $httpBackend) {
        scope = $rootScope;
        $compile = _$compile_;
        scope.patientUuid = '123';
        scope.params = {};
        mockBackend = $httpBackend;
        mockBackend.expectGET("displaycontrols/allvisits/views/visitsTable.html").respond("<div></div>");
    }));


    it("should show visit tables", function () {
        element = angular.element('<visits-table></visits-table>');
        $compile(element)(scope);
        scope.$digest();

        expect(element.scope().patientUuid).toBe("123");
    });

});