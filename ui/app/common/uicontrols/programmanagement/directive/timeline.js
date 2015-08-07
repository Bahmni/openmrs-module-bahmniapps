'use strict';

angular.module('bahmni.common.uicontrols.programmanagment')
    .directive('timeline', function () {
        var link = function ($scope, $element) {
            var dateUtil = Bahmni.Common.Util.DateUtil;
            var data = getDataModel($scope.program);
            var svg = d3.select($element[0]).select('.timeline-view').append("svg");
            var elementDimensions = $element[0].getBoundingClientRect();
            var sortedDates = _.pluck(data.states, 'date');
            var uniqueStates = _.uniq(_.pluck(data.states, 'state'));
            var xMin = 25;
            var xMax = elementDimensions.width-50;
            var endDate = $scope.program.dateCompleted ? dateUtil.parse($scope.program.dateCompleted) : new Date();
            var dateFormatter = d3.time.format("%_d %b%y");

            var timeScale = d3.time.scale()
                .domain([sortedDates[0], endDate])
                .range([xMin,xMax]);

            var colors = d3.scale.category10();
            var states = svg.selectAll('.states').data(data.states);
            var stateGroup = states.enter().append("g").classed('states',true);
            var tooltipEl = d3.select($element[0]).select('.tool-tip');
            var showTooltip = function(d){
                var eventEl = this;
                tooltipEl
                    .style("left", function(){
                        return (eventEl.getBBox().x) + "px";
                    })
                    .html(function () {
                        return dateFormatter(d.date) + " | " +  d.state;
                    })
                    .style("visibility", "visible");
            };
            stateGroup.append("rect").classed("label-bg", true);
            stateGroup.append("text").classed("label", true);
            stateGroup.append("rect").classed("date-bg", true);
            stateGroup.append("line").classed("date-line", true);
            stateGroup.append("text").classed("date", true);


            var stateBar = {y: 5, height: 25, textPaddingX: 6};
            var dateBar = {y: 30, height: 30, xPadding: -4, textPaddingY: 53};
            var dateTick = {y: 32, height: 6};
            states.select(".label-bg")
                .attr('x', function(d) { return timeScale(d.date); })
                .attr('y', stateBar.y)
                .attr('height', stateBar.height)
                .attr('width', function(d) {return xMax-timeScale(d.date)})
                .style('fill', function(d) {return colors(_.indexOf(uniqueStates, d.state))});
            states.select(".label")
                .attr('x', function(d) { return timeScale(d.date) + stateBar.textPaddingX; })
                .attr('y', stateBar.y + (stateBar.height * 0.65))
                .text(function(d) { return d.state; });
            states.select(".date-bg")
                .attr('x', function(d) { return timeScale(d.date) + dateBar.xPadding; })
                .attr('y', dateBar.y)
                .attr('height', dateBar.height)
                .attr('width', xMax);
            states.select(".date-line")
                .attr('x1', function(d) { return timeScale(d.date); })
                .attr('y1', dateTick.y)
                .attr('x2', function(d) { return timeScale(d.date); })
                .attr('y2', dateTick.y + dateTick.height);
            states.select(".date")
                .attr('x', function(d) { return timeScale(d.date) })
                .attr('y', dateBar.textPaddingY)
                .text(function(d) { return dateFormatter(d.date); });

            states.select(".label-bg").on("mouseenter", showTooltip);
            states.select(".label-bg").on("click", showTooltip);
            states.select(".label-bg").on("mouseout", function(){
                tooltipEl.style("visibility", "hidden");
            });

            //Draw completed state
            if(!data.completed && !_.isEmpty(data.states)) {
                svg.append("polygon")
                    .attr("points", (xMax + "," + stateBar.y + " " + (xMax+13) + "," +
                        (stateBar.y + stateBar.height/2) + " " + xMax + "," + (stateBar.y + stateBar.height)))
                    .attr("fill", colors(_.indexOf(uniqueStates, _.last(data.states).state)));
            }
        };

        var getDataModel = function(program) {
            var states = _.sortBy(_.map(program.states, function(stateObject) {
                return {state: stateObject.state.concept.display, date: new Date(stateObject.startDate)}
            }),'date');
            var completed = isProgramCompleted(program);
            return {states: states, completed: completed};
        };

        var isProgramCompleted = function(program){
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
    });
