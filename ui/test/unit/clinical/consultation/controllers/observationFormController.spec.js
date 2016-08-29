'use strict';

describe('ObservationFormController', function () {
    var scope, controller;
    var observationFormService = jasmine.createSpyObj('observationFormService', ['getFormList']);
    var spinner = jasmine.createSpyObj("spinner", ["forPromise"]);

    beforeEach(function () {
        module('bahmni.clinical');

        inject(function ($controller, $rootScope) {
            controller = $controller;
            scope = $rootScope.$new();
            scope.consultation = {};
        });

    });

    var mockObservationFormService = function (data) {
        observationFormService.getFormList.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({ data: data });
                }
            }
        });
    };

    function createController() {
        return controller('ObservationFormController', {
            $scope: scope,
            observationFormService: observationFormService,
            spinner: spinner
        });
    }


    describe('controller', function () {

        it("should not load observation forms it they are already present", function () {
            scope.consultation.observationForms = [
                { name: 'form1', uuid: 'uuid1' },
                { name: 'form2', uuid: 'uuid2' }
            ];
            createController();
            expect(observationFormService.getFormList).not.toHaveBeenCalled();
        });

        it("should make a call to observationFormService.getFormList", function () {
            mockObservationFormService({ results: [] });
            createController();
            expect(observationFormService.getFormList).toHaveBeenCalled();
        });

        it("should load the forms", function () {
            mockObservationFormService({
                results: [
                    { name: 'form1', uuid: 'uuid1' },
                    { name: 'form2', uuid: 'uuid2' }
                ]
            });
            createController();

            expect(scope.consultation.observationForms.length).toEqual(2);
            expect(scope.consultation.observationForms[0].formName).toEqual('form1');
            expect(scope.consultation.observationForms[0].formUuid).toEqual('uuid1');
            expect(scope.consultation.observationForms[0].isOpen).toEqual(false);
            expect(scope.consultation.observationForms[0].toggleDisplay).toBeDefined();

            expect(scope.consultation.observationForms[1].formName).toEqual('form2');
            expect(scope.consultation.observationForms[1].formUuid).toEqual('uuid2');
            expect(scope.consultation.observationForms[1].isOpen).toEqual(false);
            expect(scope.consultation.observationForms[1].toggleDisplay).toBeDefined();
        });
    });
});