'use strict';

describe("ConsultationNavigationController", function () {
    var configurationService;
    var scope;
    var controller;

    beforeEach(module('opd.consultation'));
    beforeEach(inject(function () {
        configurationService = jasmine.createSpyObj('ConfigurationService', ['init']);
        var dumb = function(){
            "dumb";
        };
        configurationService.init.andReturn(dumb)
    }));


    var setUp = function(){
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller('ConsultationNavigationController',{
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
