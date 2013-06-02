'use strict';

/* Charting helpers */

angular.module('probytes.charts', [])
  .factory('Charts', function($filter) {
    var charts = {
      maxTextWidth: function(element, strings, classname) {
        var svg = d3.select(element[0]).append("svg")
            .attr('width', 0)
            .attr('height', 0);

        var lines = svg.append('g');
        lines.selectAll('.get-text-width')
            .data(strings)
          .enter().append('text')
            .attr('class', classname)
            .text(_.identity);

        var width = lines.node().getBBox().width;
        svg.remove();

        return width;
      },
      tooltipContent: function(entity, yAxisField) {
        return '<strong><u>' + entity[yAxisField] + '</u></strong><br>' +
          'Traffic: ' + $filter('binaryPrefix')(entity.bytes, 2)  + 'B<br>' +
          'Requests: ' + $filter('decimalPrefix')(entity.requests, 2) + '<br>' +
          'Avg. request size: ' + $filter('binaryPrefix')(entity.avgReqSize, 2) + 'B';
      },
      horizontalBarChart: function(element, data, yAxisField) {
        var elementWidth       = $(element[0]).innerWidth(),
            maxYAxisLabelWidth = charts.maxTextWidth(element, _(data).map(function(d) { return d[yAxisField] }), 'yaxis-label'),
            margin             = {top: 30, right: 45, bottom: 22, left: maxYAxisLabelWidth + 10 },
            rowHeight          = 30,
            width              = elementWidth - margin.left - margin.right,
            height             = data.length * rowHeight;

        var x = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { return d.bytes / Math.pow(2, 30) })])
            .range([0, width]);

        var x2 = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { return d.requests / 1000 })])
            .range([0, width]);

        var y = d3.scale.ordinal()
            // rangeRoundBands does produce a top margin sometimes, so rounding
            // is done further down, when setting the y attributes to avoid anti-aliasing
            .rangeBands([0, height], .22);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("top");

        var xAxis2 = d3.svg.axis()
            .scale(x2)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .orient("left");

        d3.select(element[0]).html('');
        var svg = d3.select(element[0]).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        y.domain(data.map(function(d) { return d[yAxisField]; }));

        var bars = svg.selectAll(".bar")
          .data(data);

        // bars (bytes)
        bars.enter().append("rect")
            .attr("class", 'bar-bytes')
            .attr("x", function(d) { return x(0); })
            .attr("y", function(d) { return Math.round(y(d[yAxisField])); })
            .attr("width", function(d) { return Math.abs(x(d.bytes / Math.pow(2, 30)) - x(0)); })
            .attr("height", Math.round(y.rangeBand()));

        // bars (requests)
        var halfBarHeight = Math.round(y.rangeBand() / 2);
        var quarterBarHeight = Math.round(y.rangeBand() / 4);

        var requestBars = bars.enter().append('g')
            .attr('class', 'bar-req');

        requestBars.append('line')
            .attr('x1', function(d) { return x2(0); })
            .attr('x2', function(d) { return x2(d.requests / 1000); })
            .attr('y1', function(d) { return Math.round(y(d[yAxisField])) + halfBarHeight; })
            .attr('y2', function(d) { return Math.round(y(d[yAxisField])) + halfBarHeight; });

        requestBars.append('line')
            .attr('x1', function(d) { return x2(d.requests / 1000); })
            .attr('x2', function(d) { return x2(d.requests / 1000); })
            .attr('y1', function(d) { return Math.round(y(d[yAxisField])) + halfBarHeight - quarterBarHeight; })
            .attr('y2', function(d) { return Math.round(y(d[yAxisField])) + halfBarHeight + quarterBarHeight; });

        // y axis
        bars.enter().append("text")
            .attr("class", "yaxis-label")
            .attr("x", -10)
            .attr("y", function(d) { return Math.round(y(d[yAxisField])); })
            .attr("dy", "1.15em")
            .attr("text-anchor", "end")
            .text(function(d) { return d[yAxisField]; });

        // bytes scale (x1 axis)
        svg.append("g")
            .attr("class", "x axis")
            .call(xAxis);

        svg.append("text")
            .attr("class", "x axis-label")
            .attr("x", width + 10)
            .attr("y", -9)
            .text("[GiB]");

        // requests scale (x2 axis)
        svg.append("g")
            .attr("class", "x axis")
            .attr('transform', 'translate(0, ' + (height - 0) + ')')
            .call(xAxis2);

        svg.append("text")
            .attr("class", "x axis-label")
            .attr("x", width + 10)
            .attr("y", height + 18)
            .text("[kreq]");

        // y axis
        svg.append("g")
            .attr("class", "y axis")
          .append("line")
            .attr("x1", x(0))
            .attr("x2", x(0))
            .attr("y2", height);

        // tooltips
        var rows = data.length;
        var rowBarBytes = $('.bar-bytes', element);
        var rowYAxisLabels = $('.yaxis-label', element);
        for (var i = 0; i < rows; i++) {
          (function(row) {
            function showTooltip() {
              // recreate tooltip before showing
              // otherwise show/hide alternation ends up in the wrong state when switching too fast
              $(rowBarBytes[row]).tooltip(
                {title: charts.tooltipContent(data[row], yAxisField),
                 html: true,
                 trigger: 'manual',
                 container: 'body'});
              $(rowBarBytes[row]).tooltip('show');
            }

            function hideTooltip() {
              $(rowBarBytes[row]).tooltip('destroy');
            }

            $(rowBarBytes[row]).mouseover(showTooltip);
            $(rowBarBytes[row]).mouseout(hideTooltip);
            $(rowYAxisLabels[row]).mouseover(showTooltip);
            $(rowYAxisLabels[row]).mouseout(hideTooltip);
          })(i);
        }

        $('.container').click(function() { $('.tooltip').remove(); });
      },
      pieChart: function(element, data) {
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
            .attr('class', 'percentage')
            .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
            .attr("dy", ".45em")
            .style("text-anchor", "middle")
            .text(function(d) { return d.data.percent + '%'; });

        // legend
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

        // tooltips
        var rows = data.length;
        var rowPieWedges = $('.arc', element);
        var rowPercentages = $('.percentage', element);
        for (var i = 0; i < rows; i++) {
          (function(row) {
            function showTooltip() {
              // recreate tooltip before showing
              // otherwise show/hide alternation ends up in the wrong state when switching too fast
              $(rowPercentages[row]).tooltip(
                {title: charts.tooltipContent(data[row], 'hostname'),
                 html: true,
                 trigger: 'manual',
                 container: 'body'});
              $(rowPercentages[row]).tooltip('show');
            }

            function hideTooltip() {
              $(rowPercentages[row]).tooltip('destroy');
            }

            $(rowPieWedges[row]).mouseover(showTooltip);
            $(rowPieWedges[row]).mouseout(hideTooltip);
          })(i);
        }

        $('.container').click(function() { $('.tooltip').remove(); });
      }
    };

    return charts;
  });
