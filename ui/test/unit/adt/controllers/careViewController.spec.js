'use strict';

describe("CareViewController", function () {
    var scope, controller;
    var state = jasmine.createSpyObj('$state', ['go']);
    beforeEach(module('bahmni.adt'));
    beforeEach(inject(function ($controller, $rootScope) {
        controller = $controller;
        scope = $rootScope.$new();
    }));
    let mockProvider = {name: "__test__provider"}
    var createController = function () {

        controller('CareViewController', {
            $scope: scope,
            $rootScope: {currentProvider: mockProvider},
            $state: state,
        });
    };
    it('should create host data and host api', function (){
        createController();
        expect(scope.hostData).toEqual({provider: mockProvider});
        expect(scope.hostApi).not.toBeNull();
    })
});