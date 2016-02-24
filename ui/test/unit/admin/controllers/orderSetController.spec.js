'use strict';

describe("OrderSetController", function () {

    var scope, $state, spinner, deferred, q, orderSetService, orderTypeService, messagingService, _provider;
    beforeEach(module('bahmni.admin'));
    var orderTypes = [
        {
            "uuid": "131168f4-15f5-102d-96e4-000c29c2a5d7",
            "display": "Drug Order",
            "conceptClasses": [
                {
                    "uuid": "8d490dfc-c2cc-11de-8d13-0010c6dffd0f",
                    "display": "Drug",
                    "name": "Drug"
                }
            ]
        },
        {
            "uuid": "8189b409-3f10-11e4-adec-0800271c1b75",
            "display": "Lab Order",
            "conceptClasses": [
                {
                    "uuid": "8d492026-c2cc-11de-8d13-0010c6dffd0f",
                    "display": "LabSet",
                    "name": "LabSet"
                },
                {
                    "uuid": "33a6291c-8a92-11e4-977f-0800271c1b75",
                    "display": "LabTest",
                    "name": "LabTest"
                }
            ]
        }
    ];

    beforeEach(module(function ($provide) {
        _provider = $provide;
        orderSetService = jasmine.createSpyObj('orderSetService', ['getOrderSet', 'saveOrderSet', 'getOrderSetMemberAttributeType', 'getDrugConfig']);
        orderTypeService = jasmine.createSpyObj('orderTypeService', ['loadAll']);

        orderSetService.getOrderSet.and.callFake(function () {
            deferred = q.defer();
            deferred.resolve(orderSetData);
            return deferred.promise;
        });

        orderSetService.getDrugConfig.and.callFake(function () {
            deferred = q.defer();
            deferred.resolve([]);
            return deferred.promise;
        });

        orderSetService.getOrderSetMemberAttributeType.and.callFake(function () {
            deferred = q.defer();
            deferred.resolve(orderSetMemberAttributeTypeData);
            return deferred.promise;
        });

        orderTypeService.loadAll.and.callFake(function () {
            deferred = q.defer();
            deferred.resolve(orderTypes);
            return deferred.promise;
        });

        orderSetService.saveOrderSet.and.returnValue({});


        spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        messagingService = jasmine.createSpyObj('messageService', ['showMessage']);

        $provide.value('orderSetService', orderSetService);
        $provide.value('orderTypeService', orderTypeService);
        $provide.value('spinner', spinner);
        $provide.value('messagingService', messagingService);
        $provide.value('$state', {params:{orderSetUuid: "new"}});

    }));

    var orderTypeInitialization =[{uuid:"something"}];

    var orderSetResult = {};


    beforeEach(inject(function ($controller, $rootScope, $q) {
        scope = $rootScope.$new();
        q = $q;
    }));

    var setUp = function () {
        inject(function ($controller, $rootScope, $q) {
            $controller('OrderSetController', {
                $scope: scope,
                q: $q
            });
        });
    };

    var orderSetData = {
        data:{
            orderSetMembers:[
                {orderType:{uuid: "some_uuid1"}, concept:{name: "concept_name1"}, sortWeight: 1},
                {orderType:{uuid: "some_uuid2"}, concept:{name: "concept_name2"}, voided: true},
                {orderType:{uuid: "some_uuid3"}, concept:{name: "concept_name3"}, sortWeight: 2},
                {orderType:{uuid: "some_uuid4"}, concept:{name: "concept_name4"}, sortWeight: 3},
                {orderType:{uuid: "some_uuid5"}, concept:{name: "concept_name5"}, sortWeight: 4},
                {orderType:{uuid: "some_uuid6"}, concept:{name: "concept_name6"}, sortWeight: 5}
            ]
        }
    };

    var orderSetMemberAttributeTypeData = {
        data:{
            results: [
               {
                orderSetMemberAttributeTypeId: 1,
                name: "primary",
                "description": "primary drug",
                "uuid": "123df-fd56-967fg"
                }
            ]
        }
    };

    it("should add new dummy orderSetMember", function () {
        scope.$apply(setUp);
        scope.orderSet = {};
        scope.orderSet.orderSetMembers = [];
        var event = {preventDefault : function(){}};
        scope.addOrderSetMembers(event);
        expect(scope.orderSet.orderSetMembers.length).toBe(1);
    });

    it("should void already saved orderSetMember", function () {
        scope.$apply(setUp);
        scope.orderSet.orderSetMembers= [{orderSetMemberId:1}];
        scope.removeOrderSetMember(0);

        expect(scope.orderSet.orderSetMembers[0].voided).toBeTruthy();
    });

    it("should remove newly added orderSetMember", function () {
        scope.$apply(setUp);

        scope.orderSet.orderSetMembers= [{}];
        scope.removeOrderSetMember(0);

        expect(scope.orderSet.orderSetMembers.length).toBe(0);
    });

    it("should filter all voided orderSetMember", function () {
        _provider.value('$state', {params:{orderSetUuid: "default"}});
        scope.$apply(setUp);
        expect(scope.orderSet.orderSetMembers.length).toBe(5);
    });

    //it("should rearrange orderSetMembers when their sortWeight is Changed", function () {
    //    scope.$apply(setUp);
    //    scope.orderSet = orderSetData.data;
    //
    //    expect(scope.orderSet.orderSetMembers[0].sortWeight).toBe(1);
    //    expect(scope.orderSet.orderSetMembers[2].sortWeight).toBe(2);
    //
    //    scope.orderSet.orderSetMembers[2].sortWeight = 4;
    //    scope.rearrangeSequence(scope.orderSet, scope.orderSet.orderSetMembers[1])
    //
    //    expect(scope.orderSet.orderSetMembers[0].sortWeight).toBe(1);
    //    expect(scope.orderSet.orderSetMembers[2].sortWeight).toBe(2);
    //});

});
