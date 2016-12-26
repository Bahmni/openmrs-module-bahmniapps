'use strict';

describe('BedManagementController', function () {

    var controller;
    var rootScope, scope;
    var stateParams = {patientUuid: "patientUuid", visitUuid: "visitUuid"};
    var state = {current: {name: "bedManagementaa"}};
    var wardService = jasmine.createSpyObj('WardService', ['getWardsList', 'bedsForWard']);
    var bedManagementService = jasmine.createSpyObj('BedManagementService', ['createLayoutGrid']);
    var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
    var wardList = {
        results: [
            {
                occupiedBeds: 10,
                totalBeds: 10,
                ward: {
                    uuid: "some uuid"
                }
            },
            {
                occupiedBeds: 10,
                totalBeds: 10,
                ward: {}
            }
        ]
    };
    var bedsForWard = {
        bedLayouts: []
    };
    var patient = {};
    var patientConfig = {
        personAttributeTypes: [
            {
                answers: [],
                desciption: "name in some language",
                format: "java.lang.String",
                name: "givenNameLocal",
                sortWeight: 3,
                uuid: "7e6db4ea-e42f-11e5-8c3e-08002715d519"
            }
        ]
    };
    wardService.getWardsList.and.returnValue(specUtil.simplePromise(wardList));
    wardService.bedsForWard.and.returnValue(specUtil.simplePromise(bedsForWard));
    bedManagementService.createLayoutGrid.and.returnValue({});

    beforeEach(function () {
        module('bahmni.ipd');
    });

    beforeEach(function () {
        inject(function ($controller, $rootScope) {
            controller = $controller;
            rootScope = $rootScope;
            scope = $rootScope.$new();
            spinner.forPromise.and.callFake(function () {
                return specUtil.simplePromise({});
            });
            rootScope.encounterConfig = {};
        });
    });

    var initController = function (bedDetails) {
        rootScope.bedDetails = bedDetails;
        controller('BedManagementController', {
            $scope: scope,
            $rootScope: rootScope,
            $stateParams: stateParams,
            $state: state,
            spinner: spinner,
            WardService: wardService
        });
    };

    it('should set patient information to undefined, load all the wards and call onSelectDepartment when bedDetails present and state is bedManagement', function () {
        var bedDetails = {
            wardUuid: "some uuid",
            wardName: "some department"
        };
        initController(bedDetails);
        expect(scope.patient).toBeUndefined();
        expect(scope.wards).toBe(wardList.results);
        expect(wardService.bedsForWard).toHaveBeenCalledWith(rootScope.bedDetails.wardUuid);
    });

    it('should set patient information to undefined, load all the wards and but not call onSelectDepartment when bedDetails not present and state is bedManagement', function () {
        initController(undefined);
        expect(scope.patient).toBeUndefined();
        expect(scope.wards).toBe(wardList.results);
        expect(wardService.bedsForWard).toHaveBeenCalled();
    });
});