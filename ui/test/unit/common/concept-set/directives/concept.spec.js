/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

describe("concept", function () {
    var recursionHelper, spinner, conceptSetService, filter, compile, scope, httpBackend, translate;

    beforeEach(function () {
        module('bahmni.common.conceptSet');
        module(function ($provide) {
            conceptSetService = jasmine.createSpyObj('conceptSetService', ['getConcept']);
            spinner = jasmine.createSpyObj('spinner', ['forPromise']);
            recursionHelper = jasmine.createSpyObj('RecursionHelper', ['compile']);
            $provide.value('conceptSetService', conceptSetService);
            $provide.value('spinner', spinner);
            $provide.value('RecursionHelper', recursionHelper);
            $provide.value('$translate', translate);
        });
        inject(function ($compile, $rootScope, $httpBackend, $filter) {
            compile = $compile;
            scope = $rootScope.$new();
            httpBackend = $httpBackend;
            filter = $filter;
        });
    });
    beforeEach(function () {
        conceptSetService.getConcept.and.returnValue({
            then: function () {
                return function () {
                    return {}
                }
            }
        });
    });

    it("should set hideAbnormalButton value from config first", function(){
        scope.conceptSetName = "conceptSetName";
        scope.hideAbnormalButton = "false";
        scope.observation = {"conceptUIconfig" : {"hideAbnormalButton": true }};

        httpBackend.expectGET('../common/concept-set/views/observation.html').respond('<div>dummy</div>');
        var html = '<concept concept-set-name = "conceptSetName" hide-abnormal-button="hideAbnormalButton"></concept>';
        var element = compile(html)(scope);
        scope.$digest();
        httpBackend.flush();

        var compiledElementScope = element.isolateScope();

        expect(compiledElementScope.hideAbnormalButton).toBeTruthy();

    });

    it("should expose collapsible and pdf helpers when directive is linked", function () {
        scope.conceptSetName = "conceptSetName";
        scope.showTitle = true;
        scope.observation = { value: "report.pdf" };
        recursionHelper.compile.and.callFake(function (element, linkFn) {
            return function (linkScope) {
                linkFn(linkScope);
            };
        });

        httpBackend.expectGET('../common/concept-set/views/observation.html').respond('<div>dummy</div>');
        var html = '<concept concept-set-name = "conceptSetName" show-title="showTitle" observation="observation"></concept>';
        var element = compile(html)(scope);
        scope.$digest();
        httpBackend.flush();

        var compiledElementScope = element.isolateScope();
        expect(compiledElementScope.isCollapsibleSet()).toBeTruthy();
        expect(compiledElementScope.hasPDFAsValue()).toBeTruthy();
    });

    it("should return false for non-pdf values in helper", function () {
        scope.conceptSetName = "conceptSetName";
        scope.showTitle = false;
        scope.observation = { value: "notes.txt" };
        recursionHelper.compile.and.callFake(function (element, linkFn) {
            return function (linkScope) {
                linkFn(linkScope);
            };
        });

        httpBackend.expectGET('../common/concept-set/views/observation.html').respond('<div>dummy</div>');
        var html = '<concept concept-set-name = "conceptSetName" show-title="showTitle" observation="observation"></concept>';
        var element = compile(html)(scope);
        scope.$digest();
        httpBackend.flush();

        var compiledElementScope = element.isolateScope();
        expect(compiledElementScope.isCollapsibleSet()).toBeFalsy();
        expect(compiledElementScope.hasPDFAsValue()).toBeFalsy();
    });
});
