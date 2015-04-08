'use strict';

describe("directive: stepper", function () {

    var element, $compile, scope, $exceptionHandler, observation;
    var html = '<stepper id="123" ng-model="observation.value" obs="observation" />';

    beforeEach(module('bahmni.common.conceptSet'));

    beforeEach(module(function ($exceptionHandlerProvider) {
        $exceptionHandlerProvider.mode('log');
    }));

    var injectionFn = function($compile, $rootScope) {

        scope = $rootScope.$new();
        scope.obs = observation;
        scope.observation = observation;

        element = angular.element(html);

        $compile(element)(scope);

        scope = element.isolateScope();
        scope.$apply();
    };

    var beforeWithBounds = function() {

        observation = new Bahmni.ConceptSet.Observation({
            concept: {name: "someConcept", dataType: "Numeric", hiNormal: 100, lowNormal: 90, value: 95}
        }, null, {});
        observation.value = 95;

        inject(injectionFn);

    };

    it("Stepper With Bounds", function () {
        beforeWithBounds();
        expect(element.find('input').length).toBe(1);
        expect(element.find('button').length).toBe(2);
        element.isolateScope().decrement();
        element.isolateScope().decrement();
        expect(scope.obs.value).toBe(93);

        element.isolateScope().decrement();
        element.isolateScope().decrement();

        element.isolateScope().decrement();
        expect(scope.obs.value).toBe(90);
        element.isolateScope().decrement();
        //Should not go below 90
        expect(scope.obs.value).toBe(90);
        element.isolateScope().increment();
        expect(scope.obs.value).toBe(91);
    });

    var beforeWithoutBounds = function() {
        html = '<stepper id="123" ng-model="observation.value" obs="observation" />';
        observation = new Bahmni.ConceptSet.Observation({
            concept: {name: "someConcept", dataType: "Numeric", value: 95}
        }, null, {});
        observation.value = 95;
        inject(injectionFn);
    };

    it("Stepper Without Bounds", function () {
        beforeWithoutBounds();
        expect(element.find('input').length).toBe(1);
        expect(element.find('button').length).toBe(2);
        element.isolateScope().decrement();
        element.isolateScope().decrement();
        expect(scope.obs.value).toBe(93);

        element.isolateScope().decrement();
        element.isolateScope().decrement();

        element.isolateScope().decrement();
        expect(scope.obs.value).toBe(90);
        element.isolateScope().decrement();
        //Should not go below 90
        expect(scope.obs.value).toBe(89);
        element.isolateScope().increment();
        expect(scope.obs.value).toBe(90);
    });
});
