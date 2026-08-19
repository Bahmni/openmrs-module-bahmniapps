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

    var createElement = function () {
        document.body.innerHTML += '<div id="formUuid"></div>';
        element = angular.element("<form-controls patient = \"{ uuid: '123'}\" form=\"{ formName: 'form1', formUuid: 'formUuid', defaultLocale: 'en' }\" ></form-controls>");
        $compile(element)(scope);
        scope.$digest();
    };
});
