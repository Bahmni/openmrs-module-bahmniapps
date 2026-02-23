/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

describe('patientAttributeService', function () {

    var resultList = {"results": ["result1", "result2", "result3", "result4"]};
    var $http,
        mockHttp = {defaults: {headers: {common: {'X-Requested-With': 'present'}} },
            get: jasmine.createSpy('Http get').and.returnValue(resultList)
        };

    beforeEach(module('bahmni.registration'));
    beforeEach(module(function ($provide) {
        $provide.value('$http', mockHttp);
        $provide.value('$q', {});
    }));

    describe("search", function () {

        it('Should get unique list of family names', inject(['patientAttributeService', function (patientAttributeService) {
            var key = "familyName";
            var query = "res";

            var results = patientAttributeService.search(key, query, 'personName');

            expect(mockHttp.get).toHaveBeenCalled();
            expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.bahmniSearchUrl + "/personname");
            expect(mockHttp.get.calls.mostRecent().args[1].params.q).toBe(query);
            expect(mockHttp.get.calls.mostRecent().args[1].params.key).toBe(key);
            expect(results).toBe(resultList);
        }]));

        it('Should get unique list of caste', inject(['patientAttributeService', function (patientAttributeService) {
            var key = "caste";
            var query = "res";

            var results = patientAttributeService.search(key, query, 'personAttribute');

            expect(mockHttp.get).toHaveBeenCalled();
            expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.bahmniSearchUrl + "/personattribute");
            expect(mockHttp.get.calls.mostRecent().args[1].params.q).toBe(query);
            expect(mockHttp.get.calls.mostRecent().args[1].params.key).toBe(key);
            expect(results).toBe(resultList);
        }]))

        it('Should trim leading whitespaces', inject(['patientAttributeService', function (patientAttributeService) {
            var key = "caste";
            var query = "       res        ";

            var results = patientAttributeService.search(key, query, 'personAttribute');

            expect(mockHttp.get).toHaveBeenCalled();
            expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.bahmniSearchUrl + "/personattribute");
            expect(mockHttp.get.calls.mostRecent().args[1].params.q).toBe(query.trimLeft());
            expect(mockHttp.get.calls.mostRecent().args[1].params.key).toBe(key);
            expect(results).toBe(resultList);
        }]))
    });
});