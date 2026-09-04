'use strict';

describe("multiSelectObservationSearchController", function () {

    var $scope, $controller, conceptSetService;

    beforeEach(module('bahmni.common.conceptSet'));

    beforeEach(module(function ($provide) {
        conceptSetService = jasmine.createSpyObj('conceptSetService', ['getConcept']);
        $provide.value('conceptSetService', conceptSetService);
    }));

    beforeEach(inject(function ($rootScope, _$controller_) {
        $controller = _$controller_;
        $scope = $rootScope.$new();
    }));

    var initController = function () {
        $controller('multiSelectObservationSearchController', {
            $scope: $scope,
            conceptSetService: conceptSetService
        });
    };

    it("should call handleUpdate after addItem", function () {
        var handleUpdateSpy = jasmine.createSpy('handleUpdate');
        $scope.handleUpdate = handleUpdateSpy;
        $scope.observation = {
            selectedObs: {},
            toggleSelection: jasmine.createSpy('toggleSelection'),
            getConceptUIConfig: function () { return {}; },
            getPossibleAnswers: function () { return []; }
        };

        conceptSetService.getConcept.and.returnValue({
            then: function (cb) { cb({ data: { results: [] } }); }
        });

        initController();

        var item = { uuid: 'uuid-1', name: 'Item 1' };
        $scope.addItem(item);

        expect(handleUpdateSpy).toHaveBeenCalled();
    });

    it("should call handleUpdate after removeItem", function () {
        var handleUpdateSpy = jasmine.createSpy('handleUpdate');
        $scope.handleUpdate = handleUpdateSpy;
        $scope.observation = {
            selectedObs: { 'Item 1': { uuid: 'uuid-1', value: { name: 'Item 1' } } },
            toggleSelection: jasmine.createSpy('toggleSelection'),
            getConceptUIConfig: function () { return {}; },
            getPossibleAnswers: function () { return []; }
        };

        conceptSetService.getConcept.and.returnValue({
            then: function (cb) { cb({ data: { results: [] } }); }
        });

        initController();

        var item = { uuid: 'uuid-1', name: 'Item 1' };
        $scope.removeItem(item);

        expect(handleUpdateSpy).toHaveBeenCalled();
    });

    it("should not fail when handleUpdate is not provided", function () {
        $scope.observation = {
            selectedObs: {},
            toggleSelection: jasmine.createSpy('toggleSelection'),
            getConceptUIConfig: function () { return {}; },
            getPossibleAnswers: function () { return []; }
        };

        conceptSetService.getConcept.and.returnValue({
            then: function (cb) { cb({ data: { results: [] } }); }
        });

        initController();

        var item = { uuid: 'uuid-1', name: 'Item 1' };
        expect(function () {
            $scope.addItem(item);
        }).not.toThrow();
    });
});
