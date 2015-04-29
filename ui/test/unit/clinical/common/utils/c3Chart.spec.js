'use strict';

describe('c3Chart', function () {

    it('should build the config map and call the c3 generate method', function () {
        window.c3 = jasmine.createSpyObj('c3',['generate']);
        var bindToElement = jasmine.createSpyObj('element', ['']);
        var graphWidth = 800;
        var config  = {yAxisConcepts: ['height'], xAxisConcepts: ['weight']};
        var data = [];

        Bahmni.Graph.c3Chart(bindToElement, graphWidth, config, data);

        expect(c3.generate).toHaveBeenCalled();
    });

});