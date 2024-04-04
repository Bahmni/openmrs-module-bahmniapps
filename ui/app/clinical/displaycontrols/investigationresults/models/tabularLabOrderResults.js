'use strict';

Bahmni.Clinical.TabularLabOrderResults = (function () {
    var TabularLabOrderResults = function (tabularResult, accessionConfig, sortResultColumnsLatestFirst) {
        var self = this;
        this.tabularResult = tabularResult;

        var filterData = function (list, filteredOn) {
            var indices = _.uniq(_.map(self.tabularResult.values, filteredOn));
            return _.filter(list, function (element) {
                return _.includes(indices, element.index);
            });
        };

        var init = function () {
            if (accessionConfig && (accessionConfig.initialAccessionCount || accessionConfig.latestAccessionCount)) {
                var tabularValues = _.groupBy(self.tabularResult.values, function (value) {
                    return new Date(value.accessionDateTime);
                });

                tabularValues = _.sortBy(tabularValues, function (value) {
                    return value[0].accessionDateTime;
                });

                var initial = _.first(tabularValues, accessionConfig.initialAccessionCount || 0);
                var latest = _.last(tabularValues, accessionConfig.latestAccessionCount || 0);

                self.tabularResult.values = _.flatten(_.union(initial, latest));
                self.tabularResult.dates = filterData(self.tabularResult.dates, 'dateIndex');
                self.tabularResult.orders = filterData(self.tabularResult.orders, 'testOrderIndex');
            }
        };

        init();

        this.getDateLabels = function () {
            var dates = this.tabularResult.dates.map(function (date) {
                if (moment(date.date, "DD-MMM-YYYY", true).isValid()) {
                    date.date = moment(date.date, "DD-MMM-YYYY").toDate();
                }
                return date;
            });
            if (sortResultColumnsLatestFirst) {
                dates.sort(function (a, b) {
                    return b.date - a.date;
                });
            }
            return dates;
        };

        this.getTestOrderLabels = function () {
            var orders = this.tabularResult.orders;
            return orders;
        };

        this.hasRange = function (testOrderLabel) {
            return testOrderLabel.minNormal && testOrderLabel.maxNormal;
        };

        this.hasUnits = function (testOrderLabel) {
            return testOrderLabel.testUnitOfMeasurement != undefined && testOrderLabel.testUnitOfMeasurement != null;
        };

        this.hasOrders = function () {
            return this.tabularResult.orders.length > 0;
        };

        this.getResult = function (dateLabel, testOrderLabel) {
            var filteredResultValue = this.tabularResult.values.filter(function (value) {
                return value.dateIndex === dateLabel.index && value.testOrderIndex === testOrderLabel.index;
            });
            if (filteredResultValue.length === 0) {
                filteredResultValue = [{"result": " "}];
            }
            return filteredResultValue;
        };

        this.hasUploadedFiles = function (dateLabel, testOrderLabel) {
            return this.getResult(dateLabel, testOrderLabel).some(function (res) {
                return res.uploadedFileName;
            });
        };
    };
    return TabularLabOrderResults;
})();
