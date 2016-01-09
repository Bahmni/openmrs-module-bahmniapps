'use strict';

Bahmni.Common.OrderSet = (function () {
    var OrderSet = function (set) {
        angular.extend(this, {
            orderSetId: set.orderSetId,
            uuid: set.uuid,
            name: set.name,
            description: set.description,
            operator: set.operator,
            orderSetMembers: set.orderSetMembers
        });
    };
    var OrderSetMember = function (member) {
        angular.extend(this, {
            orderSetMemberId: member.orderSetMemberId,
            uuid: member.uuid,
            orderType: {
                uuid: member.orderType.uuid
            },
            orderTemplate: member.orderTemplate,
            orderSetMemberAttributes: member.orderSetMemberAttributes,
            concept: {
                name: member.concept.name,
                uuid: member.concept.uuid
            },
            sortWeight: member.sortWeight,
            voided: member.voided
        });
    };

    var createOrderSetMember = function (orderSetMember) {
        var member = orderSetMember || {};
        member.orderType = member.orderType || {};
        member.concept = member.concept || {};
        member.concept.name = member.concept.name && member.concept.name.display;
        return new OrderSetMember(member);
    };

    var create = function (orderSet) {
        var set = orderSet || {};
        set.orderSetMembers = _.map(set.orderSetMembers, createOrderSetMember);
        return new OrderSet(set);
    };

    return {
        create : create,
        createOrderSetMember : createOrderSetMember
    };
})();
