describe('cdssPopover Directive', function () {
    var httpBackend, scope;
    var html = '<cdss-popover alerts="alerts"></cdss-popover>';

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function ($compile, $rootScope, $httpBackend, $q) {
        compile = $compile;
        rootScope = $rootScope;
        httpBackend = $httpBackend;
        q = $q;

        scope = $rootScope.$new();
        scope.alerts = [
            {
                indicator: 'critical',
                summary: 'Critical Alert',
                detail: 'This is a critical alert',
                source: {
                    url: 'https://example.com/critical'
                }
            }
        ];
        httpBackend
          .expectGET('./consultation/views/cdssPopover.html')
          .respond('<div>dummy</div>');
        var compiledEle = $compile(html)(scope);
        scope.$digest();
        httpBackend.flush();
        scope.$digest();
        scope = compiledEle.isolateScope();
        scope.$digest();
    }));

    it('should show the popover when alerts are present', function () {
        expect(scope).not.toBeUndefined();
        expect(scope.alerts.length).toBe(1);
    });

    it('should not show the popover when alerts are not present', function () {
        scope.alerts = [];
        scope.$digest();
        expect(scope.alerts.length).toBe(0);
    });
});
