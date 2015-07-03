describe('Observation graph line', function () {
    'use strict';

    it("represents a line in an observation graph", function () {
        new Bahmni.Clinical.ObservationGraphLine({
            name: "Temperature",
            units: "kg",
            values: []
        });
    });

    it("allows addition of observation points after initialization", function () {
        var line = new Bahmni.Clinical.ObservationGraphLine({
            name: "Temperature",
            units: "C",
            values: []
        });
        expect(line.values.length).toBe(0);

        var observationPoint = {
            Temperature: 98,
            units: "C"
        };
        line.addPoint(observationPoint);

        expect(line.values.length).toBe(1);
        expect(line.values[0]).toBe(observationPoint);
    });
});