'use strict';

describe("DispositionController", function () {

    var scope, rootScope;

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        rootScope = $rootScope;

        scope.consultation = {saveHandler: new Bahmni.Clinical.SaveHandler()};

        var retrospectiveEntry = Bahmni.Common.Domain.RetrospectiveEntry.createFrom(Date.parse('2015-07-01'));
        var retrospectiveEntryService = jasmine.createSpyObj('retrospectiveEntryService', ['getRetrospectiveEntry']);
        retrospectiveEntryService.getRetrospectiveEntry.and.returnValue(retrospectiveEntry);



        $controller('DispositionController', {
            $scope: scope,
            $rootScope: rootScope,
            retrospectiveEntryService: retrospectiveEntryService,
        });
    }));

    it("should return true if it is in retrospective mode", function () {
        dump(scope.isRetrospectiveMode());
        expect(scope.isRetrospectiveMode()).toBeTruthy();
    });
});