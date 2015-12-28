'use strict';

Bahmni.Common.OrderSet = function () {
    var OrderSet = function (data) {
        angular.extend(this, data);
    };

    OrderSet.create = function (orderSet) {
        var orderSet = new OrderSet({
                orderSetId: (orderSet && orderSet.orderSetId) || undefined,
                uuid: (orderSet && orderSet.uuid) || undefined,
                name: (orderSet && orderSet.name) || undefined,
                description: (orderSet && orderSet.description) || undefined,
                operator: (orderSet && orderSet.operator) || undefined,
                orderSetMembers: (orderSet && createOrderSetMembers(orderSet.orderSetMembers)) || []
            }
        );
        return orderSet;
    };

    var createOrderSetMembers = function (orderSetMembersData) {
        var orderSetMembers = [];
        orderSetMembersData.forEach(function (orderSetMember) {
            orderSetMembers.push(Bahmni.Common.OrderSet.OrderSetMember().create(orderSetMember));
        })
        return orderSetMembers;
    }

    return OrderSet;
};

Bahmni.Common.OrderSet.OrderSetMember = function () {

    var OrderSetMember = function (data) {
        angular.extend(this, data);
    };

    OrderSetMember.create = function (orderSetMember) {
        var orderSetMember = new OrderSetMember({
            orderSetMemberId: (orderSetMember && orderSetMember.orderSetMemberId) || undefined,
            uuid: (orderSetMember && orderSetMember.uuid) || undefined,
            orderType: {
                uuid: (orderSetMember && orderSetMember.orderType && orderSetMember.orderType.uuid) || undefined
            },
            orderTemplate: (orderSetMember && orderSetMember.orderTemplate) || undefined,
            //orderTemplate: {
            //    name:undefined,
            //    form:undefined,
            //    uuid:undefined,
            //    conceptUuid: undefined,
            //    dose: undefined,
            //    doseUnits: undefined,
            //    frequency: undefined,
            //    duration: undefined,
            //    route: undefined,
            //},
            orderSetMemberAttributes: (orderSetMember && orderSetMember.orderSetMemberAttributes) || undefined,
            concept: {
                name: (orderSetMember && orderSetMember.concept && orderSetMember.concept.name.display) || null,
                uuid: (orderSetMember && orderSetMember.concept && orderSetMember.concept.uuid) || null
            },
            sortWeight: (orderSetMember && orderSetMember.sortWeight) || undefined,
            voided: (orderSetMember && orderSetMember.voided) || undefined
        });

        var buildOrderTemplate = function () {
            var orderTemplate = {};

                orderTemplate.name = undefined,
                orderTemplate.form = undefined,
                orderTemplate.uuid = undefined,
                orderTemplate.conceptUuid = undefined,
                orderTemplate.dose = undefined,
                orderTemplate.doseUnits = undefined,
                orderTemplate.frequency = undefined,
                orderTemplate.duration = undefined,
                orderTemplate.route = undefined

            return orderTemplate
        }
        return orderSetMember;
    }

    return OrderSetMember;
};
