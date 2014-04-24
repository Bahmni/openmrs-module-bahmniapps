'use strict';

//Top level object per test order
Bahmni.Clinical.TestOrder = (function () {
    var TestOrder = function (options) {
        angular.extend(this, options);
        self.isPanel = this.result instanceof Bahmni.Clinical.Panel;
    };

    var createResult = function (observations, allTestAndPanels) {
        if (observations.length === 0) return null;
        var allTestsPanelsConcept = new Bahmni.Clinical.AllTestsPanelsConcept(allTestAndPanels)
        if (isPanel(observations[0])) {
            var panels = allTestsPanelsConcept.sort(observations.map(Bahmni.Clinical.Panel.create));
            return Bahmni.Clinical.Panel.merge(panels);
        } else {
            return Bahmni.Clinical.Results.create(observations[0]);
        }
    };

    TestOrder.prototype.getDisplayList = function () {
        var self = this;
        var resultDisplayList = this.result.getDisplayList();
        resultDisplayList.forEach(function(item) { item.orderDate = self.orderDate; });
        return resultDisplayList;
    };

    TestOrder.create = function (orderGroupWithObs, allTestAndPanels) {
        return new Bahmni.Clinical.TestOrder({
            concept: orderGroupWithObs.concept,
            result: createResult(orderGroupWithObs.obs, allTestAndPanels) || new Bahmni.Clinical.Results({concept: orderGroupWithObs.concept}),
            orderDate: orderGroupWithObs.dateCreated
        });
    };

    var isPanel = function(observation) {
        return depth(observation) === 3;
    }

    var depth = function (obs) {
        var result = 0, temp = obs;
        while (temp.groupMembers.length > 0) {
            result++;
            temp = temp.groupMembers[0];
        }
        return result;
    };
    return TestOrder;
})();