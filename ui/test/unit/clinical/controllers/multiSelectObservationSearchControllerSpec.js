'use strict';

describe('multiSelectObservationSearchController', function () {

    beforeEach(module('bahmni.clinical.conceptSet'));

    var $controller, scope;
    var conceptSetService = jasmine.createSpy('conceptSetService',['getConcept']);

    beforeEach(inject(function(_$controller_, _$rootScope_){
        $controller = _$controller_;
        scope = _$rootScope_.new();
    }));

    iit("Should initialize the controller with possible answers", (inject(function($controller){
       var controller = $controller('multiSelectObservationSearchController',{
           $scope : scope,
           conceptSerService : conceptSetService
       });

        expect(scope.values.length).toBe(0);

    })));
});
