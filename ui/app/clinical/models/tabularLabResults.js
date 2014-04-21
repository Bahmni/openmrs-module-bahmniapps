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
    }

    var createTable = function (testOrders, visitDays) {
        var results = {};
        visitDays.forEach(function (day) {
            testOrders.forEach(function (item) {
                if(item.name == null || item.name == "") return;
                results[item.name] = results[item.name] || {};
                results[item.name][day.dayNumber] = results[item.name][day.dayNumber] || [];
                if (DateUtil.isSameDate(item.observationDateTime, day.date)) {
                    results[item.name][day.dayNumber].push(item);
                }
            })
        });

        return flattenResultsToRows(results);
    }

    var flattenResultsToRows = function(results) {
        return Object.keys(results).map(function (testName) {
            var row = Object.keys(results[testName]).map(function(key) {
                return results[testName][key];
            });
            return {"testName": testName, "results": row}
        });
    }

    TabularLabResults.create = function (testOrders, visitStartDate, visitEndDate) {
        var visitDays = createVisitDays(visitStartDate, visitEndDate);
        var rows = createTable(testOrders, visitDays);
        return new TabularLabResults(rows, visitDays);
    };

    return TabularLabResults;
})();