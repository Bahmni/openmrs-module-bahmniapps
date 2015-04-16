"use strict";

var Bahmni = Bahmni || {};
Bahmni.Graph = Bahmni.Graph || {};

(function () {

    var dateUtil = Bahmni.Common.Util.DateUtil;

    Bahmni.Graph.observationGraphConfig = function (bindTo, graphWidth, config, data) {
        var type = 'indexed', unit = "";

        if (config.xAxisConcept == "observationDateTime") {
            type = 'timeseries';
        }

        if (config.xAxisConcept == "age") {
            unit = " (years)";
        }

        return {
            bindto: bindTo,
            size: {
                width: graphWidth
            },
            padding: {
                top: 20,
                right: 30
            },
            data: {
                json: data,
                keys: {
                    x: config.xAxisConcept,
                    value: config.yAxisConcepts
                }
            },
            point: {
                show: true,
                r: 5
            },
            line: {
                connectNull: true
            },
            axis: {
                x: {
                    label: {
                        text: config.xAxisConcept + unit,
                        position: 'outer-right'
                    },
                    type: type,
                    tick: {
                        fit : true,
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
                },
                y: {
                    label: {
                        text: 'Observations',
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
                    max: config.maxYAxisRange
                }
            },
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
    }
})();
