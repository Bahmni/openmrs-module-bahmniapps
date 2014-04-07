'use strict';

//Top level object per test order
Bahmni.Clinical.TestOrder = (function () {
    var TestOrder = function (options) {
        options = options || {};
        var self = this;
        self.name = options.name;
        self.result = options.result;
        self.orderDate = options.orderDate;
        self.ordererComment = options.ordererComment;
        self.fulfillerComment = options.fulfillerComment;
        self.isPanel = function () {
            return self.result instanceof Bahmni.Clinical.Panel;
        };
    };

    var createResult = function (observationList) {
        var isPanel, panelList = [], result,
            depth = function (obs) {
                var result = 0, temp = obs;
                while (temp.groupMembers.length > 0) {
                    result++;
                    temp = temp.groupMembers[0];
                }
                return result;
            };
        if (observationList.length === 0) return null;

        isPanel = depth(observationList[0]) === 3;
        if (isPanel) {
            observationList.forEach(function (observation) {
                panelList.push(Bahmni.Clinical.Panel.create(observation));
            });
            result = Bahmni.Clinical.Panel.merge(panelList);
        } else {
            result = Bahmni.Clinical.Results.create(observationList[0]);
        }

        return result;
    };

    TestOrder.create = function (orderGroupWithObs) {
        return new Bahmni.Clinical.TestOrder({
            name: orderGroupWithObs.concept.name,
            result: createResult(orderGroupWithObs.obs) || new Bahmni.Clinical.Results({name: orderGroupWithObs.concept.name}),
            orderDate: orderGroupWithObs.dateCreated,
            ordererComment: "",
            fulfillerComment: ""
        });
    };

    return TestOrder;
})();