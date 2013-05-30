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

        $timeout(function() { // wait for DOM update
          // avoid navigating to "#"
          $('.navbar .dropdown-toggle').click(function(e) { e.preventDefault(); });
        }, 0);

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
  .directive('trafficBarChart', function(Charts, $rootScope) {
    return {
      scope: {dataset: '='},
      link: function(scope, element, attrs) {
        scope.$watch('dataset', function() {
          if (!scope.dataset) return;

          var niceData = _(_(scope.dataset).
                sortBy(function(d) { return -d.bytes })).
                map(function(d) { return _(_(d).clone()).extend(
                  {bytes:      d.bytes / Math.pow(2, 30),
                   requests:   d.requests / 1000,
                   avgReqSize: d.bytes / d.requests}
                )});

          $rootScope.$watch('windowWidth', function(newVal, oldVal) {
            Charts.horizontalBarChart(element, niceData);
          });
        });
      }
    };
  })
  .directive('trafficPieChart', function(Charts, $rootScope) {
    return {
      scope: {dataset: '='},
      link: function(scope, element, attrs) {
        scope.$watch('dataset', function() {
          if (!scope.dataset) return;

          var data       = _(_(scope.dataset).
                sortBy(function(d) { return -d.bytes })).
                map(function(d) { return _(_(d).clone()).extend({ bytes: d.bytes / Math.pow(2, 30) }) }),
              totalGiB   = _(data).reduce(function(memo, host) { return memo + host.bytes }, 0),
              pieData    = [],
              pieGiB     = 0,
              piePercent = 0,
              i          = 0;

          while (pieGiB / totalGiB < 0.9) {
            var p = Math.round(data[i].bytes / totalGiB * 100);
            pieData.push(_(_(data[i]).clone()).extend({ percent: p }));
            pieGiB += data[i].bytes;
            piePercent += p;
            i++;
          }
          pieData.push({hostname: 'others', bytes: totalGiB - pieGiB, percent: 100 - piePercent});

          $rootScope.$watch('windowWidth', function(newVal, oldVal) {
            Charts.pieChart(element, pieData);
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
  })
  .directive('footer', function(PROBYTES_VERSION) {
    return {
      templateUrl: 'views/footer.html',
      link: function(scope, element, attrs) {
        scope.version = PROBYTES_VERSION;
        scope.$watch('traffic', function() {
          if (!scope.traffic) return;
          scope.timestamp = scope.traffic.meta.exportTimestamp;
        });
      }
    };
  });
