'use strict';

/* Charting helpers */

angular.module('probytes.charts', [])
  .value('barChart', function(element, data) {
    var maxTextWidth = function(strings, className) {
      var svg = d3.select(element[0]).append("svg")
          .attr('width', 0)
          .attr('height', 0);

      var lines = svg.append('g');
      lines.selectAll('.get-text-width')
          .data(strings)
        .enter().append('text')
          .attr('class', className)
          .text(_.identity);

      var width = lines.node().getBBox().width;
      svg.remove();

      return width;
    };

    var elementWidth     = $(element[0]).innerWidth(),
        maxHostnameWidth = maxTextWidth(_(data).map(function(d) { return d.hostname }), 'hostname'),
        margin           = {top: 30, right: 45, bottom: 0, left: maxHostnameWidth + 10 },
        rowHeight        = 30,
        width            = elementWidth - margin.left - margin.right,
        height           = (data.length * rowHeight) - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { return d.bytes })])
        .range([0, width]);

    var y = d3.scale.ordinal()
        // rangeRoundBands does produce a top margin sometimes, so rounding
        // is done further down, when setting the y attributes to avoid anti-aliasing
        .rangeBands([0, height], .22);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("top");

    var yAxis = d3.svg.axis()
        .orient("left");

    d3.select(element[0]).html('');
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
        .attr("y", function(d) { return Math.round(y(d.hostname)); })
        .attr("width", function(d) { return Math.abs(x(d.bytes) - x(0)); })
        .attr("height", y.rangeBand());

    bars.enter().append("text")
        .attr("class", "hostname")
        .attr("x", -10)
        .attr("y", function(d) { return Math.round(y(d.hostname)); })
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
  })
  .value('pieChart', function(element, data) {
    var elementWidth    = $(element[0]).innerWidth(),
        width           = elementWidth,
        chartHeight     = elementWidth,
        legendTopMargin = 16,
        legendRowHeight = 25,
        legendBoxSize   = 15,
        legendHeight    = legendTopMargin + (data.length * legendRowHeight),
        radius          = Math.min(width, chartHeight) / 2;

    var color = d3.scale.ordinal()
        .range(["#a05d56", "#d0743c", "#ff8c00", "#98abc5", "#8a89a6", "#7b6888", "#6b486b"]);

    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.bytes; });

    d3.select(element[0]).html('');
    var svg = d3.select(element[0]).append("svg")
        .attr("width", width)
        .attr("height", chartHeight + legendHeight - 10);

    var chart = svg.append("g")
        .attr("transform", "translate(" + width / 2 + "," + chartHeight / 2 + ")");

    var arcs = chart.selectAll(".arc")
        .data(pie(data));

    arcs.enter().append("g")
        .attr("class", "arc")
      .append("path")
        .attr("d", arc)
        .style("fill", function(d) { return color(d.data.hostname); })
        .style("stroke", "#eee");

    arcs.enter().append("g")
        .attr("class", "arc")
      .append("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", ".45em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.data.percent + '%'; });

    var legend = svg.append("g")
        .attr('transform', 'translate(10, ' + (chartHeight + legendTopMargin) + ')');

    var legendRows = legend.selectAll('.legendRow')
        .data(pie(data));

    legendRows.enter()
        .append('rect')
        .attr('width', legendBoxSize)
        .attr('height', legendBoxSize)
        .attr('y', function(d, i) { return i * legendRowHeight; })
        .style("fill", function(d) { return color(d.data.hostname); });

    legendRows.enter()
        .append('text')
        .attr('x', 30)
        .attr('y', function(d, i) { return i * legendRowHeight + legendBoxSize; })
        .attr('dy', '-0.2em')
        .text(function(d) { return d.data.hostname; });
  });
