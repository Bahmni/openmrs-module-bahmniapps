(function () {
    "use strict";

    Bahmni = Bahmni || {};
    Bahmni.Clinical = Bahmni.Clinical || {};

    //var filterOutByX = function (header, rows, filterRowNames, person) {
    //    var filterRowsColumnIndices = filterRowNames.map(function (filterRowName) {
    //        return header.indexOf(filterRowName);
    //    });
    //    _.filter(rows,function(){
    //
    //    });
    //};

    Bahmni.Clinical.CsvGraphSource = function (csvString, config, person) {
        if (config.yAxisConcepts.length !== 1) {
            throw "Graph Source requires exactly one yAxisConcept";
        }

        var that = this;
        this.person = person;
        this.config = config;
        this.csvString = csvString;
        this.referenceChartValues = asMatrix(this.csvString);
        this.header = this.referenceChartValues.shift();
        this.filterRowsColumnIndices = this.config.referenceData.filterRows.map(function (filterRow) {
            return that.header.indexOf(filterRow);
        });
        this.xAxisConceptIndex = this.header.indexOf(this.config.xAxisConcept);
        this.headerIndicesToBeAvoided = this.filterRowsColumnIndices.concat([this.xAxisConceptIndex]);
        //this.referenceChartValues = filterOutByX(this.referenceChartValues,this.config.referenceData.filterRows,person);
    };

    var asMatrix = function (csvString) {
        return _.map(csvString.split("\n"), function (line) {
            return line.split(",");
        });
    };

    Bahmni.Clinical.CsvGraphSource.prototype.createValues = function (columnIndex) {
        var that = this;
        return _.map(this.referenceChartValues, function (rowOfValues) {
            var point = {};
            var yAxisConcept = that.config.yAxisConcepts[0];
            point[yAxisConcept] = rowOfValues[columnIndex];
            return point;
        });
    };

    Bahmni.Clinical.CsvGraphSource.prototype.createObservationGraphLines = function () {
        var that = this;
        var withoutHeadersThatShouldBeAvoided = function (column, index) {
            return that.headerIndicesToBeAvoided.indexOf(index) === -1;
        };

        var newObservationGraphLine = function (columnName) {
            return new Bahmni.Clinical.ObservationGraphLine({
                name: columnName,
                values: that.createValues(that.header.indexOf(columnName))
            });
        };

        return _(this.header)
            .filter(withoutHeadersThatShouldBeAvoided)
            .map(newObservationGraphLine)
            .value();
    };

    Bahmni.Clinical.CsvGraphSource.prototype.createObservationGraph = function () {
        return new Bahmni.Clinical.ObservationGraph(this.createObservationGraphLines());
    };
})();