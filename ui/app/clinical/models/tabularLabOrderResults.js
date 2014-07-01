'use strict';

Bahmni.Clinical.TabularLabOrderResults = (function () {
    var DateUtil = Bahmni.Common.Util.DateUtil;
    var TabularLabOrderResults = function (tabularResult) {
        this.tabularResult = tabularResult;
        this.getDateLabels = function () {
            return this.tabularResult.dates;
        };

        this.getTestOrderLabels = function () {
            return this.tabularResult.orders;
        };

        this.hasRange = function(testOrderLabel) {
            return testOrderLabel.minNormal && testOrderLabel.maxNormal;
        };

        this.hasValues = function() {
            return this.tabularResult.values.length > 0;
        }

        this.getResult = function(dateLabel, testOrderLabel) {
            return this.tabularResult.values.filter(function(value) {
                return value.dateIndex == dateLabel.index && value.testOrderIndex == testOrderLabel.index;
            })
        };
    };

    return TabularLabOrderResults;
})();