'use strict';

describe("OrderSetController", function () {

    var scope, $state, spinner, deferred, q, orderSetService, messagingService, orderTypeInitialization, _provider;
    beforeEach(module('bahmni.admin'));

    beforeEach(module(function ($provide) {
        _provider = $provide;
        orderSetService = jasmine.createSpyObj('orderSetService', ['getOrderSet', 'saveOrderSet']);

        orderSetService.getOrderSet.and.callFake(function () {
            deferred = q.defer();
            deferred.resolve(orderSetData);
            return deferred.promise;
        });

        orderSetService.saveOrderSet.and.returnValue({});


        spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        messagingService = jasmine.createSpyObj('messageService', ['showMessage']);

        $provide.value('orderSetService', orderSetService);
        $provide.value('spinner', spinner);
        $provide.value('messagingService', messagingService);
        $provide.value('$state', {params:{orderSetUuid: "new"}});
        $provide.value('orderTypeInitialization',orderTypeInitialization);

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
                {orderType:{uuid: "some_uuid1"}, concept:{name: "concept_name1"}},
                {orderType:{uuid: "some_uuid2"}, concept:{name: "concept_name2"}, voided: true}
            ]
        }
    };

    it("should add new dummy orderSetMember", function () {
        scope.$apply(setUp);
        scope.orderSet = {};
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

        expect(scope.orderSet.orderSetMembers.length).toBe(1);
    });

});