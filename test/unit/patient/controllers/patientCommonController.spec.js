'use strict';

describe('PatientCommonController', function () {

    var patientAttributeService;
    var success;
    var controller;
    var scope;

    beforeEach(angular.mock.module('registration.patientCommon'));
    beforeEach(angular.mock.inject(function ($injector) {
        success = jasmine.createSpy('Successful');

        patientAttributeService = jasmine.createSpyObj('patientAttributeService', ['search']);
        patientAttributeService.search.andReturn({success:success});

    }));

    var setupController = function () {
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller('PatientCommonController', {
                $scope:scope,
                patientAttributeService:patientAttributeService
            });
        });
    }


    describe("getLastNameList", function () {
        it('should use the patientAttributeService to get laste name list', function () {
            setupController();
            var param = "ram";

            scope.getLastNameList(param);

            expect(patientAttributeService.search).toHaveBeenCalled();
            expect(patientAttributeService.search.mostRecentCall.args[0]).toBe("familyName");
            expect(patientAttributeService.search.mostRecentCall.args[1]).toBe(param);
        });
    });

    describe("getCasteList", function () {
        it('should use the patientAttributeService to get caste list', function () {
            setupController();
            var param = "hin";

            scope.getCasteList(param);

            expect(patientAttributeService.search).toHaveBeenCalled();
            expect(patientAttributeService.search.mostRecentCall.args[0]).toBe("caste");
            expect(patientAttributeService.search.mostRecentCall.args[1]).toBe(param);
        });
    });
});