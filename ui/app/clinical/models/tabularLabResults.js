'use strict';

Bahmni.Clinical.TabularLabResults = (function () {
    var DateUtil = Bahmni.Common.Util.DateUtil;
    var TabularLabResults = function (orderables, visitDays) {
        this.visitDays = visitDays;
        this.orderables = orderables;

        this.getDays = function () {
            return this.visitDays;
        };

        this.getOrderables = function () {
            return this.orderables;
        };
    };

    var flattenOrderables = function(orderables){
        return orderables.reduce(function(flatOrderables, orderable){
            flatOrderables.push(orderable);
            if(orderable.concept.set){ flatOrderables.push.apply(flatOrderables, orderable.tests); }
            return flatOrderables;
        }, []);
    };

    function getUniqueTests(topLevelTests) {
        var testsGroupedByName = _.groupBy(topLevelTests, function (test) {return test.concept.name;});
        return _.map(testsGroupedByName, function (tests) {
            return new Bahmni.Clinical.Test({concept: tests[0].concept, results: _.flatten(tests, 'results')})
        });
    }

    function getUniquePanels(allPanels) {
        var panelsGroupedByName = _.groupBy(allPanels, function (panel) { return panel.concept.name });
        return _.map(panelsGroupedByName, function (panels) {
            return new Bahmni.Clinical.Panel({concept: panels[0].concept, tests: _.flatten(panels, 'tests')})
        });
    }

    var getOrderables = function(labOrders, sortedConceptSet){
        var topLevelTests = labOrders.filter(function(order) { return order.getOrderableType() === "Test"}).map(function(order) { return order.orderable; });
        var allPanels = labOrders.filter(function(order) { return order.getOrderableType() === "Panel"}).map(function(order) { return order.orderable; });
        var uniquePanels = getUniquePanels(allPanels);
        uniquePanels.forEach(function(panel){
            var testsBelongingToThisPanel = topLevelTests.filter(function(test) {
                return panel.tests.some(function(testFromPanel){ return testFromPanel.concept.name === test.concept.name });
            });
            panel.tests = getUniqueTests(panel.tests.concat(testsBelongingToThisPanel));
            sortedConceptSet.sort(panel.tests);
            panel.tests.forEach(function(test) { test.belongsToPanel = true; });
            testsBelongingToThisPanel.forEach(function(test){ _.pull(topLevelTests, test); })
        });
        var uniqueTests = getUniqueTests(topLevelTests);
        var allOrderables = uniqueTests.concat(uniquePanels);
        sortedConceptSet.sort(allOrderables);
        return  allOrderables;
    };

    TabularLabResults.create = function (labOrders, visitStartDate, visitEndDate, allTestsAndPanelsConceptSet) {
        var sortedConceptSet = new Bahmni.Clinical.SortedConceptSet(allTestsAndPanelsConceptSet);
        var orderables = getOrderables(labOrders, sortedConceptSet);
        var visitDays = DateUtil.createDays(visitStartDate, visitEndDate);
        var flatOrderables = flattenOrderables(orderables);
        return new TabularLabResults(flatOrderables, visitDays);
    };

    return TabularLabResults;
})();