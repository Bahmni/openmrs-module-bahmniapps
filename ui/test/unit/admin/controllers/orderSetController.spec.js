//'use strict';
//
//describe("OrderSetController", function () {
//
//    var scope, $state, spinner, deferred, q, orderSetService, messagingService, orderTypeInitialization, _provider;
//    beforeEach(module('bahmni.admin'));
//
//    beforeEach(module(function ($provide) {
//        _provider = $provide;
//        orderSetService = jasmine.createSpyObj('orderSetService', ['getOrderSet', 'saveOrderSet', 'getOrderSetMemberAttributeType']);
//
//        orderSetService.getOrderSet.and.callFake(function () {
//            deferred = q.defer();
//            deferred.resolve(orderSetData);
//            return deferred.promise;
//        });
//
//        orderSetService.getOrderSetMemberAttributeType.and.callFake(function () {
//            deferred = q.defer();
//            deferred.resolve(orderSetMemberAttributeTypeData);
//            return deferred.promise;
//        });
//
//        orderSetService.saveOrderSet.and.returnValue({});
//
//
//        spinner = jasmine.createSpyObj('spinner', ['forPromise']);
//        messagingService = jasmine.createSpyObj('messageService', ['showMessage']);
//
//        $provide.value('orderSetService', orderSetService);
//        $provide.value('spinner', spinner);
//        $provide.value('messagingService', messagingService);
//        $provide.value('$state', {params:{orderSetUuid: "new"}});
//        $provide.value('orderTypeInitialization',orderTypeInitialization);
//
//    }));
//
//    var orderTypeInitialization =[{uuid:"something"}];
//
//    var orderSetResult = {};
//
//
//    beforeEach(inject(function ($controller, $rootScope, $q) {
//        scope = $rootScope.$new();
//        q = $q;
//    }));
//
//    var setUp = function () {
//        inject(function ($controller, $rootScope, $q) {
//            $controller('OrderSetController', {
//                $scope: scope,
//                q: $q
//            });
//        });
//    };
//
//    var orderSetData = {
//        data:{
//            orderSetMembers:[
//                {orderType:{uuid: "some_uuid1"}, concept:{name: "concept_name1"}, sortWeight: 1},
//                {orderType:{uuid: "some_uuid2"}, concept:{name: "concept_name2"}, voided: true},
//                {orderType:{uuid: "some_uuid3"}, concept:{name: "concept_name3"}, sortWeight: 2},
//                {orderType:{uuid: "some_uuid4"}, concept:{name: "concept_name4"}, sortWeight: 3},
//                {orderType:{uuid: "some_uuid5"}, concept:{name: "concept_name5"}, sortWeight: 4},
//                {orderType:{uuid: "some_uuid6"}, concept:{name: "concept_name6"}, sortWeight: 5}
//            ]
//        }
//    };
//
//    var orderSetMemberAttributeTypeData = {
//        data:{
//            results: [
//               {
//                orderSetMemberAttributeTypeId: 1,
//                name: "primary",
//                "description": "primary drug",
//                "uuid": "123df-fd56-967fg"
//                }
//            ]
//        }
//    };
//
//    it("should add new dummy orderSetMember", function () {
//        scope.$apply(setUp);
//        scope.orderSet = {};
//        scope.orderSet.orderSetMembers = [];
//        var event = {preventDefault : function(){}};
//        scope.addOrderSetMembers(event);
//        expect(scope.orderSet.orderSetMembers.length).toBe(1);
//    });
//
//    it("should void already saved orderSetMember", function () {
//        scope.$apply(setUp);
//        scope.orderSet.orderSetMembers= [{orderSetMemberId:1}];
//        scope.removeOrderSetMember(0);
//
//        expect(scope.orderSet.orderSetMembers[0].voided).toBeTruthy();
//    });
//
//    it("should remove newly added orderSetMember", function () {
//        scope.$apply(setUp);
//
//        scope.orderSet.orderSetMembers= [{}];
//        scope.removeOrderSetMember(0);
//
//        expect(scope.orderSet.orderSetMembers.length).toBe(0);
//    });
//
//    it("should filter all voided orderSetMember", function () {
//        _provider.value('$state', {params:{orderSetUuid: "default"}});
//        scope.$apply(setUp);
//        expect(scope.orderSet.orderSetMembers.length).toBe(5);
//    });
//
//    it("should rearrange orderSetMembers when their sortWeight is Changed", function () {
//        scope.$apply(setUp);
//        scope.orderSet = orderSetData.data;
//
//        expect(scope.orderSet.orderSetMembers[0].sortWeight).toBe(1);
//        expect(scope.orderSet.orderSetMembers[2].sortWeight).toBe(2);
//
//        scope.orderSet.orderSetMembers[2].sortWeight = 4;
//        scope.rearrangeSequence(scope.orderSet, scope.orderSet.orderSetMembers[1])
//
//        expect(scope.orderSet.orderSetMembers[0].sortWeight).toBe(1);
//        expect(scope.orderSet.orderSetMembers[2].sortWeight).toBe(2);
//    });
//
//});
