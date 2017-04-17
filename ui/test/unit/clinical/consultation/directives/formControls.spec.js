'use strict';

describe("Form Controls", function () {
    var element, scope, $compile, spinner, provide, observationFormService, renderHelper;

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

            renderHelper = {
                renderWithControlsOriginal: window.renderWithControls,
                renderWithControlsCalledTimes: 0
            };
            fakeRenderHelperFunctions();
        }
    );

    afterEach(function () {
        resetReactHelperFunctions();
    });

    function fakeRenderHelperFunctions() {
        window.renderWithControls = function () {
            renderHelper.renderWithControlsCalledTimes += 1;
        };
    }

    function resetReactHelperFunctions() {
        window.renderWithControls = renderHelper.renderWithControlsOriginal;
    }

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
        expect(observationFormService.getFormDetail).toHaveBeenCalledWith('formUuid', { v: 'custom:(resources:(value))' });
    });

    it('should call spinner.forPromise', function () {
        mockObservationService({ form: 'form1' });
        createElement();
        expect(spinner.forPromise).toHaveBeenCalled();
    });

    it('should call renderWithControls', function () {
        mockObservationService({ resources: [{ value: '{"name":"Vitals", "controls": [{"type":"obsControl", "controls":[]}] }' }] });
        createElement();
        expect(renderHelper.renderWithControlsCalledTimes).toBe(2);
    });

    var createElement = function () {
        document.body.innerHTML += '<div id="formUuid"></div>';
        element = angular.element("<form-controls form=\"{ formName: 'form1', formUuid: 'formUuid' }\"></form-controls>");
        $compile(element)(scope);
        scope.$digest();
    };
});
