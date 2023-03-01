'use strict';

describe("Form Controls", function () {
    var element, scope, $compile, spinner, provide, formService, renderHelper, translate;

    beforeEach(
        function () {
            module('bahmni.clinical');
            module(function ($provide) {
                provide = $provide;
                formService = jasmine.createSpyObj('formService', ['getFormDetail', 'getFormTranslations']);
                spinner = jasmine.createSpyObj('spinner', ['forPromise']);
                provide.value('formService', formService);
                translate = {
                    use: function(){ return 'en' }
                };
                provide.value('spinner', spinner);
                provide.value('$translate', translate);
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
        formService.getFormDetail.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({ data: data });
                }
            }
        });

        formService.getFormTranslations.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({ concepts: { TEMPERATURE_2: 'Temperature' }});
                }
            }
        })
    }

    it('should call formService.getFormDetail', function () {
        mockObservationService({});
        createElement();
        expect(formService.getFormDetail).toHaveBeenCalledWith('formUuid', { v: 'custom:(resources:(value))' });
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
        element = angular.element("<form-controls patient = \"{ uuid: '123'}\" form=\"{ formName: 'form1', formUuid: 'formUuid', defaultLocale: 'en' }\" ></form-controls>");
        $compile(element)(scope);
        scope.$digest();
    };
});
