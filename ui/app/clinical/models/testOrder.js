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

    var sort = function (allTestsAndPanels, panelList, filterFunction) {
        var indexOf = function (allTestAndPanels, order) {
            var indexCount = 0;
            allTestAndPanels.setMembers && allTestAndPanels.setMembers.every(function (aTestOrPanel) {
                if (filterFunction(aTestOrPanel, order))
                    return false;
                else {
                    indexCount++;
                    return true;
                }
            });
            return indexCount;
        };

        panelList.forEach(function (aPanel) {
            aPanel.results.sort(function (firstElement, secondElement) {
                var indexOfFirstElement = indexOf(allTestsAndPanels, firstElement);
                var indexOfSecondElement = indexOf(allTestsAndPanels, secondElement);
                return indexOfFirstElement - indexOfSecondElement;
            });
        });
        return panelList;
    };

    var filterFunction = function (aTestOrPanel, aPanelResult) {
        return aTestOrPanel.name.name == aPanelResult.name;
    };

    var createResult = function (observationList, allTestAndPanels) {
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


            panelList = allTestAndPanels ? sort(allTestAndPanels, panelList, filterFunction) : panelList;

            result = Bahmni.Clinical.Panel.merge(panelList);
        } else {
            result = Bahmni.Clinical.Results.create(observationList[0]);
        }

        return result;
    };

    TestOrder.prototype.displayList = function () {
        var resultDisplayList = this.result.displayList();
        var thisOrderDate = this.orderDate;
        resultDisplayList.forEach(function(item) {
            item.orderDate = thisOrderDate;
        });
        return resultDisplayList;
    };

    TestOrder.create = function (orderGroupWithObs, allTestAndPanels) {
        return new Bahmni.Clinical.TestOrder({
            name: orderGroupWithObs.concept.name,
            result: createResult(orderGroupWithObs.obs, allTestAndPanels) || new Bahmni.Clinical.Results({name: orderGroupWithObs.concept.name}),
            orderDate: orderGroupWithObs.dateCreated,
            ordererComment: "",
            fulfillerComment: ""
        });
    };

    return TestOrder;
})();