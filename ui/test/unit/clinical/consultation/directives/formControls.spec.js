'use strict';

describe("Form Controls", function () {
    var element, scope, $compile, spinner, provide, observationFormService;

    beforeEach(
        function () {
            module('bahmni.clinical');
            module(function ($provide) {
                provide = $provide;
                observationFormService = jasmine.createSpyObj('observationFormService', ['getFormDetail']);
                spinner = jasmine.createSpyObj('spinner', ['forPromise']);

                provide.value('observationFormService', observationFormService);
                provide.value('spinner', spinner);
            });
            inject(function (_$compile_, $rootScope) {
                $compile = _$compile_;
                scope = $rootScope.$new();
            });
        }
    );

    function mockObservationService(data) {
        observationFormService.getFormDetail.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({ data: data });
                }
            }
        });
    }

    it('should call observationFormService.getFormDetail', function () {
        mockObservationService({});
        createElement();
        expect(observationFormService.getFormDetail).toHaveBeenCalledWith('formUuid', { v: 'custom:(resources)' });
    });

    it('should call spinner.forPromise', function () {
        mockObservationService({ form: 'form1' });
        createElement();
        expect(spinner.forPromise).toHaveBeenCalled();
    });

    var createElement = function () {
        element = angular.element("<form-controls form=\"{ formName: 'form1', formUuid: 'formUuid' }\"></form-controls>");
        $compile(element)(scope);
        scope.$digest();
    };
})
;