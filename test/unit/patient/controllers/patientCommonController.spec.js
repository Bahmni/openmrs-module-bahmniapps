'use strict';

describe('PatientCommonController', function () {

    var autoCompleteService;
    var success;
    var controller;
    var scope;

    beforeEach(angular.mock.module('registration.patientCommon'));
    beforeEach(angular.mock.inject(function ($injector) {
        success = jasmine.createSpy('Successful');

        autoCompleteService = jasmine.createSpyObj('autoCompleteService', ['getAutoCompleteList']);
        autoCompleteService.getAutoCompleteList.andReturn({success:success});

    }));

    var setupController = function () {
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller('PatientCommonController', {
                $scope:scope,
                autoCompleteService:autoCompleteService
            });
        });
    }


    it('should use the autoCompleteService to get auto complete list', function () {
        setupController();

        var key = "caste";
        var param = "res";

        scope.getAutoCompleteList(key, param);

        expect(autoCompleteService.getAutoCompleteList).toHaveBeenCalled();
        expect(autoCompleteService.getAutoCompleteList.mostRecentCall.args[0]).toBe(key);
        expect(autoCompleteService.getAutoCompleteList.mostRecentCall.args[1]).toBe(param);
    })
});