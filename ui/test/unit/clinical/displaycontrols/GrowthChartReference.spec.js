'use strict';

describe('GrowthChartReference', function () {

    it('Should convert the given array reference data to observation graph model based on the given gender', function () {
        var referenceChartValues =
            'Gender,Age,3rd,10th\n\
M,1,2.3,2.7\n\
M,2,2.9,3.2\n\
F,1,6.9,13.2';

        var growthChartReference = Bahmni.Clinical.GrowthChartReference.create("M", 10, referenceChartValues);
        var referenceValuesAsObsGraphModel = growthChartReference.getAsObsGraphModel();

        expect(referenceValuesAsObsGraphModel).toEqual([
            {
                name: '3rd',
                units: 'Kg',
                reference: true,
                values: [{"3rd": '2.3', Age: '1'}, {"3rd": '2.9', Age: '2'}]
            },
            {
                name: '10th',
                units: 'Kg',
                reference: true,
                values: [{"10th": '2.7', Age: '1'}, {"10th": '3.2', Age: '2'}]
            }
        ]);

    });

    it('Should get only the data till the specified maximum number of months for the given gender', function () {
        var referenceChartValues = 
            'Gender,Age,3rd,10th\n\
M,1,2.3,2.7\n\
F,2,2.5,3.21\n\
M,20,2.9,3.2\n\
F,21,3.0,3.25';
        var growthChartReference = Bahmni.Clinical.GrowthChartReference.create("F", 10, referenceChartValues);
        var referenceValuesAsObsGraphModel = growthChartReference.getAsObsGraphModel();

        expect(referenceValuesAsObsGraphModel).toEqual([
            {
                name: '3rd',
                units: 'Kg',
                reference: true,
                values: [{"3rd": '2.5', Age: '2'}]
            },
            {
                name: '10th',
                units: 'Kg',
                reference: true,
                values: [{"10th": '3.21', Age: '2'}]
            }
        ]);

    });

});