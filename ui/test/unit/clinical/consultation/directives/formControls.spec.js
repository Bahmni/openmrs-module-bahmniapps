'use strict';

describe("Form Controls", function () {
    var element, scope, $compile, spinner, provide, observationFormService, reactHelper;

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

            reactHelper = {
                ReactHelperOriginal: window.ReactHelper,
                createComponentCalledTimes: 0,
                renderComponentCalledTimes: 0
            };
            fakeReactHelperFunctions();
        }
    );

    afterEach(function () {
        resetReactHelperFunctions();
    });

    function fakeReactHelperFunctions() {
        window.ReactHelper.createReactComponent = function () {
            reactHelper.createComponentCalledTimes += 1;
        };
        window.ReactHelper.renderReactComponent = function () {
            reactHelper.renderComponentCalledTimes += 1;
        };
    }

    function resetReactHelperFunctions() {
        window.ReactHelper = reactHelper.ReactHelperOriginal;
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
        expect(observationFormService.getFormDetail).toHaveBeenCalledWith('formUuid', { v: 'custom:(resources)' });
    });

    it('should call spinner.forPromise', function () {
        mockObservationService({ form: 'form1' });
        createElement();
        expect(spinner.forPromise).toHaveBeenCalled();
    });

    it('should call createComponent and renderComponent', function () {
        mockObservationService({ resources: [{ valueReference: '{"name":"Vitals", "controls": [{"type":"obsControl", "controls":[]}] }' }] });
        createElement();
        expect(reactHelper.createComponentCalledTimes).toBe(2);
        expect(reactHelper.renderComponentCalledTimes).toBe(1);
    });

    it('should not call createComponent if the type is wrong', function () {
        mockObservationService({ resources: [{ valueReference: '{"name":"Vitals", "controls": [{"type":"someIncorrectType", "controls":[]}] }' }] });
        createElement();
        expect(reactHelper.createComponentCalledTimes).toBe(1); // called once for FormControlsContainer
    });

    var createElement = function () {
        document.body.innerHTML += '<div id="formUuid"></div>';
        element = angular.element("<form-controls form=\"{ formName: 'form1', formUuid: 'formUuid' }\"></form-controls>");
        $compile(element)(scope);
        scope.$digest();
    };
});
