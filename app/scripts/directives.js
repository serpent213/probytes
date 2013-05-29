'use strict';

/* Directives */

angular.module('probytes.directives', ['probytes.charts', 'probytes.filters'])
  .directive('navbar', function($location, $timeout) {
    return {
      templateUrl: 'views/navbar.html',
      // replace: false,
      scope: true,
      link: function(scope, element, attrs) {
        element.addClass('navbar navbar-inverse');

        var setActive = function(newLocation) {
          $timeout(function() { // wait for DOM update
            // using "element" as context does not work for some reason
            $('.navbar li').removeClass('active');
            $('.navbar a[href="#' + newLocation + '"]').parents('li').addClass('active');
          }, 0);
        };

        scope.$watch(function() {
          return $location.path();
        }, setActive);
        setActive($location.path());

        scope.$watch('traffic', function() {
          if (!scope.traffic) return;
          scope.serverName = scope.traffic.meta.serverName;
          scope.years = Object.keys(scope.traffic.byYear).sort(function(a, b) { return b - a }); // sort descending
          scope.months = {};
          scope.years.forEach(function(year) {
            scope.months[year] = Object.keys(scope.traffic.byMonth[year]).sort(function(a, b) { return a - b }); // sort ascending
          });
        });
      }
    };
  })
  .directive('trafficBarChart', function(barChart, $rootScope) {
    return {
      scope: {dataset: '='},
      link: function(scope, element, attrs) {
        scope.$watch('dataset', function() {
          if (!scope.dataset) return;

          var niceData = _(_(scope.dataset).
                sortBy(function(d) { return -d.bytes })).
                map(function(d) { return _(_(d).clone()).extend({ bytes: d.bytes / Math.pow(2, 30) }) });

          $rootScope.$watch('windowWidth', function(newVal, oldVal) {
            barChart(element, niceData);
          });
        });
      }
    };
  })
  .directive('trafficPieChart', function(pieChart, $rootScope) {
    return {
      scope: {dataset: '='},
      link: function(scope, element, attrs) {
        scope.$watch('dataset', function() {
          if (!scope.dataset) return;

          var data = _(_(scope.dataset).
                sortBy(function(d) { return -d.bytes })).
                map(function(d) { return _(_(d).clone()).extend({ bytes: d.bytes / Math.pow(2, 30) }) }),
              totalGiB = _(data).reduce(function(memo, host) { return memo + host.bytes }, 0),
              pieData = [],
              pieGiB = 0,
              i = 0;

          while (pieGiB / totalGiB < 0.9) {
            pieData.push(data[i]);
            pieGiB += data[i].bytes;
            i++;
          }
          pieData.push({hostname: 'others', bytes: totalGiB - pieGiB});

          $rootScope.$watch('windowWidth', function(newVal, oldVal) {
            pieChart(element, pieData);
          });
        });
      }
    };
  })
  .directive('totalsTable', function() {
    return {
      templateUrl: 'views/totals_table.html',
      scope: {dataset: '=',
              intervalSeconds: '='},
      link: function(scope, element, attrs) {
        scope.$watch('dataset', function() {
          if (!scope.dataset) return;

          var data = _(scope.dataset).
                map(function(d) { return _(_(d).clone()).extend({ bytes: d.bytes / Math.pow(2, 30) }) });

          scope.totalGiB      = _(data).reduce(function(memo, host) { return memo + host.bytes }, 0);
          scope.totalRequests = _(data).reduce(function(memo, host) { return memo + host.requests }, 0);
          scope.avgMbitS      = scope.totalGiB * 1024 * 8 / scope.intervalSeconds;
          scope.avgLoad       = scope.totalRequests / scope.intervalSeconds;
        });
      }
    };
  });
