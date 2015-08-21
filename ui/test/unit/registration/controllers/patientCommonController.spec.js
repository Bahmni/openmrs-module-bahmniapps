'use strict';

describe('PatientCommonController', function () {

    var $aController, $httpBackend,scope;

    beforeEach(module('bahmni.registration'));

    beforeEach(
        inject(function ($controller, _$httpBackend_,$rootScope) {
            $aController = $controller;
            $httpBackend = _$httpBackend_;
            scope = $rootScope.$new();
        })
    );

    it("should make calls for reason for death global property and concept sets", function () {
        $httpBackend.expectGET(Bahmni.Common.Constants.globalPropertyUrl);
        $httpBackend.expectGET(Bahmni.Common.Constants.conceptUrl);
    });

});