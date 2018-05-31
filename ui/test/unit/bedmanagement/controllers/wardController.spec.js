'use strict';

describe('WardController', function() {

    var controller;
    var rootScope;
    var scope;
    var state;
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
    var room2 = {name: "room2", beds: []};

    state = jasmine.createSpyObj('$state',['go']);
    beforeEach(function() {
        module('bahmni.ipd');
    });

    var initController = function (rootScope, stateParams, state) {
        controller('WardController', {
            $scope: scope,
            $rootScope: rootScope,
            $stateParams: stateParams,
            $state: state
        });
    };

    beforeEach(function() {
        inject(function($controller, $rootScope) {
            controller = $controller;
            rootScope = $rootScope;
            scope = $rootScope.$new();
            scope.ward = {rooms: [room1, room2]};
            rootScope.bedDetails = {physicalLocationName: "room1"};
        });
    });

    it('should initialize room info based the selected room and not go to bedManagement state, when the state is other than bedManagement.bed', function() {
        state.current = {name: "bedManagement"};
        rootScope.selectedBedInfo = {};
        initController(rootScope, stateParams, state);
        scope.onSelectRoom("room1");
        expect(scope.room).toBe(room1);
        expect(scope.roomSelected).toBeTruthy();
        expect(rootScope.selectedBedInfo.roomName).toBe("room1");
        expect(rootScope.selectedBedInfo.bed).toBeUndefined();
        expect(scope.activeRoom).toBe("room1");
    });

    it('should initialize room info based the selected room and go to bedManagement state, when the state is bedManagement.bed', function() {
        state.current = {name: "bedManagement.bed"};
        rootScope.selectedBedInfo = {};
        initController(rootScope, stateParams, state);
        scope.onSelectRoom("room1");
        expect(scope.room).toBe(room1);
        expect(scope.roomSelected).toBeTruthy();
        expect(rootScope.selectedBedInfo.roomName).toBe("room1");
        expect(rootScope.selectedBedInfo.bed).toBeUndefined();
        expect(rootScope.activeRoom).toBeUndefined();
        expect(state.go).toHaveBeenCalledWith("bedManagement", jasmine.any(Object));
    });

    it('should initialize room info, if the patient is already admitted having bedDetails on the rootScope', function() {
        rootScope.bedDetails = {physicalLocationName: "room1"};
        rootScope.selectedBedInfo = {};
        initController(rootScope, stateParams, state);
        expect(scope.room).toBe(room1);
        expect(scope.roomSelected).toBeTruthy();
        expect(rootScope.selectedBedInfo.roomName).toBe("room1");
        expect(rootScope.selectedBedInfo.bed).toBeUndefined();
    });

    it('should initialize room info, on admitting the patient', function() {
        stateParams.context = {roomName: "room1"};
        rootScope.selectedBedInfo = {};
        initController(rootScope, stateParams, state);
        expect(scope.room).toBe(room1);
        expect(scope.roomSelected).toBeTruthy();
        expect(rootScope.selectedBedInfo.roomName).toBe("room1");
        expect(rootScope.selectedBedInfo.bed).toBeUndefined();
    });

    it('should initialize room info, with the context from the stateParams and ignore the bedDetails', function() {
        rootScope.bedDetails = {physicalLocationName: "room2"};
        stateParams.context = {roomName: "room1"};
        rootScope.selectedBedInfo = {};
        initController(rootScope, stateParams, state);
        expect(scope.room).toBe(room1);
        expect(scope.roomSelected).toBeTruthy();
        expect(rootScope.selectedBedInfo.roomName).toBe("room1");
        expect(rootScope.selectedBedInfo.bed).toBeUndefined();
    });

    it('should set roomSelected to be false when department is changed', function () {
        scope.$emit("event:departmentChanged");
        expect(scope.roomSelected).toBeFalsy();
    });


});