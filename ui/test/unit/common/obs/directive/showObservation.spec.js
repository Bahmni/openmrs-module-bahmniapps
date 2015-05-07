'use strict';

describe("Patient Profile display control", function() {
    var element, scope, $compile, httpBackend, filter;

    beforeEach(module('bahmni.common.obs'));
    beforeEach(inject(function(_$compile_, $rootScope, $httpBackend, $filter) {
        scope = $rootScope;
        $compile = _$compile_;
        httpBackend = $httpBackend;
        filter = $filter;
    }));

    it("should not show concept name for images in print mode", function(){
        element = angular.element('<show-observation></show-observation>');
        httpBackend.expectGET('../common/obs/views/showObservation.html').respond('<div>recent</div>');
        var obs = {
            isImageConcept: function(){return true}
        };
        scope.isBeingPrinted = true;
        $compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        var compiledElementScope = element.isolateScope();

        expect(compiledElementScope.showConceptName(obs)).toBe(false);
    });

    it("should show concept name for images in non print mode", function(){
        element = angular.element('<show-observation></show-observation>');
        httpBackend.expectGET('../common/obs/views/showObservation.html').respond('<div>recent</div>');
        var obs = {
            isImageConcept: function(){return true}
        };
        scope.isBeingPrinted = false;
        $compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        var compiledElementScope = element.isolateScope();

        expect(compiledElementScope.showConceptName(obs)).toBe(true);
    });

    it("should show concept name for all other than images in print mode", function(){
        element = angular.element('<show-observation></show-observation>');
        httpBackend.expectGET('../common/obs/views/showObservation.html').respond('<div>recent</div>');
        var obs = {
            isImageConcept: function(){return false}
        };
        scope.isBeingPrinted = true;
        $compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        var compiledElementScope = element.isolateScope();

        expect(compiledElementScope.showConceptName(obs)).toBe(true);
    });

});