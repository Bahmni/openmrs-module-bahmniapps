'use strict';

describe('WardListController', function () {

    var controller, rootScope, scope, queryService, appService, window;

    beforeEach(function () {
        module('bahmni.adt');
        module(function ($provide) {
          var realAppDescriptor = new Bahmni.Common.AppFramework.AppDescriptor();
          realAppDescriptor.getConfigValue = function (config) {
              if (config === 'enableIPDFeature') {
                  return false;
              }
          };

          appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
          appService.getAppDescriptor.and.returnValue(realAppDescriptor);
            $provide.value('appService', {});
            queryService = jasmine.createSpyObj('queryService', ['getResponseFromQuery']);
            queryService.getResponseFromQuery.and.returnValue(specUtil.createServicePromise('queryService'));
            $provide.value('queryService', queryService);
            $provide.value('$stateParams', {});
        });

        inject(function ($controller, $rootScope, $window) {
            controller = $controller;
            rootScope = $rootScope;
            scope = $rootScope.$new();
            window = $window;
        });

        scope.ward = {ward: {name: 'ward1'}};
        controller('WardListController', {
            $scope: scope,
            appService: appService
        });
    });

    describe('gotoPatientDashboard', function () {
        it('should go to patient dashboard', function () {
            scope.ward = {ward: {name: 'ward1'}};
            controller('WardListController', {
                $scope: scope,
                queryService: queryService,
                appService: appService
            });
            scope.gotoPatientDashboard('patient1', 'visit2');
            expect(window.location.toString().indexOf("/context.html#/patient/patient1/visit/visit2/")).not.toEqual(-1);
        });
    });

    describe('searchTextFilter', function () {
          it('should return true when search text is empty', function () {
            expect(scope.searchTextFilter({})).toBe(true);
          });

          it('should return true for row matching exact search text (case-insensitive)', function () {
            scope.searchText = 'test';
            expect(scope.searchTextFilter({ name: 'TEST' })).toBe(true);
            expect(scope.searchTextFilter({ description: 'testValue' })).toBe(true);
          });

          it('should return true for row containing search text (case-insensitive)', function () {
            scope.searchText = 'Value';
            expect(scope.searchTextFilter({ name: 'Any Value' })).toBe(true);
            expect(scope.searchTextFilter({ details: 'This has some Value' })).toBe(true);
          });

          it('should return false for row with no matching text', function () {
            scope.searchText = 'other';
            expect(scope.searchTextFilter({ name: 'Test Name' })).toBe(false);
            expect(scope.searchTextFilter({ details: 'No Match Here' })).toBe(false);
          });

          it('should exclude specified keys from search', function () {
            scope.searchText = 'hidden';
            expect(scope.searchTextFilter({ hiddenAttributes: 'hidden data' })).toBe(false);
            expect(scope.searchTextFilter({ $$hashKey: 'hash' })).toBe(false);
          });

          it('should search on all non-excluded keys', function () {
            scope.searchText = 'giardiasis';
            expect(scope.searchTextFilter({ name: 'John Doe', primaryDiagnoses: 'Giardiasis', secondaryDiagnoses: 'Hay Fever' })).toBe(true);
          });
    });
});

