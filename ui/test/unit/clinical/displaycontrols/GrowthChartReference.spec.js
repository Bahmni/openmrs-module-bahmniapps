'use strict';

describe('GrowthChartReference', function () {

    it('Should convert the given array reference data to observation graph model based on the given gender', function () {
        var referenceChartValues = [
            ["Gender", "Age", "3rd", "10th"],
            ["M", 1, 2.3, 2.7],
            ["M", 2, 2.9, 3.2],
            ["F", 1, 6.9, 13.2]
        ];
        var growthChartReference = Bahmni.Clinical.GrowthChartReference.create("M", referenceChartValues);
        var referenceValuesAsObsGraphModel = growthChartReference.getAsObsGraphModel();

        expect(referenceValuesAsObsGraphModel).toEqual([
            {
                name: '3rd',
                units: 'Kg',
                reference: true,
                values: [{"3rd" : 2.3, AGE: 1}, {"3rd" : 2.9, AGE: 2}]
            },
            {
                name: '10th',
                units: 'Kg',
                reference: true,
                values: [{"10th" : 2.7, AGE: 1}, {"10th" : 3.2, AGE: 2}]
            }

        ]);

    });

    it('Should get only the data till the specified maximum number of months for the given gender', function() {
        var referenceChartValues = [
            ["Gender", "Age", "3rd", "10th"],
            ["M", 1, 2.3, 2.7],
            ["F", 2, 2.5, 3.21],
            ["M", 20, 2.9, 3.2],
            ["F", 21, 3.0, 3.25]
        ];
        var growthChartReference = Bahmni.Clinical.GrowthChartReference.create("F", referenceChartValues, 10);
        var referenceValuesAsObsGraphModel = growthChartReference.getAsObsGraphModel();

        expect(referenceValuesAsObsGraphModel).toEqual([
            {
                name: '3rd',
                units: 'Kg',
                reference: true,
                values: [{"3rd" : 2.5, AGE: 2}]
            },
            {
                name: '10th',
                units: 'Kg',
                reference: true,
                values: [{"10th" : 3.21, AGE: 2}]
            }
        ]);

    });

});