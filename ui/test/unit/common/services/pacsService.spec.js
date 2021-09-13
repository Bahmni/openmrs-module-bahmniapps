'use strict';

describe('pacsService', function () {
    var pacsService;
    var mockHttp = jasmine.createSpyObj('$http', ['get', 'post']);

    beforeEach(function () {
        module('bahmni.common.services');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
        });

        inject(['pacsService', function (pacsServiceInjected) {
            pacsService = pacsServiceInjected;
        }]);
    });

    it('should parse accession identifier', function () {
        const identifier = {
            system: "urn:bahmni:accession",
            value: 'urn:oid:ORD-307'
        };
        const accessionNumber = pacsService.getAccessionNumber(identifier);
        expect(accessionNumber).toBe("ORD-307");
    });

    it('should not parse accession identifier if system is not matched', function () {
        const identifier = {
            system: "urn:bahmni:lab",
            value: 'urn:oid:ORD-307'
        };
        const accessionNumber = pacsService.getAccessionNumber(identifier);
        expect(accessionNumber).toBe(null);
    });
});
