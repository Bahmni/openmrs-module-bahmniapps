'use strict';

describe('WardListController', function () {

    var controller;
    var rootScope;
    var scope;
    var queryService, appService, window;


    beforeEach(function () {
        module('bahmni.adt');

        module(function ($provide) {
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            appService.getAppDescriptor.and.returnValue(new Bahmni.Common.AppFramework.AppDescriptor());

            $provide.value('appService', {});
            queryService = jasmine.createSpyObj('queryService', ['getResponseFromQuery']);
            queryService.getResponseFromQuery.and.returnValue(specUtil.createServicePromise('queryService'));
            $provide.value('queryService', queryService);
            $provide.value('$stateParams', {});
        });
    });

    beforeEach(function () {
        inject(function ($controller, $rootScope, $window) {
            controller = $controller;
            rootScope = $rootScope;
            scope = $rootScope.$new();
            window = $window;
        });
    });

    it('Should go to patient dashboard', function () {
        scope.ward = {ward: {name: 'ward1'}};

        controller('WardListController', {
            $scope: scope,
            QueryService: queryService,
            appService: appService
        });

        scope.gotoPatientDashboard('patient1', 'visit2');

        expect(window.location.toString().indexOf("/context.html#/patient/patient1/visit/visit2/")).not.toEqual(-1);
    });

});