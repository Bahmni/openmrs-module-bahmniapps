/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

describe('HeaderController', function() {

    var controller, rootScope, scope, state;
    
    beforeEach(function() {
        module('bahmni.ipd');
    });

    beforeEach(function() {
        inject(function($controller, $rootScope) {
            controller = $controller;
            rootScope = $rootScope;
            scope = $rootScope.$new();
        });
        state = jasmine.createSpyObj('$state',['go']);
        controller('HeaderController', {
            $scope: scope,
            $rootScope: rootScope,
            $state: state
        });
    });

    it('should change the state to admit', function() {
        scope.goToAdmitState();
        expect(state.go).toHaveBeenCalledWith('home', jasmine.any(Object));
    });

    it('should change the state to bedManagement', function() {
        scope.goToBedManagementState();
        expect(state.go).toHaveBeenCalledWith('bedManagement', jasmine.any(Object));
    });
});