'use strict';

describe("navigationController", function () {
    var configurationService;
    var scope;
    var controller;

    beforeEach(angular.mock.module('navigation.navigationController'));
    beforeEach(angular.mock.inject(function () {
        configurationService = jasmine.createSpyObj('ConfigurationService', ['init']);
        var dumb = function(){
            "dumb";
        };
        configurationService.init.andReturn(dumb)
    }));


    var setUp = function(){
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller('NavigationController',{
                $scope : scope,
                ConfigurationService: configurationService
            });
        });
    }


    describe("initialization", function () {
        it('should initialize configurations', function () {
            setUp();
            expect(configurationService.init).toHaveBeenCalled();
        });
    });
});
