/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

describe('alertOnExit Directive', function () {
    var $rootScope, $compile, $scope, exitAlertService, $state;

    beforeEach(function () {
        module('bahmni.clinical');

        exitAlertService = {
            setIsNavigating: jasmine.createSpy('setIsNavigating').and.returnValue(true),
            setDirtyConsultationForm: jasmine.createSpy('setDirtyConsultationForm').and.returnValue(true),
            showExitAlert: jasmine.createSpy('showExitAlert')
        };

        module(function ($provide) {
            $provide.value('exitAlertService', exitAlertService);
            $provide.value('$state', {
                params: { patientUuid: 'currentPatientUuid' },
                dirtyConsultationForm: true
            });
        });

        inject(function (_$rootScope_, _$compile_, _$state_) {
            $rootScope = _$rootScope_;
            $compile = _$compile_;
            $state = _$state_;
            $scope = $rootScope.$new();
        });
    });

    it('should call exitAlertService methods with correct arguments on $stateChangeStart', function () {
        var element = angular.element('<div alert-on-exit></div>');
        $compile(element)($scope);
        $scope.$digest();

        var next = { url: '/patient/search', spinnerToken: 'spinner' };
        var current = { patientUuid: 'previousPatientUuid' };
        var event = $rootScope.$broadcast('$stateChangeStart', next, current);

        expect(exitAlertService.setIsNavigating).toHaveBeenCalledWith(next, 'currentPatientUuid', 'previousPatientUuid');
        expect(exitAlertService.showExitAlert).toHaveBeenCalledWith(true, true, event, 'spinner');
    });

    it('should not show popup after main save when navigating away', function () {
        exitAlertService.setIsNavigating.and.returnValue(false);
        var element = angular.element('<div alert-on-exit></div>');
        $compile(element)($scope);
        $scope.$digest();

        $state.justSaved = true;
        $state.dirtyConsultationForm = true;

        var next = { url: '/other/page', spinnerToken: 'spinner' };
        var current = { patientUuid: 'currentPatientUuid' };
        var event = $rootScope.$broadcast('$stateChangeStart', next, current);

        expect($state.dirtyConsultationForm).toBe(false);
    });

    it('should reset justSaved flag when navigating to a different patient after save', function () {
        var element = angular.element('<div alert-on-exit></div>');
        $compile(element)($scope);
        $scope.$digest();

        $state.justSaved = true;
        $state.dirtyConsultationForm = true;

        var next = { url: '/patient/123/page', spinnerToken: 'spinner' };
        var current = { patientUuid: 'differentPatientUuid' };
        $state.params.patientUuid = 'currentPatientUuid';

        var event = $rootScope.$broadcast('$stateChangeStart', next, current);

        expect($state.justSaved).toBe(false);
    });

    describe('Popup After Main Save Scenario', function () {
        var element;

        beforeEach(function () {
            element = angular.element('<div alert-on-exit></div>');
            $compile(element)($scope);
            $scope.$digest();
        });

        it('should not show popup when navigating after successful main save with no new changes', function () {
            exitAlertService.setIsNavigating.and.returnValue(false);
            $state.justSaved = true;
            $state.dirtyConsultationForm = true;

            var next = { url: '/other/page', spinnerToken: 'spinner' };
            var current = { patientUuid: 'currentPatientUuid' };
            var event = $rootScope.$broadcast('$stateChangeStart', next, current);

            expect($state.dirtyConsultationForm).toBe(false);
            expect(exitAlertService.showExitAlert).toHaveBeenCalledWith(false, false, event, 'spinner');
        });

        it('should suppress popup when form refreshes during post-save window', function () {
            $state.justSaved = true;
            $state.dirtyConsultationForm = true;
            var next = { url: '/patient/search', spinnerToken: 'spinner' };
            var current = { patientUuid: 'currentPatientUuid' };

            var event = $rootScope.$broadcast('$stateChangeStart', next, current);

            expect($state.dirtyConsultationForm).toBe(false);
            expect(exitAlertService.showExitAlert).toHaveBeenCalledWith(true, false, event, 'spinner');
        });

        it('should show popup when user makes new edits after save', function () {
            exitAlertService.setIsNavigating.and.returnValue(true);
            $state.justSaved = false; // justSaved was reset when new edits detected
            $state.dirtyConsultationForm = true;

            var next = { url: '/patient/search', spinnerToken: 'spinner' };
            var current = { patientUuid: 'currentPatientUuid' };
            var event = $rootScope.$broadcast('$stateChangeStart', next, current);

            expect($state.dirtyConsultationForm).toBe(true);
            expect(exitAlertService.showExitAlert).toHaveBeenCalledWith(true, true, event, 'spinner');
        });

        it('should clear justSaved flag when navigating between patients after save', function () {
            $state.justSaved = true;
            $state.dirtyConsultationForm = true;
            $state.params.patientUuid = 'patientA';

            var next = { url: '/patient/patientB/page', spinnerToken: 'spinner' };
            var current = { patientUuid: 'patientB' }; // Different patient

            var event = $rootScope.$broadcast('$stateChangeStart', next, current);

            expect($state.justSaved).toBe(false);
            expect($state.dirtyConsultationForm).toBe(false);
        });

        it('should keep justSaved true when navigating within same patient after save', function () {
            $state.justSaved = true;
            $state.dirtyConsultationForm = true;
            $state.params.patientUuid = 'samePatient';

            var next = { url: '/patient/samePatient/observations', spinnerToken: 'spinner' };
            var current = { patientUuid: 'samePatient' };

            var event = $rootScope.$broadcast('$stateChangeStart', next, current);

            expect($state.justSaved).toBe(true); // Still true for same patient navigation
            expect($state.dirtyConsultationForm).toBe(false);
        });

        it('should handle rapid navigation events after save correctly', function () {
            $state.justSaved = true;
            $state.dirtyConsultationForm = true;

            var next1 = { url: '/patient/search', spinnerToken: 'spinner1' };
            var current1 = { patientUuid: 'currentPatientUuid' };
            var event1 = $rootScope.$broadcast('$stateChangeStart', next1, current1);

            expect($state.dirtyConsultationForm).toBe(false);

            $state.dirtyConsultationForm = true; // Reset for next test
            var next2 = { url: '/admin/page', spinnerToken: 'spinner2' };
            var current2 = { patientUuid: 'differentPatient' };
            var event2 = $rootScope.$broadcast('$stateChangeStart', next2, current2);

            expect($state.justSaved).toBe(false);
            expect($state.dirtyConsultationForm).toBe(false);
        });
    });
});
