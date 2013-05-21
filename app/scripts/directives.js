'use strict';

/* Directives */

angular.module('probytes.directives', [])
  .directive('navbar', function() {
    return {
      templateUrl: 'views/navbar.html',
      // replace: false,
    };
  })
  .directive('monthlyChart', function() {
    return {
      // templateUrl: 'views/navbar.html',
      // replace: false,
      link: function(scope, element, attrs) {
        scope.$watch('trafficByMonth', function() {
          if (!scope.trafficByMonth) return '';

          var localDate = new Date(),
              localYear = localDate.getFullYear(),
              localMonth = localDate.getMonth() + 1,
              data = _(_(scope.trafficByMonth[localYear][localMonth]).
                sortBy(function(d) { return -d.bytes })).
                map(function(d) { return _(_(d).clone()).extend({ bytes: d.bytes / Math.pow(2, 30) }) });

          var margin = {top: 30, right: 45, bottom: 10, left: 220},
              rowHeight = 30,
              width = 940 - margin.left - margin.right, // 940px is Bootstrap container width
              height = (data.length * rowHeight) - margin.top - margin.bottom;

          var x = d3.scale.linear()
              .domain([0, d3.max(data, function(d) { return d.bytes })])
              .range([0, width]);

          var y = d3.scale.ordinal()
              .rangeRoundBands([0, height], .2);

          var xAxis = d3.svg.axis()
              .scale(x)
              .orient("top");

          var yAxis = d3.svg.axis()
              .orient("left");

          var svg = d3.select(element[0]).append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          // x.domain(d3.extent(data, function(d) { return d.bytes; })).nice();
          y.domain(data.map(function(d) { return d.hostname; }));

          var bars = svg.selectAll(".bar")
            .data(data);

          bars.enter().append("rect")
              .attr("class", 'bar')
              .attr("x", function(d) { return x(0); })
              .attr("y", function(d) { return y(d.hostname); })
              .attr("width", function(d) { return Math.abs(x(d.bytes) - x(0)); })
              .attr("height", y.rangeBand());

          bars.enter().append("text")
              .attr("class", "hostname")
              .attr("x", -10)
              .attr("y", function(d) { return y(d.hostname); })
              // .attr("dy", y.rangeBand() / 2)
              .attr("dy", "1.15em")
              .attr("text-anchor", "end")
              .text(function(d) { return d.hostname; });

          svg.append("g")
              .attr("class", "x axis")
              .call(xAxis);

          svg.append("text")
              .attr("class", "x axis-label")
              .attr("text-anchor", "end")
              .attr("x", width + margin.right - 5)
              .attr("y", -9)
              .text("[GiB]");

          svg.append("g")
              .attr("class", "y axis")
            .append("line")
              .attr("x1", x(0))
              .attr("x2", x(0))
              .attr("y2", height);
        });
      }
    };
  });
