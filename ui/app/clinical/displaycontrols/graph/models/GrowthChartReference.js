'use strict';

(function () {
    Bahmni = Bahmni || {};
    Bahmni.Clinical = Bahmni.Clinical || {};

    Bahmni.Clinical.GrowthChartReference = function (observationModels) {
        this.observationModels = observationModels;

        this.getAsObsGraphModel = function () {
            return this.observationModels;
        };

        this.getReferenceKeys = function() {
            return _.pluck(this.observationModels, 'name');
        };
    };

    Bahmni.Clinical.GrowthChartReference.create = function (gender, ageInMonths, referenceChartCsv) {
        var genderColumn = 0;
        var ageColumn = 1;
        var headerRow = 0;
        var monthBuffer = 1;

        var referenceChartValues = [];
        _.each(referenceChartCsv.split("\n"), function(line) {
            referenceChartValues.push(line.split(","));
        });

        var maxNoOfMonths = ageInMonths + monthBuffer;
        var valuesFilteredByGenderAndMaxMonths = _.filter(referenceChartValues, function (value) {
            return (value[genderColumn] === gender) && (maxNoOfMonths === undefined || value[ageColumn] <= maxNoOfMonths);
        });

        var observationModels = [];
        for (var col = ageColumn + 1; col < referenceChartValues[headerRow].length; col++) {
            var observationModel = {
                'name' : referenceChartValues[headerRow][col],
                'units' : 'Kg',
                'reference' : true,
                'values' : []
            };
            for(var row = 0; row < valuesFilteredByGenderAndMaxMonths.length; row++) {
                var point = {};
                point[referenceChartValues[headerRow][col]] = valuesFilteredByGenderAndMaxMonths[row][col];
                point[Bahmni.Clinical.Constants.concepts.age] = valuesFilteredByGenderAndMaxMonths[row][ageColumn];
                observationModel.values.push(point);
            }
            observationModels.push(observationModel);
        }

        return new Bahmni.Clinical.GrowthChartReference(observationModels);
    };


})();