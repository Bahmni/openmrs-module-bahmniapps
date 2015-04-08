"use strict";

var Bahmni = Bahmni || {};
Bahmni.Graph = Bahmni.Graph || {};

(function () {

    var dateUtil = Bahmni.Common.Util.DateUtil;

    Bahmni.Graph.observationGraphConfig = function (bindTo, graphWidth, yAxisConcepts, data) {
        return {
            bindto: bindTo,
            size: {
                width: graphWidth,
                height: 500
            },
            padding: {
                top: 20,
                right: 20
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
                r: 6
            },
            line: {
                connectNull: true
            },
            axis: {
                x: {
                    label: {
                        text: 'Observation Date',
                        position: 'outer-right'
                    },
                    type: 'timeseries',
                    tick: {
                        culling: {
                            max: 3
                        },
                        format: function (x) {
                            return dateUtil.getDateWithoutTime(x);
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
                            return y.toFixed(2);
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
