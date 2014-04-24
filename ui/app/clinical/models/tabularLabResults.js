'use strict';

Bahmni.Clinical.TabularLabResults = (function () {
    var DateUtil = Bahmni.Common.Util.DateUtil;
    var TabularLabResults = function (rows, visitDays) {
        this.visitDays = visitDays;
        this.rows = rows;

        this.getDays = function () {
            return this.visitDays;
        };

        this.getRows = function () {
            return this.rows;
        };
    };

    var createVisitDays = function (startDate, endDate) {
        var startDate = DateUtil.getDate(startDate);
        var endDate = DateUtil.getDate(endDate);
        var numberOfDays = DateUtil.diffInDays(startDate, endDate);
        var days = [];
        for (var i = 0; i <= numberOfDays; i++) {
            days.push({dayNumber: i + 1, date: DateUtil.addDays(startDate, i)});
        }
        return days;
    };


    var createTable = function (testOrders, visitDays) {
        var results = {};
        var resultProperties = {};
        visitDays.forEach(function (day) {
            testOrders.forEach(function (item) {
                if(item.name == null) return;
                results[item.name] = results[item.name] || {};
                resultProperties[item.name] = resultProperties[item.name] || {};
                resultProperties[item.name]["isSummary"] = item.isSummary;
                resultProperties[item.name]["hasResults"] = item.hasResults;
                resultProperties[item.name]["minNormal"] = item.minNormal;
                resultProperties[item.name]["maxNormal"] = item.maxNormal;
                resultProperties[item.name]["units"] = item.units;
                results[item.name][day.dayNumber] = results[item.name][day.dayNumber] || [];
                if (DateUtil.isSameDate(item.observationDateTime, day.date)) {
                    results[item.name][day.dayNumber].push(item);
                }
            })
        });

        return  flattenResultsToRows(results, resultProperties);
    };

    var flattenResultsToRows = function(results, resultProperties) {
        return Object.keys(results).map(function (testName) {
            var row = Object.keys(results[testName]).map(function(key) {
                return results[testName][key];
            });
            return {
                "name": testName,
                "results": row,
                "isSummary":resultProperties[testName].isSummary,
                "hasResults":resultProperties[testName].hasResults,
                "minNormal":  resultProperties[testName].minNormal,
                "maxNormal": resultProperties[testName].maxNormal,
                "units": resultProperties[testName].units
            }
        });
    };

    var filterFunction = function (aTestOrPanel, testOrder) {
        return aTestOrPanel.name.name == testOrder.name;
    };


    var sort = function (allTestsAndPanels,testOrders) {
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

        var sortedOrderList = testOrders.sort(function (firstElement, secondElement) {
            if(firstElement.isSummary && !secondElement.isSummary){
                return -1;
            }
            var indexOfFirstElement = indexOf(allTestsAndPanels, firstElement);
            var indexOfSecondElement = indexOf(allTestsAndPanels, secondElement);
            return indexOfFirstElement - indexOfSecondElement;
        });

        var sortedDisplayList = [];
        sortedOrderList.forEach(function (order) {
            sortedDisplayList = sortedDisplayList.concat(order.displayList());
        });
        return sortedDisplayList;
    };

    TabularLabResults.create = function (testOrdersArray, visitStartDate, visitEndDate,allTestsAndPanel) {
        var mergedTestOrders = sort(allTestsAndPanel,testOrdersArray);
        var visitDays = createVisitDays(visitStartDate, visitEndDate);
        var rows = createTable(mergedTestOrders, visitDays);
        return new TabularLabResults(rows, visitDays);
    };

    return TabularLabResults;
})();