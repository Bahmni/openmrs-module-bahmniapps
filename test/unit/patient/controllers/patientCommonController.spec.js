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


    describe("getLastNameList", function () {
        it('should use the autoCompleteService to get laste name list', function () {
            setupController();
            var param = "ram";

            scope.getLastNameList(param);

            expect(autoCompleteService.getAutoCompleteList).toHaveBeenCalled();
            expect(autoCompleteService.getAutoCompleteList.mostRecentCall.args[0]).toBe("familyName");
            expect(autoCompleteService.getAutoCompleteList.mostRecentCall.args[1]).toBe(param);
        });
    });

    describe("getCasteList", function () {
        it('should use the autoCompleteService to get caste list', function () {
            setupController();
            var param = "hin";

            scope.getCasteList(param);

            expect(autoCompleteService.getAutoCompleteList).toHaveBeenCalled();
            expect(autoCompleteService.getAutoCompleteList.mostRecentCall.args[0]).toBe("caste");
            expect(autoCompleteService.getAutoCompleteList.mostRecentCall.args[1]).toBe(param);
        });
    });
});