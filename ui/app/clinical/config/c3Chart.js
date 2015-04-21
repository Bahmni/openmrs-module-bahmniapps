"use strict";

var Bahmni = Bahmni || {};
Bahmni.Graph = Bahmni.Graph || {};

Bahmni.Graph.observationGraphConfig = function (bindTo, graphWidth, config, data) {
    var dateUtil = Bahmni.Common.Util.DateUtil;
    var type = 'indexed', unit = "";
    if (config.xAxisConcept == "observationDateTime") {
        type = 'timeseries';
    }

    if (config.xAxisConcept == "age") {
        unit = " (years)";
    }

    var axis = {
        x: {
            label: {
                text: config.xAxisConcept + unit,
                position: 'outer-right'
            },
            type: type,
            tick: {
                fit: true,
                culling: {
                    max: 3
                },
                format: function (x) {
                    if (config.xAxisConcept == "observationDateTime") {
                        return dateUtil.formatDateWithoutTime(x);
                    } else {
                        return x;
                    }
                }
            },
            min: config.minXAxisRange,
            max: config.maxXAxisRange
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
            min: config.minYAxisRange,
            max: config.maxYAxisRange,
            show: true
        }
    };

    var values = _(data).reduce(function (accumulator, item) {
        return accumulator.concat(item.values);
    }, []);
    var distinctUnits = _(data).unique(function (item) {
        return item.units;
    }).pluck(function (item) {
        return item.units;
    }).value();
    if (distinctUnits.length > 2) {
        throw new Error("Cannot display line graphs with concepts that have more than 2 units");
    }

    if (distinctUnits[0]) {
        axis.y = createYAxis(distinctUnits[0]);
        data.forEach(function (item) {
            if (item.units === distinctUnits[0]) {
                axes[item.name] = 'y';
            }
        });
    }

    if (distinctUnits[1]) {
        axis.y2 = createYAxis(distinctUnits[1]);
        data.forEach(function (item) {
            if (item.units === distinctUnits[1]) {
                axes[item.name] = 'y2';
            }
        });
    }

    var title = function (x) {
        if (config.xAxisConcept == "observationDateTime") {
            return dateUtil.formatDateWithoutTime(x);
        } else {
            return x;
        }
    };
    return {
        bindto: bindTo,
        size: {
            width: graphWidth
        },
        padding: {
            top: 20,
            right: 50
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
            format: {
                title: function (x) {
                    if (config.xAxisConcept == "observationDateTime") {
                        return dateUtil.formatDateWithoutTime(x);
                    } else {
                        return x;
                    }
                }
            }
        },
        zoom: {
            enabled: true
        }
    }
};
