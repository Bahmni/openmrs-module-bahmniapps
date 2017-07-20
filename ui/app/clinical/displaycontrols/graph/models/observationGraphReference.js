(function () {
    "use strict";

    Bahmni = Bahmni || {};
    Bahmni.Clinical = Bahmni.Clinical || {};

    Bahmni.Clinical.ObservationGraphReference = function (csvString, config, gender, ageInMonths, yAxisUnit) {
        var that = this;
        var monthBuffer = 1;
        this.config = config;
        this.csvString = csvString;
        this.yAxisUnit = yAxisUnit;
        this.referenceChartValues = asMatrix(this.csvString);
        this.header = this.referenceChartValues.shift();
        this.ageColumnIndex = _.findIndex(this.header, function (columnName) {
            return columnName.toLowerCase() === Bahmni.Clinical.Constants.concepts.age.toLowerCase();
        });
        this.genderColumnIndex = _.findIndex(this.header, function (columnName) {
            return columnName.toLowerCase() === Bahmni.Clinical.Constants.gender.toLowerCase();
        });

        var maxNoOfMonths = ageInMonths + monthBuffer;
        this.referenceChartValues = _.filter(this.referenceChartValues, function (value) {
            return (value[that.genderColumnIndex] === gender) && (maxNoOfMonths === undefined || value[that.ageColumnIndex] <= maxNoOfMonths);
        });
    };

    var asMatrix = function (csvString) {
        return _.map(csvString.split("\n"), function (line) {
            return line.split(",");
        });
    };

    Bahmni.Clinical.ObservationGraphReference.prototype.createValues = function (columnName) {
        var that = this;
        return _.map(this.referenceChartValues, function (rowOfValues) {
            var point = {};
            point[columnName] = rowOfValues[that.header.indexOf(columnName)];
            point[Bahmni.Clinical.Constants.concepts.age] = rowOfValues[that.ageColumnIndex];
            return point;
        });
    };

    Bahmni.Clinical.ObservationGraphReference.prototype.createObservationGraphReferenceLines = function () {
        var that = this;
        var headersToBeExcluded = function (column, index) {
            return index === that.genderColumnIndex || index === that.ageColumnIndex;
        };

        var newObservationGraphLine = function (columnName) {
            return new Bahmni.Clinical.ObservationGraphLine({
                name: columnName,
                reference: true,
                unit: that.yAxisUnit,
                values: that.createValues(columnName)
            });
        };

        return _(this.header)
            .reject(headersToBeExcluded)
            .map(newObservationGraphLine)
            .value();
    };

    Bahmni.Clinical.ObservationGraphReference.prototype.validate = function () {
        if (this.ageColumnIndex === -1) {
            throw new Error("Age column is not defined in reference lines csv: " + this.config.getReferenceDataFileName());
        }
        if (this.genderColumnIndex === -1) {
            throw new Error("Gender column is not defined in reference lines csv: " + this.config.getReferenceDataFileName());
        }
    };
})();
