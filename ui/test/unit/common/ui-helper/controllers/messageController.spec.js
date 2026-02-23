/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

describe("MessageController", function () {

    beforeEach(module('bahmni.common.uiHelper'));

    var scope, controller, rootScope, messagingService, translate, $state, exitAlertService;

    beforeEach(inject(function ($controller, $rootScope) {
        controller = $controller;
        rootScope = $rootScope;
        scope = $rootScope.$new();
        messagingService = jasmine.createSpyObj("messagingService", ["hideMessages"]);
    }));

    var translatedMessages = {
        "SERVERERROR":"thisisservererror"
    };
    translate = jasmine.createSpyObj('$translate', ['instant']);
    translate.instant.and.callFake(function (key) {
        return translatedMessages[key];
    });

    function createController() {
        return controller("MessageController", {
            $scope: scope,
            $translate: translate,
            messagingService : messagingService,
            $state: $state,
            exitAlertService: exitAlertService
        });
    }

    describe("method isErrorMessagePresent", function () {
        it("should return true if error present", function () {
            createController();
            scope.messages = {error:["abcd"]};
            expect(scope.isErrorMessagePresent()).toBeTruthy();
        });
    });

    describe("method getMessageText", function () {
        it("should return concatenated message for the specified level", function () {
            createController();
            scope.messages = {error:[{'value':'SERVER'},{'value':"ERROR"}]};
            expect(scope.getMessageText('error')).toBe("thisisservererror");
        });
    });

    describe("method hideMessage", function() {
        it ("should call messagingservice hideMessages", function(){
            createController();
            scope.hideMessage('level');
            expect(messagingService.hideMessages).toHaveBeenCalledWith("level");
        });
    });
});
