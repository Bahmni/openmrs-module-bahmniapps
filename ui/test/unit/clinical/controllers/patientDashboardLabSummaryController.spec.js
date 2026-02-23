/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

describe("PatientDashboardLabSummaryController", function () {

    beforeEach(module('bahmni.clinical'));

    var scope;
    var stateParams;

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        scope.ngDialogData = {
            expandedViewConfig: {a: 1, b: 2},
            patient: {uuid: "some uuid"}
        }
        stateParams = {
            patientUuid: "some uuid"
        };
        $controller('PatientDashboardLabSummaryController', {
            $scope: scope,
            $stateParams: stateParams,
        });
    }));

    it("should initialize", function () {
        expect(scope.expandedViewConfig).toEqual({a: 1, b: 2, patientUuid: "some uuid"});
        expect(scope.patient).toEqual({uuid: "some uuid"});
    });
});