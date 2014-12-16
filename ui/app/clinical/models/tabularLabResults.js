'use strict';

Bahmni.Clinical.TabularLabResults = (function () {
    var DateUtil = Bahmni.Common.Util.DateUtil;
    var TabularLabResults = function (startDate, endDate, orderables, visitDays) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.visitDays = visitDays;
        this.orderables = orderables;

        this.getDays = function () {
            return this.visitDays;
        };

        this.getOrderables = function () {
            return this.orderables;
        };

        this.hasOrderables = function () {
            return this.orderables.length > 0;
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
            panel.tests = sortedConceptSet.sort(panel.tests);
            panel.tests.forEach(function(test) { test.belongsToPanel = true; });
            testsBelongingToThisPanel.forEach(function(test){ _.pull(topLevelTests, test); })
        });
        var uniqueTests = getUniqueTests(topLevelTests);
        var allOrderables = uniqueTests.concat(uniquePanels);
        return sortedConceptSet.sort(allOrderables);
    };

    var sortResultsInOrderables = function(orderables){
        orderables.forEach(function(orderable){
            if(!orderable.concept.set){
                orderable.results = _.sortBy(orderable.results, function(result){
                    return result.orderDate;
                });
            }else{
                orderable.tests.forEach(function(test){
                    test.results = _.sortBy(test.results, function(result){
                        return result.orderDate;
                    });
                });
            }
        });
        return orderables;
    };

    TabularLabResults.create = function (labOrders, startDate, endDate, allTestsAndPanelsConceptSet) {
        var sortedConceptSet = new Bahmni.Clinical.ConceptWeightBasedSorter(allTestsAndPanelsConceptSet);
        var orderables = getOrderables(labOrders, sortedConceptSet);
        var visitDays = DateUtil.createDays(startDate, endDate);
        var flatOrderables = flattenOrderables(orderables);
        var sortedOrderables = sortResultsInOrderables(flatOrderables);
        return new TabularLabResults(startDate, endDate, sortedOrderables, visitDays);
    };

    return TabularLabResults;
})();