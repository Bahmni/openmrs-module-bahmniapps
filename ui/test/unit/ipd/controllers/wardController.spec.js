'use strict';

describe('WardController', function() {

    var controller;
    var rootScope;
    var scope;
    var stateParams = {patientUuid: "patientUuid", visitUuid: "visitUuid"};
    var beds = [
        {bedId: 1,
            bedNumber: "I1",
            bedType: {description: "This is the ICU bed type",
                displayName: "ICU Bed",
                id: 102,
                name: "ICU Bed"},
            columnNumber: 1,
            rowNumber: 1,
            status: "OCCUPIED"
        },
        {bedId: 2,
            bedNumber: "I2",
            bedType: {description: "This is another bed type",
                displayName: "ICU Bed",
                id: 103,
                name: "ICU Bed"},
            columnNumber: 2,
            rowNumber: 2,
            status: "AVAILABLE"
        }];

    var room1 = {name: "room1", beds: beds};

    beforeEach(function() {
        module('bahmni.ipd');
    });

    var initController = function (rootScope, stateParams) {
        controller('WardController', {
            $scope: scope,
            $rootScope: rootScope,
            $stateParams: stateParams
        });
    };

    beforeEach(function() {
        inject(function($controller, $rootScope) {
            controller = $controller;
            rootScope = $rootScope;
            scope = $rootScope.$new();
            scope.ward = {rooms: [room1]};
            rootScope.bedDetails = {physicalLocationName: "room1"};
            spyOn(scope, '$emit');
        });
    });

    it('should initialize room info based the selected room', function() {
        initController(rootScope, stateParams);
        scope.onSelectRoom("room1");
        expect(scope.room).toBe(room1);
        expect(scope.roomSelected).toBeTruthy();
        expect(scope.$emit).toHaveBeenCalledWith("event:roomSelected", "room1");
    });

    it('should initialize room info, if the patient is already admitted having bedDetails on the rootScope', function() {
        rootScope.bedDetails = {physicalLocationName: "room1"};
        initController(rootScope, stateParams);
        expect(scope.room).toBe(room1);
        expect(scope.roomSelected).toBeTruthy();
        expect(scope.$emit).toHaveBeenCalledWith("event:roomSelectedAuto", "room1");
    });

    it('should initialize room info, if the patient is already admitted having bedDetails on the rootScope', function() {
        stateParams.context = {roomName: "room1"};
        initController(rootScope, stateParams);
        expect(scope.room).toBe(room1);
        expect(scope.roomSelected).toBeTruthy();
        expect(scope.$emit).toHaveBeenCalledWith("event:roomSelectedAuto", "room1");
    });

    it('should set roomSelected to be false when department is changed', function () {
        scope.$emit("event:departmentChanged");
        expect(scope.roomSelected).toBeFalsy();
    });


});