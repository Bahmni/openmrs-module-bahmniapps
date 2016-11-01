'use strict';

Bahmni.Common.OrderSet = (function () {
    var OrderSet = function (set) {
        angular.extend(this, {
            uuid: set.uuid,
            name: set.name,
            description: set.description,
            operator: set.operator,
            orderSetMembers: set.orderSetMembers
        });
    };
    var OrderSetMember = function (member) {
        angular.extend(this, {
            uuid: member.uuid,
            orderType: {
                uuid: member.orderType.uuid
            },
            orderTemplate: new OrderTemplate(member),
            concept: {
                display: member.concept.display,
                uuid: member.concept.uuid
            },
            retired: member.retired
        });
    };

    var OrderTemplate = function (member) {
        var orderTemplate = member.orderTemplate ? JSON.parse(member.orderTemplate) : {
            drug: member.drug,
            dosingInstructions: member.dosingInstructions
        };
        angular.extend(this, orderTemplate);
    };
    var createOrderSetMember = function (orderSetMember) {
        var member = orderSetMember || {};
        member.orderType = member.orderType || {};
        member.concept = member.concept || {};
        member.drug = member.drug || {};
        member.dosingInstructions = member.dosingInstructions || {};
        return new OrderSetMember(member);
    };

    var create = function (orderSet) {
        var set = orderSet || {};
        set.orderSetMembers = _.map(set.orderSetMembers, createOrderSetMember);
        return new OrderSet(set);
    };

    return {
        create: create,
        createOrderSetMember: createOrderSetMember
    };
})();
