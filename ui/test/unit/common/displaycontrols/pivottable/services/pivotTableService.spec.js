/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

describe("PivotTableService", function () {
    var diseaseSummaryConfig, _$http;

    beforeEach(module('bahmni.common.displaycontrol.pivottable'));
    beforeEach(module('bahmni.common.appFramework'));

    beforeEach(module(function () {
        diseaseSummaryConfig = {
            "numberOfVisits": 1,
            "obsConcepts": [],
            "drugConcepts": [],
            "labConcepts": [],
            "groupBy": "encounters",
            "startDate": "startDate",
            "endDate": "endDate"
        };
        _$http = jasmine.createSpyObj('$http', ['get', 'post']);

    }));

    beforeEach(module(function ($provide) {
        $provide.value('diseaseSummaryConfig', diseaseSummaryConfig);
        $provide.value('$http', _$http);
        $provide.value('$q', Q);
    }));

    beforeEach(inject(['pivotTableService', function (pivotTableService) {
        this.pivotTableService = pivotTableService;
    }]));

    describe("disease summary", function () {
        it('should fetch disease summary for a patient for a diseaseTemplate', function (done) {
            _$http.get.and.callFake(function () {
                return specUtil.respondWith(diseaseSummary);
            });

            this.pivotTableService.getPivotTableFor("patientuuid", diseaseSummaryConfig).then(function (response) {
                expect(response).toBe(diseaseSummary);
                done();
            });
        });

    });

    var diseaseSummary = [
        {
            "2014-09-11 05:30": {"weight": 30},
            "2014-09-11 06:30": {"weight": 35}
        }
    ];
});