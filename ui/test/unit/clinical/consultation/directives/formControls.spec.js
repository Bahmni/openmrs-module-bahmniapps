/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

describe("Form Controls", function () {
    var element, scope, $compile, spinner, provide, formService, renderHelper, translate, $state;

    beforeEach(
        function () {
            module('bahmni.clinical');
            module(function ($provide) {
                provide = $provide;
                formService = jasmine.createSpyObj('formService', ['getFormDetail', 'getFormTranslations']);
                spinner = jasmine.createSpyObj('spinner', ['forPromise']);
                var configurationService = jasmine.createSpyObj('configurationService', ['getConfigurations']);
                var promiseMock = {
                    then: function (callback) {
                        callback({ hyperlinkAllowedDomains: '' });
                        return promiseMock;
                    },
                    catch: function (callback) {
                        return promiseMock;
                    }
                };
                configurationService.getConfigurations.and.returnValue(promiseMock);
                $state = {
                    patientUuid: 'patientUuid',
                    dirtyConsultationForm: false
                };
                provide.value('formService', formService);
                provide.value('configurationService', configurationService);
                translate = {
                    use: function(){ return 'en' }
                };
                provide.value('spinner', spinner);
                provide.value('$translate', translate);
                provide.value('$state', $state);
            });
            inject(function (_$compile_, $rootScope, _$state_) {
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

    function mockObservationServiceWithTranslationFailure(data) {
        formService.getFormDetail.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({ data: data });
                }
            }
        });
        formService.getFormTranslations.and.callFake(function () {
            return {
                then: function (successCallback, errorCallback) {
                    return errorCallback();
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

    it('should pass hyperlinkAllowedDomains config to renderWithControls', function () {
        var capturedAllowedDomains;
        window.renderWithControls = function () {
            capturedAllowedDomains = arguments[8];
            renderHelper.renderWithControlsCalledTimes += 1;
        };
        inject(function (configurationService) {
            var promiseMock = {
                then: function (callback) {
                    callback({ hyperlinkAllowedDomains: '*.example.com' });
                    return promiseMock;
                },
                catch: function (callback) {
                    return promiseMock;
                }
            };
            configurationService.getConfigurations.and.returnValue(promiseMock);
        });
        mockObservationService({ resources: [{ value: '{"name":"Vitals", "controls": [{"type":"obsControl", "controls":[]}] }' }] });
        createElement();
        expect(capturedAllowedDomains).toEqual(['*.example.com']);
    });

    it('should pass empty allowedDomains when hyperlinkAllowedDomains config is absent', function () {
        var capturedAllowedDomains;
        window.renderWithControls = function () {
            capturedAllowedDomains = arguments[8];
            renderHelper.renderWithControlsCalledTimes += 1;
        };
        inject(function (configurationService) {
            var promiseMock = {
                then: function (callback) {
                    callback({ hyperlinkAllowedDomains: '' });
                    return promiseMock;
                },
                catch: function (callback) {
                    return promiseMock;
                }
            };
            configurationService.getConfigurations.and.returnValue(promiseMock);
        });
        mockObservationService({ resources: [{ value: '{"name":"Vitals", "controls": [{"type":"obsControl", "controls":[]}] }' }] });
        createElement();
        expect(capturedAllowedDomains).toEqual([]);
    });

    it('should pass allowedDomains to renderWithControls even when translation fetch fails', function () {
        var capturedAllowedDomains;
        window.renderWithControls = function () {
            capturedAllowedDomains = arguments[8];
            renderHelper.renderWithControlsCalledTimes += 1;
        };
        inject(function (configurationService) {
            var promiseMock = {
                then: function (callback) {
                    callback({ hyperlinkAllowedDomains: '*.example.com' });
                    return promiseMock;
                },
                catch: function (callback) {
                    return promiseMock;
                }
            };
            configurationService.getConfigurations.and.returnValue(promiseMock);
        });
        mockObservationServiceWithTranslationFailure({ resources: [{ value: '{"name":"Vitals", "controls": [{"type":"obsControl", "controls":[]}] }' }] });
        createElement();
        expect(capturedAllowedDomains).toEqual(['*.example.com']);
    });

    it("should set dirtyForm flag when changes are saved", function () {
        mockObservationService({ resources: [{ value: '{"name":"Vitals", "controls": [{"type":"obsControl", "controls":[]}] }' }] });
        createElement();
        scope.$digest();

        scope.$broadcast("$event:changes-saved");
        expect($state.dirtyForm).toBeFalsy();
    });

    it('should pass hyperlinkAllowedDomains config to renderWithControls', function () {
        var capturedAllowedDomains;
        window.renderWithControls = function () {
            capturedAllowedDomains = arguments[8];
            renderHelper.renderWithControlsCalledTimes += 1;
        };
        inject(function (configurationService) {
            var promiseMock = {
                then: function (callback) {
                    callback({ hyperlinkAllowedDomains: '*.example.com' });
                    return promiseMock;
                },
                catch: function (callback) {
                    return promiseMock;
                }
            };
            configurationService.getConfigurations.and.returnValue(promiseMock);
        });
        mockObservationService({ resources: [{ value: '{"name":"Vitals", "controls": [{"type":"obsControl", "controls":[]}] }' }] });
        createElement();
        expect(capturedAllowedDomains).toEqual(['*.example.com']);
    });

    it('should pass empty allowedDomains when hyperlinkAllowedDomains config is absent', function () {
        var capturedAllowedDomains;
        window.renderWithControls = function () {
            capturedAllowedDomains = arguments[8];
            renderHelper.renderWithControlsCalledTimes += 1;
        };
        inject(function (configurationService) {
            var promiseMock = {
                then: function (callback) {
                    callback({ hyperlinkAllowedDomains: '' });
                    return promiseMock;
                },
                catch: function (callback) {
                    return promiseMock;
                }
            };
            configurationService.getConfigurations.and.returnValue(promiseMock);
        });
        mockObservationService({ resources: [{ value: '{"name":"Vitals", "controls": [{"type":"obsControl", "controls":[]}] }' }] });
        createElement();
        expect(capturedAllowedDomains).toEqual([]);
    });

    it('should pass updated collapse value to renderWithControls when collapseInnerSections changes', function () {
        var collapseArgs = [];
        window.renderWithControls = function () {
            collapseArgs.push(arguments[3]);
            renderHelper.renderWithControlsCalledTimes += 1;
        };
        mockObservationService({ resources: [{ value: '{"name":"Vitals", "controls": [{"type":"obsControl", "controls":[]}] }' }] });

        document.body.innerHTML += '<div id="formUuid"></div>';
        var formObj = {
            formName: 'form1', formUuid: 'formUuid', defaultLocale: 'en',
            collapseInnerSections: {value: false}
        };
        element = angular.element("<form-controls patient=\"{ uuid: '123'}\" form=\"formObj\"></form-controls>");
        scope.formObj = formObj;
        $compile(element)(scope);
        scope.$digest();

        var initialCollapseCount = collapseArgs.length;
        expect(collapseArgs[collapseArgs.length - 1]).toBe(false);

        scope.$apply(function () {
            formObj.collapseInnerSections = {value: true};
        });

        expect(collapseArgs.length).toBeGreaterThan(initialCollapseCount);
        expect(collapseArgs[collapseArgs.length - 1]).toBe(true);
    });

    it('should pass allowedDomains to renderWithControls even when translation fetch fails', function () {
        var capturedAllowedDomains;
        window.renderWithControls = function () {
            capturedAllowedDomains = arguments[8];
            renderHelper.renderWithControlsCalledTimes += 1;
        };
        inject(function (configurationService) {
            var promiseMock = {
                then: function (callback) {
                    callback({ hyperlinkAllowedDomains: '*.example.com' });
                    return promiseMock;
                },
                catch: function (callback) {
                    return promiseMock;
                }
            };
            configurationService.getConfigurations.and.returnValue(promiseMock);
        });
        mockObservationServiceWithTranslationFailure({ resources: [{ value: '{"name":"Vitals", "controls": [{"type":"obsControl", "controls":[]}] }' }] });
        createElement();
        expect(capturedAllowedDomains).toEqual(['*.example.com']);
    });

    describe('re-render when draft observations arrive', function () {
        var formDetails = { resources: [{ value: '{"name":"Vitals", "controls": [{"type":"obsControl", "controls":[]}] }' }] };

        var createElementWithForm = function (form) {
            document.body.innerHTML += '<div id="formUuid"></div>';
            scope.form = form;
            element = angular.element('<form-controls patient="{ uuid: \'123\'}" form="form"></form-controls>');
            $compile(element)(scope);
            scope.$digest();
        };

        it('should re-render when observations change and a re-render was requested', function () {
            mockObservationService(formDetails);
            var form = { formName: 'form1', formUuid: 'formUuid', defaultLocale: 'en', observations: [] };
            createElementWithForm(form);
            var rendersAfterLoad = renderHelper.renderWithControlsCalledTimes;

            form.needsReRender = true;
            form.observations = [{ value: 'from-draft' }];
            scope.$digest();

            expect(renderHelper.renderWithControlsCalledTimes).toBe(rendersAfterLoad + 1);
        });

        it('should pass the new observations to the re-render, not the ones captured at load', function () {
            var capturedObservations;
            window.renderWithControls = function () {
                capturedObservations = arguments[1];
                renderHelper.renderWithControlsCalledTimes += 1;
            };
            mockObservationService(formDetails);
            var form = { formName: 'form1', formUuid: 'formUuid', defaultLocale: 'en', observations: [] };
            createElementWithForm(form);

            form.needsReRender = true;
            form.observations = [{ value: 'from-draft' }];
            scope.$digest();

            expect(capturedObservations).toEqual([{ value: 'from-draft' }]);
        });

        it('should clear the re-render flag so a single request renders once', function () {
            mockObservationService(formDetails);
            var form = { formName: 'form1', formUuid: 'formUuid', defaultLocale: 'en', observations: [] };
            createElementWithForm(form);

            form.needsReRender = true;
            form.observations = [{ value: 'from-draft' }];
            scope.$digest();
            var rendersAfterDraft = renderHelper.renderWithControlsCalledTimes;

            form.observations = [{ value: 'typed-by-user' }];
            scope.$digest();

            expect(form.needsReRender).toBe(false);
            expect(renderHelper.renderWithControlsCalledTimes).toBe(rendersAfterDraft);
        });

        it('should not re-render on observation changes that did not request one', function () {
            mockObservationService(formDetails);
            var form = { formName: 'form1', formUuid: 'formUuid', defaultLocale: 'en', observations: [] };
            createElementWithForm(form);
            var rendersAfterLoad = renderHelper.renderWithControlsCalledTimes;

            form.observations = [{ value: 'typed-by-user' }];
            scope.$digest();

            expect(renderHelper.renderWithControlsCalledTimes).toBe(rendersAfterLoad);
        });

        it('should unmount the previous React tree before re-rendering', function () {
            var unmountCalls = 0;
            var originalUnMount = window.unMountForm;
            window.unMountForm = function () { unmountCalls += 1; };

            mockObservationService(formDetails);
            var form = { formName: 'form1', formUuid: 'formUuid', defaultLocale: 'en', observations: [] };
            createElementWithForm(form);
            var unmountsAfterLoad = unmountCalls;

            form.needsReRender = true;
            form.observations = [{ value: 'from-draft' }];
            scope.$digest();

            expect(unmountCalls).toBe(unmountsAfterLoad + 1);
            window.unMountForm = originalUnMount;
        });

        it('should unmount the React tree on scope destroy', function () {
            var unmountCalls = 0;
            var originalUnMount = window.unMountForm;
            window.unMountForm = function () { unmountCalls += 1; };

            mockObservationService(formDetails);
            var form = { formName: 'form1', formUuid: 'formUuid', defaultLocale: 'en', observations: [] };
            createElementWithForm(form);
            var unmountsAfterLoad = unmountCalls;

            scope.$destroy();

            expect(unmountCalls).toBe(unmountsAfterLoad + 1);
            window.unMountForm = originalUnMount;
        });
    });
    var createElement = function () {
        document.body.innerHTML += '<div id="formUuid"></div>';
        element = angular.element("<form-controls patient = \"{ uuid: '123'}\" form=\"{ formName: 'form1', formUuid: 'formUuid', defaultLocale: 'en' }\" ></form-controls>");
        $compile(element)(scope);
        scope.$digest();
    };
});
