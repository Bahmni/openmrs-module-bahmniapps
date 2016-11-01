'use strict';

angular.module('bahmni.common.uicontrols.programmanagment')
    .directive('timeline', ['$timeout', function ($timeout) {
        var link = function ($scope, $element) {
            $timeout(function () {
                var dateUtil = Bahmni.Common.Util.DateUtil;
                var data = getDataModel($scope.program);
                var svg = d3.select($element[0]).select('.timeline-view').append("svg");
                var elementDimension = $element[0].getBoundingClientRect();
                var sortedDates = _.map(data.states, 'date');
                var xMin = 0;
                var xMax = elementDimension.width - 15;
                var endDate = $scope.program.dateCompleted ? dateUtil.parse($scope.program.dateCompleted) : new Date();
                var dateFormatter = d3.time.format("%_d %b%y");

                var timeScale = d3.time.scale()
                    .domain([sortedDates[0], endDate])
                    .range([xMin, xMax]);

                var states = svg.selectAll('.states').data(data.states);
                var stateGroup = states.enter().append("g").classed('states', true);
                var tooltipEl = d3.select($element[0]).select('.tool-tip');
                var showTooltip = function (d) {
                    var eventEl = this;
                    tooltipEl
                        .html(function () {
                            return dateFormatter(d.date) + " | " + d.state;
                        })
                        .style("left", function () {
                            var tooltipWidth = $(this).width();
                            var eventX = eventEl.getBBox().x;
                            var posX = (eventX + tooltipWidth > elementDimension.width) ? (elementDimension.width - tooltipWidth) : eventX;
                            return posX + "px";
                        })
                        .style("visibility", "visible");
                };
                stateGroup.append("rect").classed("label-bg", true);
                stateGroup.append("text").classed("label", true);
                stateGroup.append("rect").classed("date-bg", true);
                stateGroup.append("line").classed("date-line", true);
                stateGroup.append("text").classed("date", true);

                var stateBar = {y: 5, height: 23, textPaddingX: 6};
                var dateBar = {y: 30, height: 30, xPadding: -4, textPaddingY: 53};
                var dateTick = {y: 0, height: 40};
                states.select(".label-bg")
                    .attr('x', function (d) {
                        return timeScale(d.date);
                    })
                    .attr('y', stateBar.y)
                    .attr('height', stateBar.height)
                    .attr('width', function (d) {
                        return xMax - timeScale(d.date);
                    });
                states.select(".label")
                    .attr('x', function (d) {
                        return timeScale(d.date) + stateBar.textPaddingX;
                    })
                    .attr('y', stateBar.y + (stateBar.height * 0.7))
                    .text(function (d) {
                        return d.state;
                    });
                states.select(".date-bg")
                    .attr('x', function (d) {
                        return timeScale(d.date) + dateBar.xPadding;
                    })
                    .attr('y', dateBar.y)
                    .attr('height', dateBar.height)
                    .attr('width', xMax);
                states.select(".date-line")
                    .attr('x1', function (d) {
                        return timeScale(d.date);
                    })
                    .attr('y1', dateTick.y)
                    .attr('x2', function (d) {
                        return timeScale(d.date);
                    })
                    .attr('y2', dateTick.y + dateTick.height);
                states.select(".date")
                    .attr('x', function (d) {
                        return timeScale(d.date);
                    })
                    .attr('y', dateBar.textPaddingY)
                    .text(function (d) {
                        return dateFormatter(d.date);
                    });

                states.select(".label-bg").on("mouseenter", showTooltip);
                states.select(".label-bg").on("click", showTooltip);
                states.select(".label-bg").on("mouseout", function () {
                    tooltipEl.style("visibility", "hidden");
                });

                // Draw completed state
                if (!data.completed && !_.isEmpty(data.states)) {
                    svg.append("polygon")
                        .attr("points", (xMax + "," + stateBar.y + " " + (xMax + 12) + "," +
                        (stateBar.y + stateBar.height / 2) + " " + (xMax - 1) + "," + (stateBar.y + stateBar.height)));
                }
            }, 0);
        };

        var getActiveProgramStates = function (patientProgram) {
            return _.reject(patientProgram.states, function (st) { return st.voided; });
        };

        var getDataModel = function (program) {
            var states = _.sortBy(_.map(getActiveProgramStates(program), function (stateObject) {
                return {state: stateObject.state.concept.display, date: moment(stateObject.startDate).toDate()};
            }), 'date');
            var completed = isProgramCompleted(program);
            return {states: states, completed: completed};
        };

        var isProgramCompleted = function (program) {
            return !_.isEmpty(program.dateCompleted);
        };

        return {
            restrict: 'E',
            templateUrl: "../common/uicontrols/programmanagement/views/timeline.html",
            link: link,
            scope: {
                program: "="
            }
        };
    }]);
