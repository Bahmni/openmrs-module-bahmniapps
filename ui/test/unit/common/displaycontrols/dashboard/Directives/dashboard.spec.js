'use strict';

describe('Dashboard', function () {
    var rootScope, scope, compiledElementScope,
        compile,
        mockBackend,
        element,
        directiveHtml = '<dashboard></dashboard>';

    beforeEach(module('bahmni.common.displaycontrol.dashboard'));

    beforeEach(inject(function ($compile, $httpBackend, $rootScope) {
        compile = $compile;
        mockBackend = $httpBackend;
        rootScope = $rootScope;
        scope = rootScope.$new();
    }));

    function init() {
        mockBackend.expectGET('../common/displaycontrols/dashboard/views/dashboard.html').respond("<div>dummy</div>");
        element = compile(directiveHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        compiledElementScope = element.isolateScope();
        scope.$digest();
    }

    it('should check for display type of page sections', function () {

        init();
        var section = [
            [{"displayType": "Full-Page"}],
            [{"displayType": "Half-Page"}],
            [{"displayType": "LAYOUT_25_75"}],
            [{"displayType": "LAYOUT_75_25"}],
        ];

        expect(compiledElementScope.isFullPageSection(section[0])).toBeTruthy();
        expect(compiledElementScope.isHalfPageSection(section[1])).toBeTruthy();
        expect(compiledElementScope.isOneFourthPageSection(section[2])).toBeTruthy();
        expect(compiledElementScope.hasThreeFourthPageSection(section[3], 0)).toBeTruthy();

    });

    it('should check for wrong display type to be half-page', function () {

        init();
        var section = [
            [{"displayType": "abcd"}],
        ];
        expect(compiledElementScope.isHalfPageSection(section[0])).toBeTruthy();
    });

    it('should check if section is either one-fourth or three-fourth', function () {

        init();
        var section = [
            [{"displayType": "LAYOUT_75_25"}],
        ];
        expect(compiledElementScope.containsThreeFourthPageSection(section[0])).toBeTruthy();
    });


});