'use strict';

describe('DashboardSection', function () {
    var rootScope, scope, compiledElementScope,
        compile,
        mockBackend,
        element,
        directiveHtml = '<dashboard-section></dashboard-section>';

    beforeEach(module('bahmni.common.displaycontrol.dashboard'));

    beforeEach(inject(function ($compile, $httpBackend, $rootScope) {
        compile = $compile;
        mockBackend = $httpBackend;
        rootScope = $rootScope;
        scope = rootScope.$new();
    }));

    function init(isHideEmptyDisplayControl) {
        mockBackend.expectGET('../common/displaycontrols/dashboard/views/dashboardSection.html').respond("<div>dummy</div>");
        scope.section = {
            isDataAvailable: true,
            hideEmptyDisplayControl: isHideEmptyDisplayControl
        };

        element = compile(directiveHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        compiledElementScope = element.isolateScope();
        scope.$digest();
    }

    it('should not change data availability check when hideEmptyDisplayControl is false', function () {
        init(false);
        scope.$emit("no-data-present-event");
        expect(scope.section.isDataAvailable).toBeTruthy();

    });
    it('should change data availability check when hideEmptyDisplayControl is true', function () {
        init(true);
        scope.$emit("no-data-present-event");
        expect(scope.section.isDataAvailable).toBeFalsy();
    });
});