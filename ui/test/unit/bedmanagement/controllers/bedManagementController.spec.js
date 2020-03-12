'use strict';

describe('BedManagementController', function () {

    var controller;
    var rootScope, scope;
    var stateParams = {patientUuid: "patientUuid", visitUuid: "visitUuid"};
    var wardService = jasmine.createSpyObj('WardService', ['getWardsList', 'bedsForWard']);
    var visitService = jasmine.createSpyObj('visitService', ['search']);
    var bedManagementService = jasmine.createSpyObj('BedManagementService', ['createLayoutGrid']);
    var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
    var ngDialog = jasmine.createSpyObj('ngDialog', ['openConfirm', 'close']);
    var messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
    var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
    var appDescriptor = {
        getConfigValue: function (input) {
            if (input === "forwardUrl") {
                return "patientForwardUrl";
            }
        },
        formatUrl: function (url, options) {
            return "../bedmanagement/#/patient/PATIENT_UUID/visit/VISIT_UUID/dashboard";
        }
    };
    appService.getAppDescriptor.and.returnValue(appDescriptor);
    var state = jasmine.createSpyObj('$state',['go']);
    state.current =  {name: "bedManagement"};
    var wardList = {
        results: [
            {
                occupiedBeds: 1,
                totalBeds: 2,
                ward: {
                    uuid: "some uuid",
                    rooms: [
                        {beds: [], name: "ROOM1", totalBeds: 2, availableBeds: 1}
                    ]
                }
            },
            {
                occupiedBeds: 0,
                totalBeds: 10,
                ward: {}
            }
        ]
    };
    var bedsForWard = {
        data: {
            bedLayouts: [
                {
                    bedId: 1,
                    bedNumber: "I1",
                    bedType: {
                        description: "This is the ICU bed type",
                        displayName: "ICU Bed",
                        id: 102,
                        name: "ICU Bed"
                    },
                    location: "ROOM1",
                    columnNumber: 1,
                    rowNumber: 1,
                    status: "OCCUPIED"
                },
                {
                    bedId: 2,
                    bedNumber: "I2",
                    bedType: {
                        description: "This is another bed type",
                        displayName: "ICU Bed",
                        id: 103,
                        name: "ICU Bed"
                    },
                    location: "ROOM1",
                    columnNumber: 2,
                    rowNumber: 2,
                    status: "AVAILABLE"
                }
            ]
        }
    };
    var visitInfo = {
        "data": {
            "results": [{
                "uuid": "557848e4-1297-4b57-8a58-b88e2a9edf07",
                "location": {"uuid": "8f3b2b2d-e387-4e0e-aecf-f894a94f9306"}
            }, {
                "uuid": "3e554375-68d0-45e8-ac73-b75559429676",
                "location": {"uuid": "9244ce69-4e6b-4431-8ae0-49c8cbf1bd72"}
            }]
        }
    };

    wardService.getWardsList.and.returnValue(specUtil.simplePromise(wardList));
    wardService.bedsForWard.and.returnValue(specUtil.simplePromise(bedsForWard));
    visitService.search.and.returnValue(specUtil.simplePromise(visitInfo));
    bedManagementService.createLayoutGrid.and.returnValue({});

    beforeEach(function () {
        module('bahmni.ipd');
    });

    beforeEach(function () {
        inject(function ($controller, $rootScope) {
            controller = $controller;
            rootScope = $rootScope;
            scope = $rootScope.$new();
            spyOn(scope, '$broadcast');
            spinner.forPromise.and.callFake(function () {
                return specUtil.simplePromise({});
            });
            rootScope.encounterConfig = {};
        });
    });

    var initController = function (rootScope, stateParams) {
        controller('BedManagementController', {
            $scope: scope,
            $rootScope: rootScope,
            $stateParams: stateParams,
            $state: state,
            spinner: spinner,
            wardService: wardService,
            visitService: visitService,
            messagingService: messagingService,
            appService: appService,
            ngDialog: ngDialog
        });
    };

    it('should expand the department and raise an event, when stateParams have the have departmentInfo', function () {
        stateParams.context = {
            department : {
                uuid: "some uuid",
                name: "some department"
            }
        };
        initController(rootScope, stateParams);
        expect(scope.patient).toBeUndefined();
        expect(scope.wards).toBe(wardList.results);
        expect(wardService.bedsForWard).toHaveBeenCalledWith(stateParams.context.department.uuid);
        expect(rootScope.selectedBedInfo.wardUuid).toBe("some uuid");
        expect(rootScope.selectedBedInfo.wardName).toBe("some department");
        expect(scope.departmentSelected).toBeTruthy();
        expect(scope.$broadcast).toHaveBeenCalledWith("event:departmentChanged");
    });

    it('should expand the department and raise an event, with the stateParams departmentInfo and ignore the bedDetails departmentInfo', function () {
        rootScope.bedDetails = {
            wardUuid: "ward1Uuid",
            wardName: "ward 1"
        };

        stateParams.context = {
            department : {
                uuid: "some uuid",
                name: "ward 2"
            }
        };
        initController(rootScope, stateParams);
        expect(scope.patient).toBeUndefined();
        expect(scope.wards).toBe(wardList.results);
        expect(wardService.bedsForWard).toHaveBeenCalledWith(stateParams.context.department.uuid);
        expect(scope.departmentSelected).toBeTruthy();
        expect(rootScope.selectedBedInfo.wardUuid).toBe("some uuid");
        expect(rootScope.selectedBedInfo.wardName).toBe("ward 2");
        expect(scope.$broadcast).toHaveBeenCalledWith("event:departmentChanged");
    });

    it('should expand the department and raise an event, when rootScope has bedDetails i.e for admitted patients', function () {
        stateParams.context = undefined;
        rootScope.bedDetails = {
            wardUuid: "some uuid",
            wardName: "some department"
        };
        initController(rootScope, stateParams);
        expect(scope.patient).toBeUndefined();
        expect(scope.wards).toBe(wardList.results);
        expect(wardService.bedsForWard).toHaveBeenCalledWith(rootScope.bedDetails.wardUuid);
        expect(rootScope.selectedBedInfo.wardUuid).toBe("some uuid");
        expect(rootScope.selectedBedInfo.wardName).toBe("some department");
        expect(scope.departmentSelected).toBeTruthy();
        expect(scope.$broadcast).toHaveBeenCalledWith("event:departmentChanged");
    });

    it('should hide bedLayout and dont change the state if it is bedManagement, on select of the department', function () {
        scope.roomName = undefined;
        scope.bed = undefined;
        var department = {
            uuid: "some uuid",
            name: "some department"
        };
        state.current.name = "bedManagement";
        initController(rootScope, stateParams);

        scope.onSelectDepartment(department);

        expect(scope.patient).toBeUndefined();
        expect(scope.wards).toBe(wardList.results);
        expect(wardService.bedsForWard).toHaveBeenCalledWith(department.uuid);
        expect(rootScope.selectedBedInfo.wardUuid).toBe("some uuid");
        expect(rootScope.selectedBedInfo.wardName).toBe("some department");
        expect(scope.departmentSelected).toBeTruthy();
        expect(scope.$broadcast).toHaveBeenCalledWith("event:departmentChanged");
        expect(scope.roomName).toBeUndefined();
        expect(scope.bed).toBeUndefined();
    });

    it('should hide bedLayout and change the state to bedManagement, if the state is bedManagement.bed, on select of the department', function () {
        scope.roomName = undefined;
        scope.bed = undefined;
        var department = {
            uuid: "some uuid",
            name: "some department"
        };
        state.current.name = "bedManagement.bed";
        initController(rootScope, stateParams);

        scope.onSelectDepartment(department);

        expect(scope.patient).toBeUndefined();
        expect(scope.wards).toBe(wardList.results);
        expect(wardService.bedsForWard).toHaveBeenCalledWith(department.uuid);
        expect(rootScope.selectedBedInfo.wardUuid).toBe("some uuid");
        expect(rootScope.selectedBedInfo.wardName).toBe("some department");
        expect(scope.departmentSelected).toBeTruthy();
        expect(scope.$broadcast).toHaveBeenCalledWith("event:departmentChanged");
        expect(scope.roomName).toBeUndefined();
        expect(scope.bed).toBeUndefined();
        expect(state.go).toHaveBeenCalledWith("bedManagement", jasmine.any(Object));
    });

    it('Should update the total bed count on the department as well as room level', function () {
        stateParams.context = {
            department : {
                uuid: "some uuid",
                name: "some department"
            }
        };
        initController(rootScope, stateParams);
        var bed = {bedId: 1, bedNumber: 1};
        var expectedOccupiedBedsOfWardAfterBedAssignment = wardList.results[0].occupiedBeds + 1;
        var expectedAvailableBedsOfRoomAfterAssignment = wardList.results[0].ward.rooms[0].availableBeds - 1;
        scope.roomName = "ROOM1";
        scope.$emit("event:patientAssignedToBed", bed);
        expect(scope.wards).toBe(wardList.results);
        expect(scope.ward.occupiedBeds).toBe(expectedOccupiedBedsOfWardAfterBedAssignment);
        expect(scope.ward.rooms[0].availableBeds).toBe(expectedAvailableBedsOfRoomAfterAssignment);
    });

    it('Should get the visitInfo using patientUuid and goto dashboard state with patientUuid and visitUuid', function () {
        rootScope.visitLocationUuid = "8f3b2b2d-e387-4e0e-aecf-f894a94f9306";
        scope.patient = {uuid: "patientUuid"};
        state.current.name = "bedManagement.bed";
        spyOn(window, "open").and.callThrough();
        initController(rootScope, stateParams);
        scope.goToAdtPatientDashboard();

        expect(window.open).toHaveBeenCalled();
    });

    it('Should open ngDialog for updating tags for the selected bed', function () {
        initController(rootScope, stateParams);
        scope.editTagsOnTheBed();
        expect(ngDialog.openConfirm).toHaveBeenCalledWith({
            template: 'views/editTags.html',
            scope: scope,
            closeByEscape: true,
            className: "ngdialog-theme-default ng-dialog-adt-popUp"
        });
    });
});