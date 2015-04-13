"use strict";

var Bahmni = Bahmni || {};
Bahmni.Graph = Bahmni.Graph || {};

(function () {

    var dateUtil = Bahmni.Common.Util.DateUtil;

    Bahmni.Graph.observationGraphConfig = function (bindTo, graphWidth, yAxisConcepts, data) {
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
                    x: 'observationDateTime',
                    value: yAxisConcepts
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
                        text: 'Date',
                        position: 'outer-right'
                    },
                    type: 'timeseries',
                    tick: {
                        culling: {
                            max: 3
                        },
                        format: function (x) {
                            return dateUtil.formatDateWithoutTime(x);
                        }
                    }
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
                    }
                }
            },
            tooltip: {
                grouped: false,
                format: {
                    title: function (x) {
                        return dateUtil.formatDateWithTime(x);
                    }
                }
            }
        }
    }
})();
