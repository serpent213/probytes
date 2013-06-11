'use strict';

/* Directives */

angular.module('probytes.directives', ['probytes.charts', 'probytes.filters'])
  .directive('navbar', function($location, $timeout) {
    return {
      templateUrl: 'views/navbar.html',
      // replace: false,
      scope: true,
      link: function(scope, element /* , attrs */) {
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
          if (!scope.traffic) { return; }
          scope.serverName = scope.traffic.meta.serverName;
          scope.years = Object.keys(scope.traffic.byYear).sort(function(a, b) { return b - a; }); // sort descending
          scope.months = {};
          scope.years.forEach(function(year) {
            scope.months[year] = Object.keys(scope.traffic.byMonth[year]).sort(function(a, b) { return a - b; }); // sort ascending
          });
          scope.hostnames = scope.traffic.hostnames;
        });
      }
    };
  })
  .directive('trafficIntervalBarChart', function(Charts, $rootScope, $location) {
    return {
      scope: {dataset: '='},
      link: function(scope, element /* , attrs */) {
        scope.$watch('dataset', function() {
          if (!scope.dataset) { return; }

          var augmentedData = scope.dataset.
                map(function(d) {
                  return _(_(d).clone()).extend(
                    {avgReqSize: d.bytes / d.requests,
                     crosslink: '/host/' + d.hostname});
                });

          $rootScope.$watch('windowWidth', function(/* newVal, oldVal */) {
            Charts.horizontalBarChart(element, augmentedData, 'hostname');
            $('.yaxis-label').each(function(i, row) {
              $(row).click(function() { $location.path(augmentedData[i].crosslink); scope.$apply(); });
            });
          });
        });
      }
    };
  })
  .directive('trafficHostBarChart', function(Charts, $rootScope, $location) {
    return {
      scope: {dataset: '='},
      link: function(scope, element /* , attrs */) {
        scope.$watch('dataset', function() {
          if (!scope.dataset) { return; }

          var augmentedData = scope.dataset.
                map(function(d) {
                  return _(_(d).clone()).extend(
                    {avgReqSize: d.bytes / d.requests,
                     crosslink: '/monthly/' + d.year + '/' + d.month});
                });

          $rootScope.$watch('windowWidth', function(/* newVal, oldVal */) {
            Charts.horizontalBarChart(element, augmentedData, 'datetext');
            $('.yaxis-label').each(function(i, row) {
              $(row).click(function() { $location.path(augmentedData[i].crosslink); scope.$apply(); });
            });
          });
        });
      }
    };
  })
  .directive('trafficPieChart', function(Charts, $rootScope) {
    return {
      scope: {dataset: '='},
      link: function(scope, element /* , attrs */) {
        scope.$watch('dataset', function() {
          if (!scope.dataset) { return; }

          var data          = scope.dataset,
              totalBytes    = _(data).reduce(function(memo, host) { return memo + host.bytes; }, 0),
              totalRequests = _(data).reduce(function(memo, host) { return memo + host.requests; }, 0),
              pieData       = [],
              pieBytes      = 0,
              pieRequests   = 0,
              piePercent    = 0,
              i             = 0;

          while (pieBytes / totalBytes < 0.9) {
            var p = Math.round(data[i].bytes / totalBytes * 100);
            pieData.push(_(_(data[i]).clone()).extend({
              percent:    p,
              avgReqSize: data[i].bytes / data[i].requests,
              crosslink:  '/host/' + data[i].hostname,
            }));
            pieBytes += data[i].bytes;
            pieRequests += data[i].requests;
            piePercent += p;
            i++;
          }
          pieData.push({
            hostname: 'others',
            bytes: totalBytes - pieBytes,
            requests: totalRequests - pieRequests,
            avgReqSize: (totalBytes - pieBytes) / (totalRequests - pieRequests),
            percent: 100 - piePercent
          });

          $rootScope.$watch('windowWidth', function(/* newVal, oldVal */) {
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
      link: function(scope /* , element, attrs */) {
        scope.$watch('dataset', function() {
          if (!scope.dataset) { return; }

          scope.totalBytes    = _(scope.dataset).reduce(function(memo, host) { return memo + host.bytes; }, 0);
          scope.totalRequests = _(scope.dataset).reduce(function(memo, host) { return memo + host.requests; }, 0);
          scope.avgBitS       = scope.totalBytes * 8 / scope.intervalSeconds;
          scope.avgLoad       = scope.totalRequests / scope.intervalSeconds;
        });
      }
    };
  })
  .directive('footer', function(PROBYTES_VERSION) {
    return {
      templateUrl: 'views/footer.html',
      link: function(scope /* , element, attrs */) {
        scope.version = PROBYTES_VERSION;
        scope.$watch('traffic', function() {
          if (!scope.traffic) { return; }
          scope.timestamp = scope.traffic.meta.exportTimestamp;
        });
      }
    };
  });
