'use strict';

/* Directives */

angular.module('probytes.directives', ['probytes.charts'])
  .filter('monthName', function() {
    return function(n) {
      return ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'][n - 1];
    };
  })
  .directive('navbar', function($location) {
    return {
      templateUrl: 'views/navbar.html',
      // replace: false,
      link: function(scope, element, attrs) {
        element.addClass('navbar navbar-inverse');
        /*
        scope.$watch(function() {
          return $location.path();
        }, function(newValue, oldValue) {
          scope.location = newValue;
        });
        */
        scope.$watch('traffic', function() {
          if (!scope.traffic) return;
          scope.years = Object.keys(scope.traffic.byYear).sort(function(a, b) { return b - a }); // sort descending
          scope.months = {};
          scope.years.forEach(function(year) {
            scope.months[year] = Object.keys(scope.traffic.byMonth[year]).sort(function(a, b) { return a - b }); // sort ascending
          });
        });
      }
    };
  })
  .directive('monthlyChart', function(barChart) {
    return {
      // templateUrl: 'views/navbar.html',
      // replace: false,
      link: function(scope, element, attrs) {
        scope.$watch('traffic', function() {
          if (!scope.traffic) return;

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
