'use strict';

describe('PatientCommonController', function () {

    var $aController, $httpBackend, scope, appService, rootScope, patientAttributeService;
    var spinner = jasmine.createSpyObj('spinner', ['forPromise']);

    beforeEach(module('bahmni.registration'));

    beforeEach(module(function($provide){
        $provide.value('patientAttributeService', {});
    }));

    beforeEach(
        inject(function ($controller, _$httpBackend_, $rootScope) {
            $aController = $controller;
            $httpBackend = _$httpBackend_;
            scope = $rootScope.$new();
            rootScope = $rootScope;
        })
    );



    beforeEach(function () {
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);

        rootScope.genderMap = {};

        scope.patient = {};

        appService.getAppDescriptor = function () {
            return {
                getConfigValue: function (config) {
                    return true;
                }

            };
        };

        $aController('PatientCommonController', {
            $scope: scope,
            $rootScope: rootScope,
            appService: appService
        });

        $httpBackend.whenGET(Bahmni.Common.Constants.globalPropertyUrl + '?property=concept.reasonForDeath').respond({});
        $httpBackend.when('GET', Bahmni.Common.Constants.conceptUrl).respond({});
        $httpBackend.flush();

    });


    it("should make calls for reason for death global property and concept sets", function () {
        $httpBackend.expectGET(Bahmni.Common.Constants.globalPropertyUrl);
        $httpBackend.expectGET(Bahmni.Common.Constants.conceptUrl);
    });

    it("should show caste same as last name if the configuration is set to true", function () {

        rootScope.patientConfiguration = {attributeTypes: [{name: 'Caste'}, {name: 'Class'}]};
        
        expect(scope.showCasteSameAsLastName()).toBeTruthy();
    });

    it("should show caste same as last name if the configuration is set to true irrespective of patient attribute case sensitivity", function () {
        rootScope.patientConfiguration = {attributeTypes: [{name: 'caSTe'}, {name: 'Class'}]};

        expect(scope.showCasteSameAsLastName()).toBeTruthy();
    });

    it("should not show caste same as last name if the configuration is set to true, but person attribute caste is not there", function () {
        rootScope.patientConfiguration = {attributeTypes: [{name: 'Class'}]};

        expect(scope.showCasteSameAsLastName()).toBeFalsy();
    });

    it("showBirthTime should be true by default", function () {
        expect(scope.showBirthTime).toBe(true);
    });

    it("showBirthTime should be false if set false", function () {

        appService.getAppDescriptor = function() {
            return {
                getConfigValue: function(config) {
                    if (config == "showBirthTime") {
                        return false;
                    }
                }
            };
        };

        $aController('PatientCommonController', {
            $scope: scope,
            $rootScope: rootScope,
            http: $httpBackend,
            patientAttributeService: patientAttributeService,
            spinner: spinner,
            appService: appService
        });
        expect(scope.showBirthTime).toBe(false);
    });

});