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

    var scope, controller, rootScope, messagingService, translate, $state, $location, $q, exitAlertService;

    beforeEach(inject(function ($controller, $rootScope, _$q_) {
        controller = $controller;
        rootScope = $rootScope;
        scope = $rootScope.$new();
        $q = _$q_;
        messagingService = jasmine.createSpyObj("messagingService", ["hideMessages"]);
        $location = jasmine.createSpyObj('$location', ['path']);
        $state = {};
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
            $location: $location,
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

    describe("method discardChanges", function () {
        it("should navigate directly when saveFormDraftIfDirty is not set", function () {
            $state.isPatientSearch = false;
            $state.newPatientUuid = 'patient-uuid';
            createController();
            scope.discardChanges('alert');
            expect($location.path).toHaveBeenCalledWith('/default/patient/patient-uuid/dashboard');
        });

        it("should navigate to patient search when isPatientSearch is true and saveFormDraftIfDirty is not set", function () {
            $state.isPatientSearch = true;
            createController();
            scope.discardChanges('alert');
            expect($location.path).toHaveBeenCalledWith('/default/patient/search');
        });

        it("should call saveFormDraftIfDirty before navigating when it is set", function () {
            $state.isPatientSearch = false;
            $state.newPatientUuid = 'patient-uuid';
            var deferred = $q.defer();
            $state.saveFormDraftIfDirty = jasmine.createSpy('saveFormDraftIfDirty').and.returnValue(deferred.promise);

            createController();
            scope.discardChanges('alert');

            expect($state.saveFormDraftIfDirty).toHaveBeenCalled();
            expect($location.path).not.toHaveBeenCalled();

            deferred.resolve();
            rootScope.$apply();

            expect($location.path).toHaveBeenCalledWith('/default/patient/patient-uuid/dashboard');
        });

        it("should navigate even when saveFormDraftIfDirty rejects", function () {
            $state.isPatientSearch = false;
            $state.newPatientUuid = 'patient-uuid';
            var deferred = $q.defer();
            $state.saveFormDraftIfDirty = jasmine.createSpy('saveFormDraftIfDirty').and.returnValue(deferred.promise);

            createController();
            scope.discardChanges('alert');

            deferred.reject();
            rootScope.$apply();

            expect($location.path).toHaveBeenCalledWith('/default/patient/patient-uuid/dashboard');
        });

        it("should set discardChanges on $state and hide the message", function () {
            $state.isPatientSearch = true;
            createController();
            scope.discardChanges('alert');
            expect($state.discardChanges).toBe(true);
            expect(messagingService.hideMessages).toHaveBeenCalledWith('alert');
        });
    });

    describe("$stateChangeSuccess listener", function () {
        it("should reset $state.discardChanges to false on successful state change", function () {
            createController();
            $state.discardChanges = true;
            scope.$broadcast('$stateChangeSuccess');
            expect($state.discardChanges).toBe(false);
        });

        it("should reset $state.discardChanges so popup appears again on subsequent navigation", function () {
            $state.isPatientSearch = true;
            createController();

            scope.discardChanges('alert');
            expect($state.discardChanges).toBe(true);

            scope.$broadcast('$stateChangeSuccess');
            expect($state.discardChanges).toBe(false);
        });
    });
});
