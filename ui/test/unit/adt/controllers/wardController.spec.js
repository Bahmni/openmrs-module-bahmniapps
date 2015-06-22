'use strict';

describe('WardController', function() {

    var controller;
    var rootScope;
    var scope;
    var userService = jasmine.createSpyObj('userService',['savePreferences']);


    beforeEach(function() {
        module('bahmni.adt');
    });

    beforeEach(function() {
        inject(function($controller, $rootScope) {
            controller = $controller;
            rootScope = $rootScope;
            scope = $rootScope.$new();
        });
        controller('WardController', {
            $scope: scope,
            userService: userService
        });
    });

    it('should remember the state in user prefs during toggle state', function() {
        scope.readOnly = true;
        scope.ward = {ward: {name: 'ward1'}};
        rootScope.currentUser = jasmine.createSpyObj('currentUser', ['toggleFavoriteWard']);

        scope.toggleExpandState();

        expect(rootScope.currentUser.toggleFavoriteWard).toHaveBeenCalledWith('ward1');
        expect(userService.savePreferences).toHaveBeenCalled();
    });

    it('should toggle ward view', function(){
        scope.currentView == 'wardLayout';

        scope.toggleWardView();
        expect(scope.currentView).toEqual("wardList");

        scope.toggleWardView();
        expect(scope.currentView).toEqual('wardLayout');
    });

});