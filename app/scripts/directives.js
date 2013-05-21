'use strict';

/* Directives */

angular.module('probytes.directives', ['probytes.charts'])
  .directive('navbar', function() {
    return {
      templateUrl: 'views/navbar.html',
      // replace: false,
    };
  })
  .directive('monthlyChart', function(barChart) {
    return {
      // templateUrl: 'views/navbar.html',
      // replace: false,
      link: function(scope, element, attrs) {
        scope.$watch('traffic', function() {
          if (!scope.traffic) return '';

          var data = _(_(scope.traffic.byMonth[scope.year][scope.month]).
                sortBy(function(d) { return -d.bytes })).
                map(function(d) { return _(_(d).clone()).extend({ bytes: d.bytes / Math.pow(2, 30) }) });

          barChart(element, data);
        });
      }
    };
  })
  .directive('yearlyChart', function(barChart) {
    return {
      // templateUrl: 'views/navbar.html',
      // replace: false,
      link: function(scope, element, attrs) {
        scope.$watch('traffic', function() {
          if (!scope.traffic) return '';

          var data = _(_(scope.traffic.byYear[scope.year]).
                sortBy(function(d) { return -d.bytes })).
                map(function(d) { return _(_(d).clone()).extend({ bytes: d.bytes / Math.pow(2, 30) }) });

          barChart(element, data);
        });
      }
    };
  });
