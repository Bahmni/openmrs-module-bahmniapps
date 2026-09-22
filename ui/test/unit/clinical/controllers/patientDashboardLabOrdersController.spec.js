/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

describe("PatientDashboardLabOrdersController", function () {

    beforeEach(module('bahmni.clinical'));
    beforeEach(module(function ($provide) {
        $provide.value('formDraftService', jasmine.createSpyObj('formDraftService', ['getDraft', 'saveDraft', 'markDraftAsSaved']));
    }));

    var scope;
    var stateParams;
    var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
    var labResultSection = {
        "title": "Lab Results",
        "type": "labOrders",
        "dashboardConfig": {
            "title": null,
            "showChart": false,
            "showTable": true,
            "showNormalValues": true,
            "showCommentsExpanded": true,
            "showAccessionNotes": true
        }
    };
    var controller;

    beforeEach(inject(function ($controller, $rootScope) {
        controller = $controller;
        scope = $rootScope.$new();
        spinner.forPromise.and.callFake(function () {
            return {}
        });
        stateParams = {
            patientUuid: "some uuid"
        };
    }));

    describe("when initialized", function () {
        it("creates configuration for displaying lab order display parameters", function () {
            scope.dashboard = Bahmni.Common.DisplayControl.Dashboard.create({
                "dashboardName": "General",
                "sections": [labResultSection]
            });
            controller('PatientDashboardLabOrdersController', {
                $scope: scope,
                $stateParams: stateParams,
                spinner: spinner
            });
            var params = scope.dashboardConfig;
            expect(params.patientUuid).toBe("some uuid");
            expect(params.showNormalValues).toBe(labResultSection.dashboardConfig.showNormalValues);
        });

        it("passes in just the patient uuid when no parameters specified", function () {
            scope.dashboard = Bahmni.Common.DisplayControl.Dashboard.create({
                "dashboardName": "General",
                "sections": []
            });
            controller('PatientDashboardLabOrdersController', {
                $scope: scope,
                $stateParams: stateParams
            });

            var params = scope.dashboardConfig;
            expect(params.patientUuid).toBe("some uuid");
        });

    });
});