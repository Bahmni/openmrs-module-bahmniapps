'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('timeline', function () {
        var link = function ($scope, $element, $attrs) {
            var svg = d3.select($element[0]).append("svg").attr('width',100+'%' ).attr('height', 110);
            var sortedDates = _.sortBy(_.pluck($scope.config.data, 'date'));
            var uniqueStates = _.uniq(_.pluck($scope.config.data, 'state'));
            var xMin = 25, parentWidth = document.getElementById('activePrograms').offsetWidth,  xMax = parentWidth - 100;

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
                .attr("transform", "translate(0.50,50)")
                .call(timeAxis)
                .selectAll("line")
                    .attr("y2", 14)
                    .attr("y1", -8)
                    .attr("x2", 0)

            var colors = d3.scale.category10();

            var states = svg.selectAll('.states').data($scope.config.data);
            states.enter().append('rect').classed('states',true);
            states.attr('x', function(d) { return timeScale(d.date); })
                .attr('y', 9)
                .attr('height', 26)
                .attr('width', function(d) {
                    return xMax-timeScale(d.date)})
                .style('fill', function(d) {return colors(_.indexOf(uniqueStates, d.state))});



            
            //Draw completed state
            if(!$scope.config.completed) {
                svg.append("polygon")
                    .attr("points", (xMax + "," + 9 + " " + (xMax+13) + "," + 22 + " " + xMax + "," + 35))
                    .attr("fill", colors(_.indexOf(uniqueStates, _.last($scope.config.data).state)));
            }

            //Draw Legend
            var legendContainer = d3.select('#'+ $attrs.id).append("div").classed("legend", true);
            var legendItems = legendContainer.selectAll(".item").data(uniqueStates);
            legendItems.enter().append("div").classed("item",true);
            legendItems.style("background-color", function(d,i) { return colors(i)})
                .text(function(d) { return d});
        };
        return {
            restrict: 'E',
            link: link,
            scope: {
                config: "="
            }
        };
    });
