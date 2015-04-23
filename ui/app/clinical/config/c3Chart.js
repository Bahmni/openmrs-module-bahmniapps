"use strict";

var Bahmni = Bahmni || {};
Bahmni.Graph = Bahmni.Graph || {};

Bahmni.Graph.observationGraphConfig = function (bindTo, graphWidth, config, data) {
    var dateUtil = Bahmni.Common.Util.DateUtil;
    var xAxisFormat = function (xAxisConcept) {
        return config.displayForObservationDateTime() ? dateUtil.formatDateWithoutTime(xAxisConcept) : xAxisConcept;
    };

    var axis = {
        x: {
            label: {
                text: config.xAxisConcept + (config.unit || ''),
                position: 'outer-right'
            },
            type: config.type,
            tick: {
                fit: true,
                culling: {
                    max: 3
                },
                format: xAxisFormat
            }
        }
    }, axes = {};

    var createYAxis = function (unit) {
        return {
            label: {
                text: unit,
                position: 'outer-top'
            },
            tick: {
                culling: {
                    max: 3
                },
                format: function (y) {
                    return d3.round(y, 2);
                }
            },
            show: true
        }
    };

    var values = _(data).reduce(function (accumulator, item) {
        return accumulator.concat(item.values);
    }, []);
    var distinctUnits = _.uniq(_.pluck(data, 'units'));

    if (distinctUnits.length > 2) {
        throw new Error("Cannot display line graphs with concepts that have more than 2 units");
    }

    var createAxisAndPopulateAxes = function (axisY, unit) {
        if (!unit) return;
        axis[axisY] = createYAxis(unit);
        _.each(data, function (item) {
            if (item.units === unit) {
                axes[item.name] = axisY;
            }
        });
    };

    createAxisAndPopulateAxes('y', distinctUnits[0]);
    createAxisAndPopulateAxes('y2', distinctUnits[1]);

    return {
        bindto: bindTo,
        size: {
            width: graphWidth
        },
        padding: {
            top: 20,
            right: 70
        },
        data: {
            json: values,
            keys: {
                x: config.xAxisConcept,
                value: config.yAxisConcepts
            },
            axes: axes
        },
        point: {
            show: true,
            r: 5
        },
        line: {
            connectNull: true
        },
        axis: axis,
        tooltip: {
            grouped: false,
            format: xAxisFormat
        },
        zoom: {
            enabled: true
        }
    }
};
