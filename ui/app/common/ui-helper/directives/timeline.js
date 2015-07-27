'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('timeline', function () {
        var link = function ($scope, $element) {
            $element.addClass("timeline-view");
            var data = getDataModel($scope.program);
            var svg = d3.select($element[0]).append("svg").attr('width',100+'%' ).attr('height', 80);
            var elementDimensions = $element[0].getBoundingClientRect();
            var sortedDates = _.pluck(data.states, 'date');
            var uniqueStates = _.uniq(_.pluck(data.states, 'state'));
            var xMin = 25;
            var xMax = elementDimensions.width-35;

            var timeScale = d3.time.scale()
                .domain([sortedDates[0], new Date()])
                .range([xMin,xMax]);

            var timeAxis = d3.svg.axis()
                .orient("bottom")
                .scale(timeScale)
                .tickFormat(d3.time.format("%_d %b%y"))
                .tickValues(sortedDates)
                .tickPadding(10);

            svg.append("g")
                .attr("class", "xaxis")
                .attr("transform", "translate(0,35)")
                .call(timeAxis);

            var colors = d3.scale.category10();
            var states = svg.selectAll('.states').data(data.states);
            var stateGroup = states.enter().append("g").classed('states',true);
            stateGroup.append("rect");
            stateGroup.append("text");
            states.on("click", function(d) {
                alert(d.state);
            });
            states.select("rect")
                .attr('x', function(d) { return timeScale(d.date); })
                .attr('y', 9)
                .attr('height', 26)
                .attr('width', function(d) {return xMax-timeScale(d.date)})
                .style('fill', function(d) {return colors(_.indexOf(uniqueStates, d.state))});
            states.select("text")
                .attr('x', function(d) { return timeScale(d.date) + 10; })
                .attr('y', 27)
                .style('fill', '#FFFFFF')
                .text(function(d) { return d.state; });

            //Draw completed state
            if(!data.completed && !_.isEmpty(data.states)) {
                svg.append("polygon")
                    .attr("points", (xMax + "," + 9 + " " + (xMax+13) + "," + 22 + " " + xMax + "," + 35))
                    .attr("fill", colors(_.indexOf(uniqueStates, _.last(data.states).state)));
            }
        };

        var getDataModel = function(program) {
            var states = _.sortBy(_.map(program.states, function(stateObject) {
                return {state: stateObject.state.concept.display, date: new Date(stateObject.startDate)}
            }),'date');
            var completed = !_.isEmpty(program.dateCompleted);
            return {states: states, completed: completed};
        };

        return {
            restrict: 'E',
            link: link,
            scope: {
                program: "="
            }
        };
    });
