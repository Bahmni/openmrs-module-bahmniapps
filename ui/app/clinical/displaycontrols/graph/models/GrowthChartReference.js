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

    Bahmni.Clinical.GrowthChartReference.create = function (gender, referenceChartValues) {
        var genderColumn = 0;
        var ageColumn = 1;
        var headerRow = 0;

        var valuesByGender = _.filter(referenceChartValues, function (value) {
            return value[genderColumn] === gender;
        });

        var observationModels = [];
        for (var col = ageColumn + 1; col < referenceChartValues[headerRow].length; col++) {
            var observationModel = {
                'name' : referenceChartValues[headerRow][col],
                'units' : 'Kg',
                'reference' : true,
                'values' : []
            };
            for(var row = 0; row < valuesByGender.length; row++) {
                var point = {};
                point[referenceChartValues[headerRow][col]] = valuesByGender[row][col];
                point["AGE"] = valuesByGender[row][ageColumn];
                observationModel.values.push(point);
                //observationModel.values.push({WEIGHT: valuesByGender[row][col], AGE: valuesByGender[row][ageColumn]});
            }
            observationModels.push(observationModel);
        }

        return new Bahmni.Clinical.GrowthChartReference(observationModels);
    };


})();